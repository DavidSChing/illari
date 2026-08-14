import { inicioParaPrevisto } from "@/lib/esquema";

/**
 * Seguimiento sintético de cada paciente respecto a su esquema de demostración.
 * Datos ficticios: fechas reales registradas, administraciones y antropometría.
 */

export interface AdministracionCiclo {
  ciclo: number;
  fecha: string;
  medicamento: string;
  dosis: string;
  medicoId: string;
}

export interface Antropometria {
  pesoKg: number;
  tallaCm: number;
  fecha: string;
}

export interface Seguimiento {
  pacienteId: string;
  esquemaId: string;
  /** Fecha de inicio del esquema; base del calendario previsto. */
  fechaInicio: string;
  administraciones: AdministracionCiclo[];
  antropometria: Antropometria | null;
}

interface DefinicionSeguimiento {
  pacienteId: string;
  esquemaId: string;
  /** Próximo ciclo pendiente y la fecha que le corresponde según el esquema. */
  proximoCiclo: number;
  fechaPrevistaProximo: string;
  administraciones: AdministracionCiclo[];
  antropometria: Antropometria | null;
}

const definiciones: DefinicionSeguimiento[] = [
  {
    pacienteId: "pac-01",
    esquemaId: "esq-a",
    proximoCiclo: 4,
    fechaPrevistaProximo: "2026-08-02",
    administraciones: [
      { ciclo: 1, fecha: "2026-06-14", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-1" },
      { ciclo: 2, fecha: "2026-07-01", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-3" },
      { ciclo: 3, fecha: "2026-07-24", medicamento: "Metotrexato", dosis: "2 g/m² EV", medicoId: "med-4" },
    ],
    antropometria: { pesoKg: 26.4, tallaCm: 128, fecha: "2026-06-20" },
  },
  {
    pacienteId: "pac-02",
    esquemaId: "esq-b",
    proximoCiclo: 2,
    fechaPrevistaProximo: "2026-08-26",
    administraciones: [
      { ciclo: 1, fecha: "2026-08-05", medicamento: "Citarabina", dosis: "100 mg/m² EV", medicoId: "med-1" },
    ],
    antropometria: { pesoKg: 17.2, tallaCm: 106, fecha: "2026-08-05" },
  },
  {
    pacienteId: "pac-03",
    esquemaId: "esq-c",
    proximoCiclo: 5,
    fechaPrevistaProximo: "2026-08-21",
    administraciones: [
      { ciclo: 1, fecha: "2026-06-12", medicamento: "Doxorrubicina", dosis: "30 mg/m² EV", medicoId: "med-1" },
      { ciclo: 2, fecha: "2026-06-26", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-5" },
      { ciclo: 3, fecha: "2026-07-10", medicamento: "Ciclofosfamida", dosis: "750 mg/m² EV", medicoId: "med-1" },
      { ciclo: 4, fecha: "2026-07-31", medicamento: "Ciclofosfamida", dosis: "750 mg/m² EV", medicoId: "med-1" },
    ],
    antropometria: { pesoKg: 41.8, tallaCm: 149, fecha: "2026-07-31" },
  },
  {
    pacienteId: "pac-04",
    esquemaId: "esq-a",
    proximoCiclo: 7,
    fechaPrevistaProximo: "2026-09-04",
    administraciones: [
      { ciclo: 1, fecha: "2026-05-15", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-1" },
      { ciclo: 2, fecha: "2026-05-29", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-1" },
      { ciclo: 3, fecha: "2026-06-13", medicamento: "Metotrexato", dosis: "2 g/m² EV", medicoId: "med-2" },
      { ciclo: 4, fecha: "2026-07-04", medicamento: "Metotrexato", dosis: "2 g/m² EV", medicoId: "med-2" },
      { ciclo: 5, fecha: "2026-07-24", medicamento: "Mercaptopurina", dosis: "50 mg/m² VO diario", medicoId: "med-1" },
      { ciclo: 6, fecha: "2026-08-07", medicamento: "Mercaptopurina", dosis: "50 mg/m² VO diario", medicoId: "med-2" },
    ],
    antropometria: { pesoKg: 22.1, tallaCm: 119, fecha: "2026-08-07" },
  },
  {
    pacienteId: "pac-05",
    esquemaId: "esq-d",
    proximoCiclo: 3,
    fechaPrevistaProximo: "2026-07-25",
    administraciones: [
      { ciclo: 1, fecha: "2026-06-02", medicamento: "Globulina antitimocítica", dosis: "40 mg/kg EV", medicoId: "med-1" },
      { ciclo: 2, fecha: "2026-07-10", medicamento: "Ciclosporina", dosis: "5 mg/kg VO", medicoId: "med-3" },
    ],
    antropometria: { pesoKg: 48.5, tallaCm: 158, fecha: "2026-06-02" },
  },
  {
    pacienteId: "pac-06",
    esquemaId: "esq-a",
    proximoCiclo: 2,
    fechaPrevistaProximo: "2026-08-14",
    administraciones: [
      { ciclo: 1, fecha: "2026-08-01", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-2" },
    ],
    antropometria: { pesoKg: 15.6, tallaCm: 101, fecha: "2026-08-01" },
  },
  {
    pacienteId: "pac-07",
    esquemaId: "esq-c",
    proximoCiclo: 6,
    fechaPrevistaProximo: "2026-09-03",
    administraciones: [
      { ciclo: 1, fecha: "2026-06-04", medicamento: "Doxorrubicina", dosis: "30 mg/m² EV", medicoId: "med-2" },
      { ciclo: 2, fecha: "2026-06-19", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-2" },
      { ciclo: 3, fecha: "2026-07-03", medicamento: "Metotrexato", dosis: "20 mg/m² VO semanal", medicoId: "med-3" },
      { ciclo: 4, fecha: "2026-07-23", medicamento: "Metotrexato", dosis: "20 mg/m² VO semanal", medicoId: "med-5" },
      { ciclo: 5, fecha: "2026-08-06", medicamento: "Metotrexato", dosis: "20 mg/m² VO semanal", medicoId: "med-5" },
    ],
    antropometria: { pesoKg: 34.7, tallaCm: 141, fecha: "2026-08-06" },
  },
  {
    pacienteId: "pac-08",
    esquemaId: "esq-b",
    proximoCiclo: 4,
    fechaPrevistaProximo: "2026-08-09",
    administraciones: [
      { ciclo: 1, fecha: "2026-06-05", medicamento: "Citarabina", dosis: "100 mg/m² EV", medicoId: "med-2" },
      { ciclo: 2, fecha: "2026-06-26", medicamento: "Citarabina", dosis: "100 mg/m² EV", medicoId: "med-4" },
      { ciclo: 3, fecha: "2026-07-29", medicamento: "Daunorrubicina", dosis: "45 mg/m² EV", medicoId: "med-2" },
    ],
    antropometria: { pesoKg: 19.8, tallaCm: 113, fecha: "2026-07-29" },
  },
  {
    pacienteId: "pac-09",
    esquemaId: "esq-a",
    proximoCiclo: 6,
    fechaPrevistaProximo: "2026-08-05",
    administraciones: [
      { ciclo: 1, fecha: "2026-05-06", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-3" },
      { ciclo: 2, fecha: "2026-05-22", medicamento: "Vincristina", dosis: "1.5 mg/m² EV", medicoId: "med-3" },
      { ciclo: 3, fecha: "2026-06-05", medicamento: "Metotrexato", dosis: "2 g/m² EV", medicoId: "med-1" },
      { ciclo: 4, fecha: "2026-06-26", medicamento: "Citarabina", dosis: "1 g/m² EV", medicoId: "med-4" },
      { ciclo: 5, fecha: "2026-07-18", medicamento: "Citarabina", dosis: "1 g/m² EV", medicoId: "med-4" },
    ],
    antropometria: { pesoKg: 52.3, tallaCm: 165, fecha: "2026-07-18" },
  },
  {
    pacienteId: "pac-10",
    esquemaId: "esq-d",
    proximoCiclo: 2,
    fechaPrevistaProximo: "2026-09-05",
    administraciones: [
      { ciclo: 1, fecha: "2026-08-08", medicamento: "Globulina antitimocítica", dosis: "40 mg/kg EV", medicoId: "med-3" },
    ],
    antropometria: { pesoKg: 11.4, tallaCm: 86, fecha: "2026-08-08" },
  },
  {
    pacienteId: "pac-11",
    esquemaId: "esq-c",
    proximoCiclo: 3,
    fechaPrevistaProximo: "2026-08-16",
    administraciones: [
      { ciclo: 1, fecha: "2026-07-19", medicamento: "Doxorrubicina", dosis: "30 mg/m² EV", medicoId: "med-4" },
      { ciclo: 2, fecha: "2026-07-26", medicamento: "Doxorrubicina", dosis: "30 mg/m² EV", medicoId: "med-1" },
    ],
    antropometria: { pesoKg: 24.9, tallaCm: 124, fecha: "2026-07-26" },
  },
  {
    pacienteId: "pac-12",
    esquemaId: "esq-b",
    proximoCiclo: 5,
    fechaPrevistaProximo: "2026-08-30",
    administraciones: [
      { ciclo: 1, fecha: "2026-05-24", medicamento: "Citarabina", dosis: "100 mg/m² EV", medicoId: "med-5" },
      { ciclo: 2, fecha: "2026-06-15", medicamento: "Citarabina", dosis: "100 mg/m² EV", medicoId: "med-5" },
      { ciclo: 3, fecha: "2026-07-06", medicamento: "Daunorrubicina", dosis: "45 mg/m² EV", medicoId: "med-1" },
      { ciclo: 4, fecha: "2026-08-04", medicamento: "Citarabina", dosis: "75 mg/m² SC", medicoId: "med-5" },
    ],
    antropometria: { pesoKg: 55.2, tallaCm: 161, fecha: "2026-08-04" },
  },
];

export const seguimientos: Seguimiento[] = definiciones.map((definicion) => ({
  pacienteId: definicion.pacienteId,
  esquemaId: definicion.esquemaId,
  fechaInicio: inicioParaPrevisto(
    definicion.esquemaId,
    definicion.proximoCiclo,
    definicion.fechaPrevistaProximo,
  ),
  administraciones: definicion.administraciones,
  antropometria: definicion.antropometria,
}));

export const obtenerSeguimiento = (pacienteId: string): Seguimiento | undefined =>
  seguimientos.find((seguimiento) => seguimiento.pacienteId === pacienteId);
