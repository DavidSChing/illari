import { pacientes } from "./pacientes";
import { nombreMedico } from "./medicos";

/**
 * Planilla cruda tipo Excel usada solo en la demostración comparativa.
 * 200 filas × 25 columnas, con los 12 pacientes sintéticos mezclados entre filas de relleno.
 * Todos los datos son inventados.
 */

export const COLUMNAS_PLANILLA = [
  "N°",
  "HIST_CLIN",
  "APELLIDOS_NOMBRES",
  "DNI",
  "F_NAC",
  "EDAD",
  "SEXO",
  "DEPARTAMENTO",
  "DISTRITO",
  "SIS",
  "DX_CIE10",
  "DIAGNOSTICO",
  "PROTOCOLO",
  "FASE_TTO",
  "CICLO",
  "TOT_CICLOS",
  "F_ULT_ATEN",
  "F_PROX_CITA",
  "MEDICAMENTO",
  "DOSIS",
  "NEUTROF",
  "PLAQ",
  "HB",
  "OBSERVACIONES",
  "MED_TRATANTE",
] as const;

export type FilaPlanilla = string[];

const APELLIDOS = [
  "QUISPE","MAMANI","HUAMAN","CHOQUE","CONDORI","FLORES","VASQUEZ","ROJAS","CCAHUANA","PAUCAR",
  "ZEVALLOS","TICONA","APAZA","LLANOS","SUCLUPE","CHAVEZ","BENITES","YARLEQUE","HINOSTROZA","PALOMINO",
];
const NOMBRES = [
  "JOSE LUIS","MARIA ELENA","CARLOS","ANDREA","LUIS ALBERTO","SOFIA","MIGUEL","ROSA","JUAN","CAMILA",
  "DIEGO","VALERIA","RENZO","LUCIA","FERNANDO","PAOLA","ALVARO","NOELIA","SEBASTIAN","MILAGROS",
];
const DEPARTAMENTOS = ["LIMA","CUSCO","PUNO","JUNIN","ANCASH","LORETO","PIURA","AYACUCHO","HUANUCO","CAJAMARCA"];
const DISTRITOS = ["SAN BORJA","EL AGUSTINO","ATE","SJL","COMAS","WANCHAQ","JULIACA","HUANCAYO","CHIMBOTE","BELEN"];
const DX = [
  ["C91.0", "LEUCEMIA LINFOBLASTICA AGUDA"],
  ["C92.0", "LEUCEMIA MIELOIDE AGUDA"],
  ["C83.9", "LINFOMA NO HODGKIN"],
  ["D61.9", "ANEMIA APLASICA"],
];
const PROTOCOLOS = ["PETHEMA-LAL", "AIEOP-BFM 2017", "LMA-INSN 2021", "NHL-BFM 95"];
const FASES = ["INDUCCION", "CONSOLIDACION", "INTENSIFICACION", "MANTENIMIENTO"];
const MEDICAMENTOS = ["VINCRISTINA","METOTREXATO","CITARABINA","DAUNORRUBICINA","MERCAPTOPURINA","ASPARAGINASA","CICLOFOSFAMIDA"];
const OBS = [
  "CONTROL DE RUTINA","PENDIENTE HEMOGRAMA","SE INDICA REPOSO","TRANSFUSION PREVIA","SIN NOVEDAD",
  "REPROGRAMADO POR VIAJE","FAMILIA ALOJADA EN ALBERGUE","EVALUAR TOLERANCIA","",
];
const MEDICOS_PLANILLA = [
  "CCAHUANA R.","BENDEZU J.","RAMOS E.","YUPANQUI A.","LOAYZA C.","INTERCONSULTA","TURNO",
];

/** Generador congruencial lineal: mismas filas en cada render y en cada demostración. */
function generador(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return estado / 2147483648;
  };
}

const pad = (numero: number, largo: number) => String(numero).padStart(largo, "0");

