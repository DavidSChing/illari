import type { Cita, Fase, Medico, OrigenDato, Paciente } from "@/data/tipos";
import { leerFecha, normalizarNombre, textoPlano, SIN_MAPEAR, type Mapeo } from "./mapeo";

export interface AtencionExcel {
  clave: string;
  hc: string;
  fila: number;
  fecha: string;
  fechaOriginal: string;
  nombre: string;
  nombreOriginal: string;
  medico: string;
  medicoOriginal: string;
  proximaCita: string | null;
  proximaCitaOriginal: string;
  hora: string;
}

export interface Discrepancia {
  clave: string;
  hc: string;
  nombre: string;
  fecha: string;
  versiones: AtencionExcel[];
}

export interface ProblemaFila {
  fila: number;
  motivo: string;
  detalle: string;
}

export interface PacienteConsolidado {
  hc: string;
  nombre: string;
  nombreOriginal: string;
  atenciones: AtencionExcel[];
  cicloActual: number;
  ultimaAtencion: string;
  diasDesdeUltimaAtencion: number;
  proximaCita: string | null;
  medicos: string[];
  medicoPrincipal: string;
  filaOrigen: number;
}

export type TipoVacio =
  | "sin_atencion_reciente"
  | "sin_proxima_cita"
  | "cita_vencida"
  | "discrepancia";

export interface Vacio {
  tipo: TipoVacio;
  titulo: string;
  detalle: string;
  pacienteId: string | null;
  filas: number[];
}

export interface ResultadoCarga {
  archivo: string;
  fechaCarga: string;
  hoy: string;
  filasLeidas: number;
  atenciones: AtencionExcel[];
  pacientes: PacienteConsolidado[];
  discrepancias: Discrepancia[];
  problemas: ProblemaFila[];
  vacios: Vacio[];
  medicos: Medico[];
  pacientesApp: Paciente[];
  citas: Cita[];
}

/** Días máximos sin atención tolerados según la fase; sin fase registrada, criterio general. */
export const DIAS_MAXIMOS_POR_FASE: Record<Fase | "Sin fase registrada", number> = {
  Inducción: 14,
  Consolidación: 21,
  Intensificación: 21,
  Mantenimiento: 35,
  "Sin fase registrada": 30,
};

export const idPacienteExcel = (hc: string): string => `hc-${hc.replace(/\s+/g, "")}`;

export const idMedicoExcel = (nombre: string): string =>
  `medx-${nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()}`;

const diferenciaEnDias = (desdeIso: string, hastaIso: string): number =>
  Math.round((Date.parse(`${hastaIso}T00:00:00Z`) - Date.parse(`${desdeIso}T00:00:00Z`)) / 86400000);

function mismaVersion(a: AtencionExcel, b: AtencionExcel): boolean {
  return (
    a.nombre === b.nombre &&
    a.medico === b.medico &&
    (a.proximaCita ?? "") === (b.proximaCita ?? "") &&
    a.hora === b.hora
  );
}

/**
 * Consolida las filas del Excel sin modificarlo ni decidir nada:
 * agrupa por paciente, ordena cronológicamente y señala lo que requiere revisión humana.
 */
