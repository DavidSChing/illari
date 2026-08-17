import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { pacientes as pacientesIniciales } from "@/data/pacientes";
import { medicos as medicosIniciales } from "@/data/medicos";
import { citasDeHoy } from "@/data/agenda";
import { numerosInicialesDe, type NumeroSms } from "@/data/numerosSms";
import { mensajeRecordatorio } from "@/lib/familia";
import { OPCIONES_POR_DEFECTO, type AjustesManuales, type ResultadoProgramacion } from "@/lib/programacion";
import type { Cita, Medico, Paciente } from "@/data/tipos";
import type { ResultadoCarga } from "@/lib/excel/consolidar";
import { credencialesSmsConfiguradas, enviarSmsReal } from "@/lib/sms";

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

export interface CambioProgramacion {
  id: string;
  hora: string;
  accion: string;
}

export type ConfigProgramacion = Omit<ResultadoProgramacion["opciones"], "ajustes">;

export type EstadoSms = "real" | "simulado" | "fallido";

export interface RegistroSms {
  id: string;
  pacienteId: string;
  numero: string;
  fecha: string;
  estado: EstadoSms;
  detalle: string;
}

export interface EstadoPersistido {
  pacientes: Paciente[];
  medicos: Medico[];
  citas: Cita[];
  carga: ResultadoCarga | null;
  atenciones: RegistroAtencion[];
  respuestas: Record<string, RespuestaFamilia>;
  numeros: Record<string, NumeroSms[]>;
  configProgramacion: ConfigProgramacion;
  ajustesProgramacion: AjustesManuales;
  cambiosProgramacion: CambioProgramacion[];
  smsEnviados: RegistroSms[];
}

const RESPUESTA_VACIA: RespuestaFamilia = { asistencia: "sin_responder", fiebreReportada: false };
const RUTA_ARCHIVO = join(process.cwd(), ".data", "estado-clinico.json");

function estadoInicial(): EstadoPersistido {
  return {
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
}

function normalizarEstado(estado: Partial<EstadoPersistido>): EstadoPersistido {
  return { ...estadoInicial(), ...estado };
}

function leerEstado(): EstadoPersistido {
  if (!existsSync(RUTA_ARCHIVO)) {
    const inicial = estadoInicial();
    guardarEstado(inicial);
    return inicial;
  }
  try {
    return normalizarEstado(JSON.parse(readFileSync(RUTA_ARCHIVO, "utf-8")) as Partial<EstadoPersistido>);
  } catch {
    const inicial = estadoInicial();
    guardarEstado(inicial);
    return inicial;
  }
}

function guardarEstado(estado: EstadoPersistido): EstadoPersistido {
  const carpeta = dirname(RUTA_ARCHIVO);
  if (!existsSync(carpeta)) mkdirSync(carpeta, { recursive: true });
  writeFileSync(RUTA_ARCHIVO, JSON.stringify(estado, null, 2), "utf-8");
  return estado;
}

function anotarCambio(estado: EstadoPersistido, accion: string): void {
  const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
  estado.cambiosProgramacion = [
    { id: `cambio-${estado.cambiosProgramacion.length + 1}-${Date.now()}`, hora, accion },
    ...estado.cambiosProgramacion,
  ];
}

function nombreDe(estado: EstadoPersistido, pacienteId: string): string {
  return estado.pacientes.find((p) => p.id === pacienteId)?.nombre ?? "Paciente";
}

export const obtenerEstado = createServerFn({ method: "GET" }).handler(async () => leerEstado());

export const disponibilidadSms = createServerFn({ method: "GET" }).handler(async () => ({
  real: credencialesSmsConfiguradas(),
}));

const esquemaRegistroAtencion = z.object({
  pacienteId: z.string().min(1),
  medicoId: z.string().min(1),
  queSeHizo: z.string(),
  observaciones: z.string(),
  fechaProximaCita: z.string(),
});

export const registrarAtencion = createServerFn({ method: "POST" })
  .validator(esquemaRegistroAtencion)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const hoy = new Date().toISOString().slice(0, 10);
    estado.atenciones = [{ ...data, id: `at-${estado.atenciones.length + 1}`, fecha: hoy }, ...estado.atenciones];
    estado.pacientes = estado.pacientes.map((p) =>
      p.id === data.pacienteId
        ? { ...p, fechaUltimaAtencion: hoy, fechaProximaCita: data.fechaProximaCita || p.fechaProximaCita, atendidoUltimaVezPorId: data.medicoId }
        : p,
    );
    return guardarEstado(estado);
  });

