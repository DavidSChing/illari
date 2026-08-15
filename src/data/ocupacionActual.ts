/**
 * Distribución sintética de la programación actual de clínica de día.
 * Refleja la concentración observada entre las 08:00 y las 10:00, con la tarde
 * subutilizada. Datos de demostración, no corresponden a una agenda real.
 */
export const FRANJAS_ACTUALES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
] as const;

/** Peso relativo de citas por franja. Suma 1. */
export const PESOS_ACTUALES = [0.38, 0.3, 0.16, 0.08, 0.04, 0.02, 0.02];

/** Duración de cada franja de la programación actual, en horas. */
export const DURACION_FRANJA_ACTUAL = 1;