export function consolidar(
  filas: unknown[][],
  mapeo: Mapeo,
  contexto: { archivo: string; fechaCarga: string; hoy: string; filaCabecera: number },
): ResultadoCarga {
  const atenciones: AtencionExcel[] = [];
  const problemas: ProblemaFila[] = [];
  let filasLeidas = 0;

  const columna = (fila: unknown[], indice: number): unknown =>
    indice === SIN_MAPEAR ? "" : fila[indice];

  filas.forEach((fila, desplazamiento) => {
    const numeroFila = contexto.filaCabecera + 2 + desplazamiento;
    const vacia = fila.every((celda) => textoPlano(celda) === "");
    if (vacia) return;
    filasLeidas += 1;

    const hc = textoPlano(columna(fila, mapeo.hc));
    const nombreOriginal = textoPlano(columna(fila, mapeo.paciente));
    const medicoOriginal = textoPlano(columna(fila, mapeo.medico));
    const fechaLeida = leerFecha(columna(fila, mapeo.fecha));
    const proxima = leerFecha(columna(fila, mapeo.proximaCita));
    const hora = textoPlano(columna(fila, mapeo.hora));

    if (!hc) {
      problemas.push({
        fila: numeroFila,
        motivo: "Paciente no reconocido",
        detalle: `Sin número de historia clínica. Nombre en el archivo: “${nombreOriginal || "vacío"}”.`,
      });
      return;
    }
    if (!fechaLeida.iso) {
      problemas.push({
        fila: numeroFila,
        motivo: fechaLeida.original ? "Fecha no interpretable" : "Campo vacío",
        detalle: fechaLeida.original
          ? `Fecha de atención “${fechaLeida.original}” no tiene un formato reconocible.`
          : "La fila no tiene fecha de atención.",
      });
      return;
    }
    if (fechaLeida.ambigua) {
      problemas.push({
        fila: numeroFila,
        motivo: "Fecha ambigua",
        detalle: `“${fechaLeida.original}” se interpretó como día/mes. Requiere revisión del equipo médico.`,
      });
    }
    if (proxima.original && !proxima.iso) {
      problemas.push({
        fila: numeroFila,
        motivo: "Fecha no interpretable",
        detalle: `Próxima cita “${proxima.original}” no tiene un formato reconocible.`,
      });
    }
    if (!nombreOriginal) {
      problemas.push({
        fila: numeroFila,
        motivo: "Campo vacío",
        detalle: `La historia clínica ${hc} no tiene nombre de paciente en esta fila.`,
      });
    }
    if (!medicoOriginal) {
      problemas.push({
        fila: numeroFila,
        motivo: "Campo vacío",
        detalle: `La atención del ${fechaLeida.iso} (HC ${hc}) no indica qué médico atendió.`,
      });
    }

    atenciones.push({
      clave: `${hc}|${fechaLeida.iso}`,
      hc,
      fila: numeroFila,
      fecha: fechaLeida.iso,
      fechaOriginal: fechaLeida.original,
      nombre: normalizarNombre(nombreOriginal),
      nombreOriginal,
      medico: normalizarNombre(medicoOriginal),
      medicoOriginal,
      proximaCita: proxima.iso,
      proximaCitaOriginal: proxima.original,
      hora,
    });
  });

  // Discrepancias: misma clave con datos distintos. No se elige ninguna versión.
  const porClave = new Map<string, AtencionExcel[]>();
  for (const atencion of atenciones) {
    porClave.set(atencion.clave, [...(porClave.get(atencion.clave) ?? []), atencion]);
  }

  const discrepancias: Discrepancia[] = [];
  const clavesEnConflicto = new Set<string>();
  for (const [clave, versiones] of porClave) {
    if (versiones.length < 2) continue;
    const base = versiones[0]!;
    if (versiones.every((version) => mismaVersion(base, version))) continue;
    clavesEnConflicto.add(clave);
    discrepancias.push({
      clave,
      hc: base.hc,
      nombre: base.nombre,
      fecha: base.fecha,
      versiones,
    });
  }

  // Agrupación por paciente, en orden cronológico.
  const porPaciente = new Map<string, AtencionExcel[]>();
  for (const atencion of atenciones) {
    porPaciente.set(atencion.hc, [...(porPaciente.get(atencion.hc) ?? []), atencion]);
  }

  const pacientes: PacienteConsolidado[] = [];
  for (const [hc, lista] of porPaciente) {
    const ordenadas = [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.fila - b.fila);
    const unicas = ordenadas.filter(
      (atencion, indice, todas) => todas.findIndex((otra) => otra.clave === atencion.clave) === indice,
    );
    const ultima = unicas[unicas.length - 1]!;
    const conNombre = [...unicas].reverse().find((atencion) => atencion.nombre) ?? ultima;

    const conteoMedicos = new Map<string, number>();
    for (const atencion of unicas) {
      if (!atencion.medico) continue;
      conteoMedicos.set(atencion.medico, (conteoMedicos.get(atencion.medico) ?? 0) + 1);
    }
    const medicosOrdenados = [...conteoMedicos.entries()].sort((a, b) => b[1] - a[1]);
    const medicoPrincipal = medicosOrdenados[0]?.[0] ?? "";

    const proximaCita =
      [...unicas].reverse().find((atencion) => atencion.proximaCita)?.proximaCita ?? null;

    pacientes.push({
      hc,
      nombre: conNombre.nombre || `HC ${hc}`,
      nombreOriginal: conNombre.nombreOriginal,
      atenciones: unicas,
      cicloActual: unicas.length,
      ultimaAtencion: ultima.fecha,
      diasDesdeUltimaAtencion: diferenciaEnDias(ultima.fecha, contexto.hoy),
      proximaCita,
      medicos: [...conteoMedicos.keys()],
      medicoPrincipal,
      filaOrigen: ultima.fila,
    });
  }

  pacientes.sort((a, b) => a.nombre.localeCompare(b.nombre, "es-PE"));

  // Médicos derivados del propio archivo.
  const nombresMedicos = [...new Set(pacientes.flatMap((paciente) => paciente.medicos))].sort((a, b) =>
    a.localeCompare(b, "es-PE"),
  );
  const medicos: Medico[] = nombresMedicos.map((nombre) => ({
    id: idMedicoExcel(nombre),
    nombre,
    especialidad: "Registrado en el Excel",
  }));

  const origenDe = (fila: number): OrigenDato => ({
    archivo: contexto.archivo,
    fila,
    fechaCarga: contexto.fechaCarga,
  });

  const pacientesApp: Paciente[] = pacientes.map((paciente) => {
    const ultimaAtencion = paciente.atenciones[paciente.atenciones.length - 1]!;
    const medicoSoporte = paciente.medicos.find((nombre) => nombre !== paciente.medicoPrincipal);
    return {
      id: idPacienteExcel(paciente.hc),
      hc: paciente.hc,
      nombre: paciente.nombre,
      nombreOriginal: paciente.nombreOriginal,
      edad: 0,
      sexo: "Femenino",
      procedencia: null,
      horasDeViaje: 0,
      diagnostico: "No registrado en el Excel",
      protocolo: "No registrado en el Excel",
      fase: null,
      cicloActual: paciente.cicloActual,
      ciclosTotales: null,
      fechaUltimaAtencion: paciente.ultimaAtencion,
      fechaProximaCita: paciente.proximaCita ?? "",
      ultimaAdministracion: null,
      laboratorio: null,
      alertas: [],
      medicoPrincipalId: paciente.medicoPrincipal ? idMedicoExcel(paciente.medicoPrincipal) : "",
      medicoSoporteId: medicoSoporte ? idMedicoExcel(medicoSoporte) : "",
      atendidoUltimaVezPorId: ultimaAtencion.medico ? idMedicoExcel(ultimaAtencion.medico) : "",
      inasistenciasPrevias: 0,
      proximoPasoSugerido:
        "El Excel no registra un próximo paso. La plataforma no sugiere conductas clínicas: la decisión es del equipo médico.",
      desdeExcel: true,
      origen: origenDe(paciente.filaOrigen),
      diasDesdeUltimaAtencion: paciente.diasDesdeUltimaAtencion,
      medicosQueLoAtendieron: paciente.medicos,
    };
  });

  const citas: Cita[] = pacientes
    .filter((paciente) => paciente.proximaCita)
    .sort((a, b) => (a.proximaCita ?? "").localeCompare(b.proximaCita ?? ""))
    .map((paciente, indice) => {
      const conHora = [...paciente.atenciones].reverse().find((atencion) => atencion.hora);
      return {
        id: `cita-excel-${indice + 1}`,
        pacienteId: idPacienteExcel(paciente.hc),
        hora: conHora?.hora || "—",
        duracionMinutos: 0,
        motivo: `Próxima cita registrada: ${paciente.proximaCita}`,
      };
    });

  const vacios = detectarVacios(pacientes, discrepancias, contexto.hoy);

  return {
    archivo: contexto.archivo,
    fechaCarga: contexto.fechaCarga,
    hoy: contexto.hoy,
    filasLeidas,
    atenciones,
    pacientes,
    discrepancias,
    problemas,
    vacios,
    medicos,
    pacientesApp,
    citas,
  };
}