const esquemaReasignacion = z.object({
  cambios: z.array(z.object({ pacienteId: z.string().min(1), aMedicoId: z.string().min(1) })),
});

export const reasignarPrincipal = createServerFn({ method: "POST" })
  .validator(esquemaReasignacion)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const mapa = new Map(data.cambios.map((c) => [c.pacienteId, c.aMedicoId]));
    estado.pacientes = estado.pacientes.map((p) => {
      const nuevo = mapa.get(p.id);
      return nuevo ? { ...p, medicoPrincipalId: nuevo } : p;
    });
    return guardarEstado(estado);
  });

const esquemaPaciente = z.object({ pacienteId: z.string().min(1) });

export const confirmarAsistencia = createServerFn({ method: "POST" })
  .validator(esquemaPaciente)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.respuestas = {
      ...estado.respuestas,
      [data.pacienteId]: { ...(estado.respuestas[data.pacienteId] ?? RESPUESTA_VACIA), asistencia: "confirmado", motivo: "" },
    };
    return guardarEstado(estado);
  });

const esquemaCancelacion = z.object({ pacienteId: z.string().min(1), motivo: z.string() });

export const cancelarAsistencia = createServerFn({ method: "POST" })
  .validator(esquemaCancelacion)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.respuestas = {
      ...estado.respuestas,
      [data.pacienteId]: { ...(estado.respuestas[data.pacienteId] ?? RESPUESTA_VACIA), asistencia: "no_asistira", motivo: data.motivo },
    };
    return guardarEstado(estado);
  });

export const reportarFiebre = createServerFn({ method: "POST" })
  .validator(esquemaPaciente)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.respuestas = {
      ...estado.respuestas,
      [data.pacienteId]: { ...(estado.respuestas[data.pacienteId] ?? RESPUESTA_VACIA), fiebreReportada: true },
    };
    estado.pacientes = estado.pacientes.map((p) =>
      p.id === data.pacienteId && !p.alertas.includes(ALERTA_FIEBRE_FAMILIA)
        ? { ...p, alertas: [ALERTA_FIEBRE_FAMILIA, ...p.alertas] }
        : p,
    );
    return guardarEstado(estado);
  });

export const aplicarCarga = createServerFn({ method: "POST" })
  .validator(z.custom<ResultadoCarga>((v) => typeof v === "object" && v !== null))
  .handler(async ({ data }) => {
    const estado: EstadoPersistido = {
      ...estadoInicial(),
      carga: data,
      pacientes: data.pacientesApp,
      medicos: data.medicos,
      citas: data.citas,
    };
    return guardarEstado(estado);
  });

export const limpiarCarga = createServerFn({ method: "POST" }).handler(async () => guardarEstado(estadoInicial()));

const esquemaConfig = z.object({
  capacidadPorBloque: z.number().int().min(1).optional(),
  horaInicio: z.string().optional(),
  intervaloBloques: z.number().optional(),
});

export const setConfigProgramacion = createServerFn({ method: "POST" })
  .validator(esquemaConfig)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.configProgramacion = {
      capacidadPorBloque: data.capacidadPorBloque ?? estado.configProgramacion.capacidadPorBloque,
      horaInicio: data.horaInicio ?? estado.configProgramacion.horaInicio,
      intervaloBloques: data.intervaloBloques ?? estado.configProgramacion.intervaloBloques,
    };
    return guardarEstado(estado);
  });

const esquemaBloque = z.object({ pacienteId: z.string().min(1), indiceBloque: z.number().int().min(0) });

export const fijarEnBloque = createServerFn({ method: "POST" })
  .validator(esquemaBloque)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.ajustesProgramacion = {
      ...estado.ajustesProgramacion,
      fijados: { ...(estado.ajustesProgramacion.fijados ?? {}), [data.pacienteId]: data.indiceBloque },
    };
    anotarCambio(estado, `${nombreDe(estado, data.pacienteId)}: movido al bloque ${data.indiceBloque + 1}`);
    return guardarEstado(estado);
  });

export const liberarPaciente = createServerFn({ method: "POST" })
  .validator(esquemaPaciente)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const fijados = { ...(estado.ajustesProgramacion.fijados ?? {}) };
    delete fijados[data.pacienteId];
    estado.ajustesProgramacion = { ...estado.ajustesProgramacion, fijados };
    anotarCambio(estado, `${nombreDe(estado, data.pacienteId)}: liberado del bloque fijado`);
    return guardarEstado(estado);
  });

const esquemaExclusion = z.object({ pacienteId: z.string().min(1), motivo: z.string() });

