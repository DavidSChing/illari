import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { pacientes as pacientesIniciales } from "@/data/pacientes";
import type { Paciente } from "@/data/tipos";

export interface RegistroAtencion {
  id: string;
  pacienteId: string;
  medicoId: string;
  queSeHizo: string;
  observaciones: string;
  fechaProximaCita: string;
  fecha: string;
}

interface EstadoClinicoValor {
  pacientes: Paciente[];
  medicoActualId: string;
  setMedicoActualId: (id: string) => void;
  atenciones: RegistroAtencion[];
  registrarAtencion: (registro: Omit<RegistroAtencion, "id" | "fecha">) => void;
  obtenerPaciente: (id: string) => Paciente | undefined;
  atencionesDePaciente: (pacienteId: string) => RegistroAtencion[];
  reasignarPrincipal: (cambios: { pacienteId: string; aMedicoId: string }[]) => void;
}

const Contexto = createContext<EstadoClinicoValor | null>(null);

/** Estado en memoria. No hay backend ni persistencia: al recargar vuelve a los datos sintéticos. */
export function ProveedorEstadoClinico({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciales);
  const [medicoActualId, setMedicoActualId] = useState("med-4");
  const [atenciones, setAtenciones] = useState<RegistroAtencion[]>([]);

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

  const valor = useMemo<EstadoClinicoValor>(
    () => ({
      pacientes,
      medicoActualId,
      setMedicoActualId,
      atenciones,
      registrarAtencion,
      obtenerPaciente: (id) => pacientes.find((paciente) => paciente.id === id),
      atencionesDePaciente: (pacienteId) =>
        atenciones.filter((atencion) => atencion.pacienteId === pacienteId),
    }),
    [pacientes, medicoActualId, atenciones, registrarAtencion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstadoClinico(): EstadoClinicoValor {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useEstadoClinico debe usarse dentro de ProveedorEstadoClinico");
  return contexto;
}