/** Señala vacíos para que una persona los revise. La plataforma nunca actúa sola. */
export function detectarVacios(
  pacientes: PacienteConsolidado[],
  discrepancias: Discrepancia[],
  hoy: string,
): Vacio[] {
  const vacios: Vacio[] = [];
  const limite = DIAS_MAXIMOS_POR_FASE["Sin fase registrada"];

  for (const paciente of pacientes) {
    const pacienteId = idPacienteExcel(paciente.hc);

    if (paciente.diasDesdeUltimaAtencion > limite) {
      vacios.push({
        tipo: "sin_atencion_reciente",
        titulo: `${paciente.nombre}: ${paciente.diasDesdeUltimaAtencion} días sin atención registrada`,
        detalle: `Última atención el ${paciente.ultimaAtencion}. El Excel no registra la fase, por eso se usa el criterio general de ${limite} días.`,
        pacienteId,
        filas: [paciente.filaOrigen],
      });
    }

    const sinProxima = paciente.atenciones.filter((atencion) => !atencion.proximaCita);
    if (sinProxima.length > 0) {
      vacios.push({
        tipo: "sin_proxima_cita",
        titulo: `${paciente.nombre}: ${sinProxima.length} atención(es) sin próxima cita anotada`,
        detalle: `Filas del archivo: ${sinProxima.map((atencion) => atencion.fila).join(", ")}.`,
        pacienteId,
        filas: sinProxima.map((atencion) => atencion.fila),
      });
    }

    if (
      paciente.proximaCita &&
      paciente.proximaCita < hoy &&
      paciente.ultimaAtencion < paciente.proximaCita
    ) {
      vacios.push({
        tipo: "cita_vencida",
        titulo: `${paciente.nombre}: su cita del ${paciente.proximaCita} ya pasó y no hay registro posterior`,
        detalle: "Puede tratarse de una inasistencia o de un registro pendiente en el Excel.",
        pacienteId,
        filas: [paciente.filaOrigen],
      });
    }
  }

  for (const discrepancia of discrepancias) {
    vacios.push({
      tipo: "discrepancia",
      titulo: `${discrepancia.nombre}: dos versiones distintas del ${discrepancia.fecha}`,
      detalle: `Requiere revisión del equipo médico. Filas ${discrepancia.versiones
        .map((version) => version.fila)
        .join(" y ")}.`,
      pacienteId: idPacienteExcel(discrepancia.hc),
      filas: discrepancia.versiones.map((version) => version.fila),
    });
  }

  return vacios;
}
