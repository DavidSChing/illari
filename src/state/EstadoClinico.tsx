import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { pacientes as pacientesIniciales } from "@/data/pacientes";
import { medicos as medicosIniciales } from "@/data/medicos";
import { citasDeHoy } from "@/data/agenda";
import type { Cita, Medico, Paciente } from "@/data/tipos";
import { numerosInicialesDe, type NumeroSms } from "@/data/numerosSms";
import type { ResultadoCarga } from "@/lib/excel/consolidar";
import { OPCIONES_POR_DEFECTO, type AjustesManuales, type ResultadoProgramacion } from "@/lib/programacion";
import { programarCitas, aProgramable, horasPorPaciente } from "@/lib/programacion";
import {
  ALERTA_FIEBRE_FAMILIA,
  agregarNumeroSms as agregarNumeroSmsFn,
  alternarNumeroSms as alternarNumeroSmsFn,
  aplicarCarga as aplicarCargaFn,
  cambiarMotivoExclusion as cambiarMotivoExclusionFn,
  cancelarAsistencia as cancelarAsistenciaFn,
  confirmarAsistencia as confirmarAsistenciaFn,
  disponibilidadSms,
  editarNumeroSms as editarNumeroSmsFn,
  eliminarNumeroSms as eliminarNumeroSmsFn,
  enviarSms as enviarSmsFn,
  excluirPaciente as excluirPacienteFn,
  fijarEnBloque as fijarEnBloqueFn,
  liberarPaciente as liberarPacienteFn,
  limpiarCarga as limpiarCargaFn,
  obtenerEstado,
  reasignarPrincipal as reasignarPrincipalFn,
  registrarAtencion as registrarAtencionFn,
  reincluirPaciente as reincluirPacienteFn,
  reportarFiebre as reportarFiebreFn,
  setConfigProgramacion as setConfigProgramacionFn,
  type CambioProgramacion,
  type ConfigProgramacion,
  type EstadoPersistido,
  type RegistroAtencion,
  type RegistroSms,
  type RespuestaFamilia,
} from "@/lib/clinico";

export { ALERTA_FIEBRE_FAMILIA };
export type { AsistenciaFamilia, RegistroAtencion, RespuestaFamilia } from "@/lib/clinico";
export type { CambioProgramacion, ConfigProgramacion };

const RESPUESTA_VACIA: RespuestaFamilia = { asistencia: "sin_responder", fiebreReportada: false };
export type Rol = "medico" | "enfermera";

const ESTADO_SEMILLA: EstadoPersistido = {
  pacientes: pacientesIniciales,
  medicos: medicosIniciales,
  citas: citasDeHoy,
  carga: null,
  atenciones: [],
  respuestas: {},
  numeros: {},
  configProgramacion: {
    capacidadPorBloque: OPCIONES_POR_DEFECTO.capacidadPorBloque,
    horaInicio: OPCIONES_POR_DEFECTO.horaInicio,
    intervaloBloques: OPCIONES_POR_DEFECTO.intervaloBloques,
  },
  ajustesProgramacion: {},
  cambiosProgramacion: [],
  smsEnviados: [],
};

const CLAVE_MEDICO_ACTUAL = "illari:medico-actual";
const CLAVE_ROL = "illari:rol";
const CLAVE_CONSULTA = ["estado-clinico"] as const;
const CLAVE_DISPONIBILIDAD_SMS = ["disponibilidad-sms"] as const;

interface EstadoClinicoValor {
  pacientes: Paciente[];
  medicos: Medico[];
  citas: Cita[];
  nombreMedico: (id: string) => string;
  carga: ResultadoCarga | null;
  aplicarCarga: (resultado: ResultadoCarga) => void;
  limpiarCarga: () => void;
  medicoActualId: string;
  setMedicoActualId: (id: string) => void;
  rol: Rol;
  setRol: (rol: Rol) => void;
  atenciones: RegistroAtencion[];
  registrarAtencion: (registro: Omit<RegistroAtencion, "id" | "fecha">) => void;
  obtenerPaciente: (id: string) => Paciente | undefined;
  atencionesDePaciente: (pacienteId: string) => RegistroAtencion[];
  reasignarPrincipal: (cambios: { pacienteId: string; aMedicoId: string }[]) => void;
  respuestaFamilia: (pacienteId: string) => RespuestaFamilia;
  confirmarAsistencia: (pacienteId: string) => void;
  cancelarAsistencia: (pacienteId: string, motivo: string) => void;
  reportarFiebre: (pacienteId: string) => void;
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
  numerosSms: (pacienteId: string) => NumeroSms[];
  agregarNumeroSms: (pacienteId: string, etiqueta: string, numero: string) => void;
  editarNumeroSms: (pacienteId: string, id: string, etiqueta: string, numero: string) => void;
  alternarNumeroSms: (pacienteId: string, id: string) => void;
  eliminarNumeroSms: (pacienteId: string, id: string) => void;
  horaPropuesta: (pacienteId: string) => string | null;
  smsReales: boolean;
  smsEnviados: RegistroSms[];
  enviarSms: (pacienteId: string, numero: string) => void;
  enviandoSms: boolean;
}

