import type { Cita } from "./tipos";

/** Capacidad simultánea de la clínica de día. */
export const CAPACIDAD_SILLONES = 4;

export const fechaJornada = "2026-08-14";

/**
 * Agenda sintética de clínica de día para hoy: 14 citas concentradas
 * entre 08:00 y 10:00, casi vacía después de las 11:00.
 */
export const citasDeHoy: Cita[] = [
  { id: "cit-01", pacienteId: "pac-01", hora: "08:00", duracionMinutos: 120, motivo: "Evaluación pre-ciclo 4" },
  { id: "cit-02", pacienteId: "pac-02", hora: "08:00", duracionMinutos: 180, motivo: "Quimioterapia inducción" },
  { id: "cit-03", pacienteId: "pac-04", hora: "08:00", duracionMinutos: 60, motivo: "Control de mantenimiento" },
  { id: "cit-04", pacienteId: "pac-08", hora: "08:00", duracionMinutos: 120, motivo: "Evaluación pre-ciclo 4" },
  { id: "cit-05", pacienteId: "pac-03", hora: "08:30", duracionMinutos: 150, motivo: "Quimioterapia intensificación" },
  { id: "cit-06", pacienteId: "pac-06", hora: "08:30", duracionMinutos: 90, motivo: "Administración de vincristina" },
  { id: "cit-07", pacienteId: "pac-10", hora: "09:00", duracionMinutos: 120, motivo: "Evaluación por fiebre" },
  { id: "cit-08", pacienteId: "pac-05", hora: "09:00", duracionMinutos: 180, motivo: "Transfusión de plaquetas" },
  { id: "cit-09", pacienteId: "pac-09", hora: "09:30", duracionMinutos: 120, motivo: "Inicio de ciclo 6" },
  { id: "cit-10", pacienteId: "pac-11", hora: "09:30", duracionMinutos: 90, motivo: "Control pre-ciclo 3" },
  { id: "cit-11", pacienteId: "pac-07", hora: "10:00", duracionMinutos: 60, motivo: "Control de mantenimiento" },
  { id: "cit-12", pacienteId: "pac-12", hora: "10:00", duracionMinutos: 60, motivo: "Cierre de esquema" },
  { id: "cit-13", pacienteId: "pac-04", hora: "11:30", duracionMinutos: 45, motivo: "Resultado de laboratorio" },
  { id: "cit-14", pacienteId: "pac-03", hora: "13:00", duracionMinutos: 45, motivo: "Reevaluación de tolerancia" },
];

/** Bloques horarios de la jornada, de 08:00 a 14:00. */
export const bloquesHorarios = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
];

export const citasPorBloque = (hora: string): Cita[] => citasDeHoy.filter((cita) => cita.hora === hora);
