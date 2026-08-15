import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { pacientes as pacientesIniciales } from "@/data/pacientes";
import { medicos as medicosIniciales } from "@/data/medicos";
import { citasDeHoy } from "@/data/agenda";
import type { Cita, Medico, Paciente } from "@/data/tipos";
import { numerosInicialesDe, type NumeroSms } from "@/data/numerosSms";
import type { ResultadoCarga } from "@/lib/excel/consolidar";
import {
  OPCIONES_POR_DEFECTO,
  aProgramable,
  horasPorPaciente,
  programarCitas,
  type AjustesManuales,
  type ResultadoProgramacion,
} from "@/lib/programacion";

export const ALERTA_FIEBRE_FAMILIA = "Fiebre reportada por la familia";

/** Un ajuste manual del equipo asistencial sobre la propuesta automática. */
export interface CambioProgramacion {
  id: string;
  /** HH:mm en que se hizo el ajuste. */
  hora: string;
  accion: string;
}

export type ConfigProgramacion = Omit<ResultadoProgramacion["opciones"], "ajustes">;


export interface RegistroAtencion {
  id: string;
  pacienteId: string;
  medicoId: string;
  queSeHizo: string;
  observaciones: string;
  fechaProximaCita: string;
  fecha: string;
}

export type AsistenciaFamilia = "sin_responder" | "confirmado" | "no_asistira";

export interface RespuestaFamilia {
  asistencia: AsistenciaFamilia;
  motivo?: string;
  fiebreReportada: boolean;
}

const RESPUESTA_VACIA: RespuestaFamilia = { asistencia: "sin_responder", fiebreReportada: false };

interface EstadoClinicoValor {
  pacientes: Paciente[];
  medicos: Medico[];
  citas: Cita[];
  nombreMedico: (id: string) => string;
  /** Resultado de la última carga de Excel (solo lectura sobre el archivo). */
  carga: ResultadoCarga | null;
  aplicarCarga: (resultado: ResultadoCarga) => void;
  limpiarCarga: () => void;
  medicoActualId: string;
  setMedicoActualId: (id: string) => void;
  atenciones: RegistroAtencion[];
  registrarAtencion: (registro: Omit<RegistroAtencion, "id" | "fecha">) => void;
  obtenerPaciente: (id: string) => Paciente | undefined;
  atencionesDePaciente: (pacienteId: string) => RegistroAtencion[];
  reasignarPrincipal: (cambios: { pacienteId: string; aMedicoId: string }[]) => void;
  respuestaFamilia: (pacienteId: string) => RespuestaFamilia;
  confirmarAsistencia: (pacienteId: string) => void;
  cancelarAsistencia: (pacienteId: string, motivo: string) => void;
  reportarFiebre: (pacienteId: string) => void;
  // --- Programación de clínica de día ---
  configProgramacion: ConfigProgramacion;
  setConfigProgramacion: (parcial: Partial<ConfigProgramacion>) => void;
  programacion: ResultadoProgramacion;
  ajustesProgramacion: AjustesManuales;
  cambiosProgramacion: CambioProgramacion[];
  moverABloque: (pacienteId: string, indiceBloque: number) => void;
  fijarEnBloque: (pacienteId: string, indiceBloque: number) => void;
  liberarPaciente: (pacienteId: string) => void;
  excluirPaciente: (pacienteId: string, motivo: string) => void;
  cambiarMotivoExclusion: (pacienteId: string, motivo: string) => void;
  reincluirPaciente: (pacienteId: string) => void;
  // --- Números para recordatorios por SMS (solo en memoria) ---
  numerosSms: (pacienteId: string) => NumeroSms[];
  agregarNumeroSms: (pacienteId: string, etiqueta: string, numero: string) => void;
  editarNumeroSms: (pacienteId: string, id: string, etiqueta: string, numero: string) => void;
  alternarNumeroSms: (pacienteId: string, id: string) => void;
  eliminarNumeroSms: (pacienteId: string, id: string) => void;
  /** Hora propuesta para el paciente en la programación vigente. */
  horaPropuesta: (pacienteId: string) => string | null;
}



