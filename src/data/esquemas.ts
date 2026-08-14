import type { Fase } from "./tipos";

/**
 * ESQUEMAS DE DEMOSTRACIÓN (FICTICIOS).
 * No corresponden a ningún protocolo real. Sirven únicamente para mostrar
 * el calendario previsto frente a las fechas realmente registradas.
 * El sistema muestra el calendario. La decisión clínica corresponde al médico tratante.
 */

export const ETIQUETA_DEMO = "Esquema de demostración (ficticio)";

export interface TramoFase {
  fase: Fase;
  /** Cantidad de ciclos de la fase. */
  ciclos: number;
  /** Días previstos entre el inicio de un ciclo de esta fase y el siguiente. */
  intervaloDias: number;
}

export interface Esquema {
  id: string;
  nombre: string;
  tramos: TramoFase[];
  /** Recordatorios del esquema. Nunca se evalúan automáticamente. */
  criterios: string[];
}

const CRITERIOS_BASE = [
  "Hemograma dentro de las últimas 72 horas",
  "Recuento de neutrófilos disponible",
  "Sin fiebre en las últimas 48 horas",
  "Peso y talla actualizados",
];

export const esquemas: Esquema[] = [
  {
    id: "esq-a",
    nombre: "Esquema demostrativo A (linfoblástico)",
    tramos: [
      { fase: "Inducción", ciclos: 2, intervaloDias: 14 },
      { fase: "Consolidación", ciclos: 3, intervaloDias: 21 },
      { fase: "Intensificación", ciclos: 3, intervaloDias: 21 },
      { fase: "Mantenimiento", ciclos: 4, intervaloDias: 28 },
    ],
    criterios: CRITERIOS_BASE,
  },
  {
    id: "esq-b",
    nombre: "Esquema demostrativo B (mieloide)",
    tramos: [
      { fase: "Inducción", ciclos: 2, intervaloDias: 21 },
      { fase: "Consolidación", ciclos: 2, intervaloDias: 28 },
      { fase: "Intensificación", ciclos: 2, intervaloDias: 28 },
      { fase: "Mantenimiento", ciclos: 3, intervaloDias: 35 },
    ],
    criterios: CRITERIOS_BASE,
  },
  {
    id: "esq-c",
    nombre: "Esquema demostrativo C (linfoma)",
    tramos: [
      { fase: "Inducción", ciclos: 2, intervaloDias: 14 },
      { fase: "Consolidación", ciclos: 2, intervaloDias: 21 },
      { fase: "Intensificación", ciclos: 3, intervaloDias: 21 },
      { fase: "Mantenimiento", ciclos: 3, intervaloDias: 28 },
    ],
    criterios: CRITERIOS_BASE,
  },
  {
    id: "esq-d",
    nombre: "Esquema demostrativo D (aplásica)",
    tramos: [
      { fase: "Inducción", ciclos: 1, intervaloDias: 28 },
      { fase: "Consolidación", ciclos: 2, intervaloDias: 28 },
      { fase: "Intensificación", ciclos: 1, intervaloDias: 28 },
      { fase: "Mantenimiento", ciclos: 3, intervaloDias: 42 },
    ],
    criterios: [
      "Hemograma dentro de las últimas 72 horas",
      "Recuento de neutrófilos disponible",
      "Sin fiebre en las últimas 48 horas",
      "Peso y talla actualizados",
    ],
  },
];

export const obtenerEsquema = (id: string): Esquema =>
  esquemas.find((esquema) => esquema.id === id) ?? esquemas[0];

export const FASES_ESQUEMA: Fase[] = [
  "Inducción",
  "Consolidación",
  "Intensificación",
  "Mantenimiento",
];