export const excluirPaciente = createServerFn({ method: "POST" })
  .validator(esquemaExclusion)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const fijados = { ...(estado.ajustesProgramacion.fijados ?? {}) };
    delete fijados[data.pacienteId];
    estado.ajustesProgramacion = {
      fijados,
      excluidos: { ...(estado.ajustesProgramacion.excluidos ?? {}), [data.pacienteId]: data.motivo },
    };
    anotarCambio(estado, `${nombreDe(estado, data.pacienteId)}: excluido de la programación`);
    return guardarEstado(estado);
  });

export const cambiarMotivoExclusion = createServerFn({ method: "POST" })
  .validator(esquemaExclusion)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    estado.ajustesProgramacion = {
      ...estado.ajustesProgramacion,
      excluidos: { ...(estado.ajustesProgramacion.excluidos ?? {}), [data.pacienteId]: data.motivo },
    };
    return guardarEstado(estado);
  });

export const reincluirPaciente = createServerFn({ method: "POST" })
  .validator(esquemaPaciente)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const excluidos = { ...(estado.ajustesProgramacion.excluidos ?? {}) };
    delete excluidos[data.pacienteId];
    estado.ajustesProgramacion = { ...estado.ajustesProgramacion, excluidos };
    anotarCambio(estado, `${nombreDe(estado, data.pacienteId)}: devuelto a la programación`);
    return guardarEstado(estado);
  });

const esquemaNumeroNuevo = z.object({ pacienteId: z.string().min(1), etiqueta: z.string(), numero: z.string() });

export const agregarNumeroSms = createServerFn({ method: "POST" })
  .validator(esquemaNumeroNuevo)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const lista = estado.numeros[data.pacienteId] ?? numerosInicialesDe(data.pacienteId);
    estado.numeros = {
      ...estado.numeros,
      [data.pacienteId]: [...lista, { id: `${data.pacienteId}-sms-${Date.now()}`, etiqueta: data.etiqueta, numero: data.numero, activo: true }],
    };
    return guardarEstado(estado);
  });

const esquemaNumeroEditado = z.object({ pacienteId: z.string().min(1), id: z.string().min(1), etiqueta: z.string(), numero: z.string() });

export const editarNumeroSms = createServerFn({ method: "POST" })
  .validator(esquemaNumeroEditado)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const lista = estado.numeros[data.pacienteId] ?? numerosInicialesDe(data.pacienteId);
    estado.numeros = {
      ...estado.numeros,
      [data.pacienteId]: lista.map((n) => (n.id === data.id ? { ...n, etiqueta: data.etiqueta, numero: data.numero } : n)),
    };
    return guardarEstado(estado);
  });

const esquemaNumeroId = z.object({ pacienteId: z.string().min(1), id: z.string().min(1) });

export const alternarNumeroSms = createServerFn({ method: "POST" })
  .validator(esquemaNumeroId)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const lista = estado.numeros[data.pacienteId] ?? numerosInicialesDe(data.pacienteId);
    estado.numeros = {
      ...estado.numeros,
      [data.pacienteId]: lista.map((n) => (n.id === data.id ? { ...n, activo: !n.activo } : n)),
    };
    return guardarEstado(estado);
  });

export const eliminarNumeroSms = createServerFn({ method: "POST" })
  .validator(esquemaNumeroId)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const lista = estado.numeros[data.pacienteId] ?? numerosInicialesDe(data.pacienteId);
    estado.numeros = { ...estado.numeros, [data.pacienteId]: lista.filter((n) => n.id !== data.id) };
    return guardarEstado(estado);
  });

const esquemaEnvioSms = z.object({ pacienteId: z.string().min(1), numero: z.string().min(1) });

export const enviarSms = createServerFn({ method: "POST" })
  .validator(esquemaEnvioSms)
  .handler(async ({ data }) => {
    const estado = leerEstado();
    const paciente = estado.pacientes.find((p) => p.id === data.pacienteId);
    const mensaje = paciente ? mensajeRecordatorio(paciente) : "";
    const resultado = await enviarSmsReal(data.numero, mensaje);

    const actual = leerEstado();
    const registro: RegistroSms = {
      id: `sms-${actual.smsEnviados.length + 1}`,
      pacienteId: data.pacienteId,
      numero: data.numero,
      fecha: new Date().toISOString(),
      estado: !resultado.exito ? "fallido" : resultado.simulado ? "simulado" : "real",
      detalle: resultado.detalle,
    };
    actual.smsEnviados = [registro, ...actual.smsEnviados];
    return guardarEstado(actual);
  });