const Contexto = createContext<EstadoClinicoValor | null>(null);

/** Estado en memoria. No hay backend ni persistencia: al recargar vuelve a los datos sintéticos. */
export function ProveedorEstadoClinico({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciales);
  const [medicos, setMedicos] = useState<Medico[]>(medicosIniciales);
  const [citas, setCitas] = useState<Cita[]>(citasDeHoy);
  const [carga, setCarga] = useState<ResultadoCarga | null>(null);
  const [medicoActualId, setMedicoActualId] = useState("med-4");
  const [atenciones, setAtenciones] = useState<RegistroAtencion[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaFamilia>>({});
  const [numeros, setNumeros] = useState<Record<string, NumeroSms[]>>({});

  const numerosSms = useCallback(
    (pacienteId: string) => numeros[pacienteId] ?? numerosInicialesDe(pacienteId),
    [numeros],
  );

  const actualizarNumeros = useCallback(
    (pacienteId: string, cambio: (lista: NumeroSms[]) => NumeroSms[]) => {
      setNumeros((previos) => ({
        ...previos,
        [pacienteId]: cambio(previos[pacienteId] ?? numerosInicialesDe(pacienteId)),
      }));
    },
    [],
  );

  const agregarNumeroSms = useCallback(
    (pacienteId: string, etiqueta: string, numero: string) => {
      actualizarNumeros(pacienteId, (lista) => [
        ...lista,
        { id: `${pacienteId}-sms-${Date.now()}`, etiqueta, numero, activo: true },
      ]);
    },
    [actualizarNumeros],
  );

  const editarNumeroSms = useCallback(
    (pacienteId: string, id: string, etiqueta: string, numero: string) => {
      actualizarNumeros(pacienteId, (lista) =>
        lista.map((item) => (item.id === id ? { ...item, etiqueta, numero } : item)),
      );
    },
    [actualizarNumeros],
  );

  const alternarNumeroSms = useCallback(
    (pacienteId: string, id: string) => {
      actualizarNumeros(pacienteId, (lista) =>
        lista.map((item) => (item.id === id ? { ...item, activo: !item.activo } : item)),
      );
    },
    [actualizarNumeros],
  );

  const eliminarNumeroSms = useCallback(
    (pacienteId: string, id: string) => {
      actualizarNumeros(pacienteId, (lista) => lista.filter((item) => item.id !== id));
    },
    [actualizarNumeros],
  );


  const registrarAtencion = useCallback(
    (registro: Omit<RegistroAtencion, "id" | "fecha">) => {
      const hoy = new Date().toISOString().slice(0, 10);
      setAtenciones((previas) => [
        { ...registro, id: `at-${previas.length + 1}`, fecha: hoy },
        ...previas,
      ]);
      setPacientes((previos) =>
        previos.map((paciente) =>
          paciente.id === registro.pacienteId
            ? {
                ...paciente,
                fechaUltimaAtencion: hoy,
                fechaProximaCita: registro.fechaProximaCita || paciente.fechaProximaCita,
                atendidoUltimaVezPorId: registro.medicoId,
              }
            : paciente,
        ),
      );
    },
    [],
  );

  const reasignarPrincipal = useCallback(
    (cambios: { pacienteId: string; aMedicoId: string }[]) => {
      const mapa = new Map(cambios.map((cambio) => [cambio.pacienteId, cambio.aMedicoId]));
      setPacientes((previos) =>
        previos.map((paciente) => {
          const nuevo = mapa.get(paciente.id);
          return nuevo ? { ...paciente, medicoPrincipalId: nuevo } : paciente;
        }),
      );
    },
    [],
  );

  /** Reemplaza los datos sintéticos por los del Excel leído. Nunca modifica el archivo. */
  const aplicarCarga = useCallback((resultado: ResultadoCarga) => {
    setCarga(resultado);
    setPacientes(resultado.pacientesApp);
    setMedicos(resultado.medicos);
    setCitas(resultado.citas);
    setAtenciones([]);
    setRespuestas({});
    setMedicoActualId(resultado.medicos[0]?.id ?? "");
  }, []);

  const limpiarCarga = useCallback(() => {
    setCarga(null);
    setPacientes(pacientesIniciales);
    setMedicos(medicosIniciales);
    setCitas(citasDeHoy);
    setAtenciones([]);
    setRespuestas({});
    setMedicoActualId("med-4");
  }, []);

  const confirmarAsistencia = useCallback((pacienteId: string) => {
    setRespuestas((previas) => ({
      ...previas,
      [pacienteId]: {
        ...(previas[pacienteId] ?? RESPUESTA_VACIA),
        asistencia: "confirmado",
        motivo: "",
      },
    }));
  }, []);

  const cancelarAsistencia = useCallback((pacienteId: string, motivo: string) => {
    setRespuestas((previas) => ({
      ...previas,
      [pacienteId]: {
        ...(previas[pacienteId] ?? RESPUESTA_VACIA),
        asistencia: "no_asistira",
        motivo,
      },
    }));
  }, []);

  const reportarFiebre = useCallback((pacienteId: string) => {
    setRespuestas((previas) => ({
      ...previas,
      [pacienteId]: { ...(previas[pacienteId] ?? RESPUESTA_VACIA), fiebreReportada: true },
    }));
    setPacientes((previos) =>
      previos.map((paciente) =>
        paciente.id === pacienteId && !paciente.alertas.includes(ALERTA_FIEBRE_FAMILIA)
          ? { ...paciente, alertas: [ALERTA_FIEBRE_FAMILIA, ...paciente.alertas] }
          : paciente,
      ),
    );
  }, []);


  // --- Programación de clínica de día: la plataforma propone, el equipo decide ---
  const [configProgramacion, setConfig] = useState<ConfigProgramacion>({
    capacidadPorBloque: OPCIONES_POR_DEFECTO.capacidadPorBloque,
    horaInicio: OPCIONES_POR_DEFECTO.horaInicio,
    intervaloBloques: OPCIONES_POR_DEFECTO.intervaloBloques,
  });
  const [ajustesProgramacion, setAjustes] = useState<AjustesManuales>({});
  const [cambiosProgramacion, setCambios] = useState<CambioProgramacion[]>([]);

  const setConfigProgramacion = useCallback((parcial: Partial<ConfigProgramacion>) => {
    setConfig((previa) => ({ ...previa, ...parcial }));
  }, []);

  const anotarCambio = useCallback((accion: string) => {
    const hora = new Date().toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setCambios((previos) => [
      { id: `cambio-${previos.length + 1}-${Date.now()}`, hora, accion },
      ...previos,
    ]);
  }, []);

  const nombreDe = useCallback(
    (pacienteId: string) =>
      pacientes.find((paciente) => paciente.id === pacienteId)?.nombre ?? "Paciente",
    [pacientes],
  );

  const moverABloque = useCallback(
    (pacienteId: string, indiceBloque: number) => {
      setAjustes((previos) => ({
        ...previos,
        fijados: { ...(previos.fijados ?? {}), [pacienteId]: indiceBloque },
      }));
      anotarCambio(`${nombreDe(pacienteId)}: movido al bloque ${indiceBloque + 1}`);
    },
    [anotarCambio, nombreDe],
  );

  const fijarEnBloque = useCallback(
    (pacienteId: string, indiceBloque: number) => {
      setAjustes((previos) => ({
        ...previos,
        fijados: { ...(previos.fijados ?? {}), [pacienteId]: indiceBloque },
      }));
      anotarCambio(`${nombreDe(pacienteId)}: fijado en el bloque ${indiceBloque + 1}`);
    },
    [anotarCambio, nombreDe],
  );

  const liberarPaciente = useCallback(
    (pacienteId: string) => {
      setAjustes((previos) => {
        const fijados = { ...(previos.fijados ?? {}) };
        delete fijados[pacienteId];
        return { ...previos, fijados };
      });
      anotarCambio(`${nombreDe(pacienteId)}: liberado del bloque fijado`);
    },
    [anotarCambio, nombreDe],
  );

  const excluirPaciente = useCallback(
    (pacienteId: string, motivo: string) => {
      setAjustes((previos) => {
        const fijados = { ...(previos.fijados ?? {}) };
        delete fijados[pacienteId];
        return {
          fijados,
          excluidos: { ...(previos.excluidos ?? {}), [pacienteId]: motivo },
        };
      });
      anotarCambio(`${nombreDe(pacienteId)}: excluido de la programación`);
    },
    [anotarCambio, nombreDe],
  );

  const cambiarMotivoExclusion = useCallback((pacienteId: string, motivo: string) => {
    setAjustes((previos) => ({
      ...previos,
      excluidos: { ...(previos.excluidos ?? {}), [pacienteId]: motivo },
    }));
  }, []);

  const reincluirPaciente = useCallback(
    (pacienteId: string) => {
      setAjustes((previos) => {
        const excluidos = { ...(previos.excluidos ?? {}) };
        delete excluidos[pacienteId];
        return { ...previos, excluidos };
      });
      anotarCambio(`${nombreDe(pacienteId)}: devuelto a la programación`);
    },
    [anotarCambio, nombreDe],
  );

  const programacion = useMemo(
    () =>
      programarCitas(pacientes.map(aProgramable), {
        ...configProgramacion,
        ajustes: ajustesProgramacion,
      }),
    [pacientes, configProgramacion, ajustesProgramacion],
  );

  const horas = useMemo(() => horasPorPaciente(programacion), [programacion]);

  const valor = useMemo<EstadoClinicoValor>(
    () => ({
      pacientes,
      medicos,
      citas,
      nombreMedico: (id: string) => medicos.find((medico) => medico.id === id)?.nombre ?? "No registrado",
      carga,
      aplicarCarga,
      limpiarCarga,
      medicoActualId,
      setMedicoActualId,
      atenciones,
      registrarAtencion,
      reasignarPrincipal,
      obtenerPaciente: (id) => pacientes.find((paciente) => paciente.id === id),
      atencionesDePaciente: (pacienteId) =>
        atenciones.filter((atencion) => atencion.pacienteId === pacienteId),
      respuestaFamilia: (pacienteId) => respuestas[pacienteId] ?? RESPUESTA_VACIA,
      confirmarAsistencia,
      cancelarAsistencia,
      reportarFiebre,
      configProgramacion,
      setConfigProgramacion,
      programacion,
      ajustesProgramacion,
      cambiosProgramacion,
      moverABloque,
      fijarEnBloque,
      liberarPaciente,
      excluirPaciente,
      cambiarMotivoExclusion,
      reincluirPaciente,
      numerosSms,
      agregarNumeroSms,
      editarNumeroSms,
      alternarNumeroSms,
      eliminarNumeroSms,
      horaPropuesta: (pacienteId) => horas[pacienteId] ?? null,
    }),
    [
      pacientes,
      medicos,
      citas,
      carga,
      aplicarCarga,
      limpiarCarga,
      medicoActualId,
      atenciones,
      registrarAtencion,
      reasignarPrincipal,
      respuestas,
      confirmarAsistencia,
      cancelarAsistencia,
      reportarFiebre,
      configProgramacion,
      setConfigProgramacion,
      programacion,
      ajustesProgramacion,
      cambiosProgramacion,
      moverABloque,
      fijarEnBloque,
      liberarPaciente,
      excluirPaciente,
      cambiarMotivoExclusion,
      reincluirPaciente,
      numerosSms,
      agregarNumeroSms,
      editarNumeroSms,
      alternarNumeroSms,
      eliminarNumeroSms,
      horas,
    ],
  );



  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstadoClinico(): EstadoClinicoValor {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useEstadoClinico debe usarse dentro de ProveedorEstadoClinico");
  return contexto;
}