function filaDeRelleno(indice: number, aleatorio: () => number): FilaPlanilla {
  const dx = DX[Math.floor(aleatorio() * DX.length)]!;
  const edad = 2 + Math.floor(aleatorio() * 16);
  const ciclos = 4 + Math.floor(aleatorio() * 6);
  const ciclo = 1 + Math.floor(aleatorio() * ciclos);
  const mes = 1 + Math.floor(aleatorio() * 8);
  const dia = 1 + Math.floor(aleatorio() * 28);
  return [
    String(indice + 1),
    `HC-${pad(40100 + Math.floor(aleatorio() * 8000), 5)}`,
    `${APELLIDOS[Math.floor(aleatorio() * APELLIDOS.length)]} ${APELLIDOS[Math.floor(aleatorio() * APELLIDOS.length)]}, ${NOMBRES[Math.floor(aleatorio() * NOMBRES.length)]}`,
    pad(Math.floor(aleatorio() * 99999999), 8),
    `${pad(dia, 2)}/${pad(mes, 2)}/${2026 - edad}`,
    String(edad),
    aleatorio() > 0.5 ? "M" : "F",
    DEPARTAMENTOS[Math.floor(aleatorio() * DEPARTAMENTOS.length)]!,
    DISTRITOS[Math.floor(aleatorio() * DISTRITOS.length)]!,
    aleatorio() > 0.25 ? "SI" : "NO",
    dx[0]!,
    dx[1]!,
    PROTOCOLOS[Math.floor(aleatorio() * PROTOCOLOS.length)]!,
    FASES[Math.floor(aleatorio() * FASES.length)]!,
    String(ciclo),
    String(ciclos),
    `${pad(dia, 2)}/${pad(mes, 2)}/2026`,
    `${pad(1 + Math.floor(aleatorio() * 28), 2)}/${pad(mes + 1, 2)}/2026`,
    MEDICAMENTOS[Math.floor(aleatorio() * MEDICAMENTOS.length)]!,
    `${(0.5 + aleatorio() * 3).toFixed(1)} mg/m2`,
    String(200 + Math.floor(aleatorio() * 3200)),
    String(40 + Math.floor(aleatorio() * 320)),
    (7 + aleatorio() * 6).toFixed(1),
    OBS[Math.floor(aleatorio() * OBS.length)]!,
    MEDICOS_PLANILLA[Math.floor(aleatorio() * MEDICOS_PLANILLA.length)]!,
  ];
}

const invertirFecha = (iso: string) => {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
};

function filaDePaciente(indice: number, pacienteIndice: number): FilaPlanilla {
  const paciente = pacientes[pacienteIndice]!;
  const dx = DX.find(([, nombre]) => nombre === paciente.diagnostico.toUpperCase()) ?? DX[0]!;
  const [apellido = "", ...resto] = paciente.nombre.toUpperCase().split(" ").reverse();
  return [
    String(indice + 1),
    `HC-${pad(41000 + pacienteIndice * 37, 5)}`,
    `${apellido}, ${resto.reverse().join(" ")}`,
    pad(70000000 + pacienteIndice * 131317, 8),
    `01/0${1 + (pacienteIndice % 8)}/${2026 - paciente.edad}`,
    String(paciente.edad),
    paciente.sexo === "Masculino" ? "M" : "F",
    paciente.procedencia.region.toUpperCase(),
    paciente.procedencia.ciudad.toUpperCase(),
    "SI",
    dx[0]!,
    paciente.diagnostico.toUpperCase(),
    paciente.protocolo.toUpperCase(),
    paciente.fase.toUpperCase().replace("Ó", "O").replace("Ú", "U"),
    String(paciente.cicloActual),
    String(paciente.ciclosTotales),
    invertirFecha(paciente.fechaUltimaAtencion),
    invertirFecha(paciente.fechaProximaCita),
    paciente.ultimaAdministracion.medicamento.toUpperCase(),
    paciente.ultimaAdministracion.dosis,
    String(paciente.laboratorio.neutrofilos),
    String(paciente.laboratorio.plaquetas),
    String(paciente.laboratorio.hemoglobina),
    paciente.alertas.length ? paciente.alertas.join(" / ").toUpperCase() : "SIN NOVEDAD",
    nombreMedico(paciente.medicoPrincipalId).replace(/^Dra?\.\s*/, "").toUpperCase(),
  ];
}

/** Posiciones donde se intercalan los 12 pacientes sintéticos entre las filas de relleno. */
const POSICIONES = [7, 23, 41, 58, 76, 94, 112, 137, 149, 163, 178, 191];

/** Fila donde aparece Mateo Quispe (pac-01), el caso trazador de la demostración. */
export const FILA_MATEO = POSICIONES[7]!;

export const filasPlanilla: FilaPlanilla[] = (() => {
  const aleatorio = generador(20260814);
  return Array.from({ length: 200 }, (_, indice) => {
    const posicion = POSICIONES.indexOf(indice);
    if (posicion >= 0) {
      // Mateo Quispe (pac-01) va en la posición 137 para que no salte a la vista.
      const pacienteIndice = posicion === 7 ? 0 : posicion < 7 ? posicion + 1 : posicion;
      return filaDePaciente(indice, Math.min(pacienteIndice, pacientes.length - 1));
    }
    return filaDeRelleno(indice, aleatorio);
  });
})();
