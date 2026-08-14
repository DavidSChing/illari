import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { pacientes as pacientesIniciales } from "@/data/pacientes";
import { medicos as medicosIniciales } from "@/data/medicos";
import { citasDeHoy } from "@/data/agenda";
import type { Cita, Medico, Paciente } from "@/data/tipos";
import type { ResultadoCarga } from "@/lib/excel/consolidar";

export const ALERTA_FIEBRE_FAMILIA = "Fiebre reportada por la familia";

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
    ],
  );


  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstadoClinico(): EstadoClinicoValor {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useEstadoClinico debe usarse dentro de ProveedorEstadoClinico");
  return contexto;
}
