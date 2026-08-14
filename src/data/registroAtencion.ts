/**
 * Configuración del formulario "Registrar atención".
 * Este es el ÚNICO archivo que hay que tocar para cambiar el orden, los nombres
 * de los campos, los chips y las columnas del Excel del servicio.
 * La plataforma nunca calcula ni sugiere dosis: solo registra lo que el médico escribe.
 */

export const etiquetasLaboratorio = {
  titulo: "1. Pruebas de laboratorio",
  neutrofilos: "Neutrófilos (/mm³)",
  plaquetas: "Plaquetas (mil/mm³)",
  hemoglobina: "Hemoglobina (g/dL)",
  fecha: "Fecha del examen",
} as const;

export const etiquetasEstado = {
  titulo: "2. Estado del paciente",
  textoLibre: "Otra observación (opcional)",
} as const;

/** Chips de estado, en el orden en que se muestran. */
export const chipsEstado: string[] = [
  "Tolera bien",
  "Náuseas",
  "Vómitos",
  "Mucositis",
  "Fiebre",
  "Decaimiento",
  "Dolor",
];

export const etiquetasAdministrado = {
  titulo: "3. Lo administrado",
  dosis: "Dosis tal como la escribe el médico",
  otro: "Otro medicamento",
} as const;

/** Medicamentos sugeridos por esquema/protocolo. La clave se busca por coincidencia parcial. */
export const medicamentosPorEsquema: Record<string, string[]> = {
  "PERU-LLA": ["Metotrexato", "Vincristina", "Mercaptopurina", "Dexametasona", "Citarabina"],
  "INSN-LMA": ["Citarabina", "Daunorrubicina", "Etopósido"],
  "LNH": ["Ciclofosfamida", "Doxorrubicina", "Vincristina", "Prednisona"],
  "APLASIA": ["Ciclosporina", "Globulina antitimocítica"],
};

export const medicamentosPorDefecto: string[] = [
  "Metotrexato",
  "Vincristina",
  "Citarabina",
  "Dexametasona",
];

export function medicamentosDelEsquema(protocolo: string | undefined): string[] {
  if (!protocolo) return medicamentosPorDefecto;
  const clave = Object.keys(medicamentosPorEsquema).find((k) =>
    protocolo.toUpperCase().includes(k.toUpperCase()),
  );
  return clave ? medicamentosPorEsquema[clave]! : medicamentosPorDefecto;
}

export type Conducta = "Continuar esquema" | "Diferir ciclo" | "Derivar";

export const etiquetasConducta = {
  titulo: "4. Conducta y próxima cita",
  proximaCita: "Fecha de próxima cita",
} as const;

/** Botones de conducta y días de intervalo que prellenan la próxima cita. */
export const opcionesConducta: { valor: Conducta; diasIntervalo: number }[] = [
  { valor: "Continuar esquema", diasIntervalo: 21 },
  { valor: "Diferir ciclo", diasIntervalo: 7 },
  { valor: "Derivar", diasIntervalo: 3 },
];

/** Columnas del archivo del servicio, en el orden exacto de la hoja de cálculo. */
export const columnasExcel: { titulo: string; campo: CampoFila }[] = [
  { titulo: "FECHA", campo: "fecha" },
  { titulo: "HC", campo: "hc" },
  { titulo: "PACIENTE", campo: "paciente" },
  { titulo: "MEDICO QUE ATENDIO", campo: "medico" },
  { titulo: "NEUTROFILOS", campo: "neutrofilos" },
  { titulo: "PLAQUETAS", campo: "plaquetas" },
  { titulo: "HEMOGLOBINA", campo: "hemoglobina" },
  { titulo: "FECHA LAB", campo: "fechaLaboratorio" },
  { titulo: "ESTADO", campo: "estado" },
  { titulo: "OBSERVACIONES", campo: "observaciones" },
  { titulo: "ADMINISTRADO", campo: "administrado" },
  { titulo: "CONDUCTA", campo: "conducta" },
  { titulo: "PROX. CITA", campo: "proximaCita" },
];

export type CampoFila =
  | "fecha"
  | "hc"
  | "paciente"
  | "medico"
  | "neutrofilos"
  | "plaquetas"
  | "hemoglobina"
  | "fechaLaboratorio"
  | "estado"
  | "observaciones"
  | "administrado"
  | "conducta"
  | "proximaCita";

export type FilaExcel = Record<CampoFila, string>;

/** Une los valores con tabulaciones, en el orden de las columnas del servicio. */
export function filaComoTexto(fila: FilaExcel): string {
  return columnasExcel.map((columna) => fila[columna.campo] ?? "").join("\t");
}