const Contexto = createContext<EstadoClinicoValor | null>(null);

export function ProveedorEstadoClinico({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const consulta = useQuery({
    queryKey: CLAVE_CONSULTA,
    queryFn: () => obtenerEstado(),
    refetchInterval: 4000,
    refetchOnWindowFocus: true,
  });
  const estado = consulta.data ?? ESTADO_SEMILLA;

  const consultaSms = useQuery({
    queryKey: CLAVE_DISPONIBILIDAD_SMS,
    queryFn: () => disponibilidadSms(),
    staleTime: 5 * 60_000,
  });

  const [medicoActualId, establecerMedicoActualId] = useState("med-4");
  const [rol, establecerRol] = useState<Rol>("medico");
  useEffect(() => {
    const medico = window.localStorage.getItem(CLAVE_MEDICO_ACTUAL);
    if (medico) establecerMedicoActualId(medico);
    const rolGuardado = window.localStorage.getItem(CLAVE_ROL);
    if (rolGuardado === "medico" || rolGuardado === "enfermera") establecerRol(rolGuardado);
  }, []);
  const setMedicoActualId = useCallback((id: string) => {
    establecerMedicoActualId(id);
    window.localStorage.setItem(CLAVE_MEDICO_ACTUAL, id);
  }, []);
  const setRol = useCallback((nuevo: Rol) => {
    establecerRol(nuevo);
    window.localStorage.setItem(CLAVE_ROL, nuevo);
  }, []);

  const actualizarCache = useCallback(
    (nuevoEstado: EstadoPersistido) => queryClient.setQueryData(CLAVE_CONSULTA, nuevoEstado),
    [queryClient],
  );

  function useMutar<T>(fn: (data: T) => Promise<EstadoPersistido>) {
    return useMutation({ mutationFn: fn, onSuccess: actualizarCache });
  }

  const mRegistrarAtencion = useMutar((registro: Omit<RegistroAtencion, "id" | "fecha">) =>
    registrarAtencionFn({ data: registro }),
  );
  const mReasignar = useMutar((cambios: { pacienteId: string; aMedicoId: string }[]) =>
    reasignarPrincipalFn({ data: { cambios } }),
  );
  const mAplicarCarga = useMutation({
    mutationFn: (resultado: ResultadoCarga) => aplicarCargaFn({ data: resultado }),
    onSuccess: (nuevo) => {
      actualizarCache(nuevo);
      setMedicoActualId(nuevo.medicos[0]?.id ?? "");
    },
  });
  const mLimpiarCarga = useMutation({
    mutationFn: () => limpiarCargaFn(),
    onSuccess: (nuevo) => {
      actualizarCache(nuevo);
      setMedicoActualId("med-4");
    },
  });
  const mConfirmar = useMutar((pacienteId: string) => confirmarAsistenciaFn({ data: { pacienteId } }));
  const mCancelar = useMutar(({ pacienteId, motivo }: { pacienteId: string; motivo: string }) =>
    cancelarAsistenciaFn({ data: { pacienteId, motivo } }),
  );
  const mFiebre = useMutar((pacienteId: string) => reportarFiebreFn({ data: { pacienteId } }));
  const mConfig = useMutar((parcial: Partial<ConfigProgramacion>) => setConfigProgramacionFn({ data: parcial }));
  const mFijar = useMutar(({ pacienteId, indiceBloque }: { pacienteId: string; indiceBloque: number }) =>
    fijarEnBloqueFn({ data: { pacienteId, indiceBloque } }),
  );
  const mLiberar = useMutar((pacienteId: string) => liberarPacienteFn({ data: { pacienteId } }));
  const mExcluir = useMutar(({ pacienteId, motivo }: { pacienteId: string; motivo: string }) =>
    excluirPacienteFn({ data: { pacienteId, motivo } }),
  );
  const mMotivoExclusion = useMutar(({ pacienteId, motivo }: { pacienteId: string; motivo: string }) =>
    cambiarMotivoExclusionFn({ data: { pacienteId, motivo } }),
  );
  const mReincluir = useMutar((pacienteId: string) => reincluirPacienteFn({ data: { pacienteId } }));
  const mAgregarNumero = useMutar(
    ({ pacienteId, etiqueta, numero }: { pacienteId: string; etiqueta: string; numero: string }) =>
      agregarNumeroSmsFn({ data: { pacienteId, etiqueta, numero } }),
  );
  const mEditarNumero = useMutar(
    ({ pacienteId, id, etiqueta, numero }: { pacienteId: string; id: string; etiqueta: string; numero: string }) =>
      editarNumeroSmsFn({ data: { pacienteId, id, etiqueta, numero } }),
  );
  const mAlternarNumero = useMutar(({ pacienteId, id }: { pacienteId: string; id: string }) =>
    alternarNumeroSmsFn({ data: { pacienteId, id } }),
  );
  const mEliminarNumero = useMutar(({ pacienteId, id }: { pacienteId: string; id: string }) =>
    eliminarNumeroSmsFn({ data: { pacienteId, id } }),
  );
  const mEnviarSms = useMutar(({ pacienteId, numero }: { pacienteId: string; numero: string }) =>
    enviarSmsFn({ data: { pacienteId, numero } }),
  );

  const programacion = useMemo(
    () => programarCitas(estado.pacientes.map(aProgramable), { ...estado.configProgramacion, ajustes: estado.ajustesProgramacion }),
    [estado.pacientes, estado.configProgramacion, estado.ajustesProgramacion],
  );
  const horas = useMemo(() => horasPorPaciente(programacion), [programacion]);

  const valor = useMemo<EstadoClinicoValor>(
    () => ({
      pacientes: estado.pacientes,
      medicos: estado.medicos,
      citas: estado.citas,
      nombreMedico: (id) => estado.medicos.find((m) => m.id === id)?.nombre ?? "No registrado",
      carga: estado.carga,
      aplicarCarga: (r) => mAplicarCarga.mutate(r),
      limpiarCarga: () => mLimpiarCarga.mutate(),
      medicoActualId,
      setMedicoActualId,
      rol,
      setRol,
      atenciones: estado.atenciones,
      registrarAtencion: (r) => mRegistrarAtencion.mutate(r),
      reasignarPrincipal: (c) => mReasignar.mutate(c),
      obtenerPaciente: (id) => estado.pacientes.find((p) => p.id === id),
      atencionesDePaciente: (pacienteId) => estado.atenciones.filter((a) => a.pacienteId === pacienteId),
      respuestaFamilia: (pacienteId) => estado.respuestas[pacienteId] ?? RESPUESTA_VACIA,
      confirmarAsistencia: (id) => mConfirmar.mutate(id),
      cancelarAsistencia: (pacienteId, motivo) => mCancelar.mutate({ pacienteId, motivo }),
      reportarFiebre: (id) => mFiebre.mutate(id),
      configProgramacion: estado.configProgramacion,
      setConfigProgramacion: (parcial) => mConfig.mutate(parcial),
      programacion,
      ajustesProgramacion: estado.ajustesProgramacion,
      cambiosProgramacion: estado.cambiosProgramacion,
      moverABloque: (pacienteId, indiceBloque) => mFijar.mutate({ pacienteId, indiceBloque }),
      fijarEnBloque: (pacienteId, indiceBloque) => mFijar.mutate({ pacienteId, indiceBloque }),
      liberarPaciente: (id) => mLiberar.mutate(id),
      excluirPaciente: (pacienteId, motivo) => mExcluir.mutate({ pacienteId, motivo }),
      cambiarMotivoExclusion: (pacienteId, motivo) => mMotivoExclusion.mutate({ pacienteId, motivo }),
      reincluirPaciente: (id) => mReincluir.mutate(id),
      numerosSms: (pacienteId) => estado.numeros[pacienteId] ?? numerosInicialesDe(pacienteId),
      agregarNumeroSms: (pacienteId, etiqueta, numero) => mAgregarNumero.mutate({ pacienteId, etiqueta, numero }),
      editarNumeroSms: (pacienteId, id, etiqueta, numero) => mEditarNumero.mutate({ pacienteId, id, etiqueta, numero }),
      alternarNumeroSms: (pacienteId, id) => mAlternarNumero.mutate({ pacienteId, id }),
      eliminarNumeroSms: (pacienteId, id) => mEliminarNumero.mutate({ pacienteId, id }),
      horaPropuesta: (pacienteId) => horas[pacienteId] ?? null,
      smsReales: consultaSms.data?.real ?? false,
      smsEnviados: estado.smsEnviados,
      enviarSms: (pacienteId, numero) => mEnviarSms.mutate({ pacienteId, numero }),
      enviandoSms: mEnviarSms.isPending,
    }),
    [estado, medicoActualId, setMedicoActualId, rol, setRol, programacion, horas, consultaSms.data],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstadoClinico(): EstadoClinicoValor {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useEstadoClinico debe usarse dentro de ProveedorEstadoClinico");
  return contexto;
}
