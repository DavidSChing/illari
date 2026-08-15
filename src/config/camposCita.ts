/**
 * Campos que el servicio registra por cita. Cambiar aquí cuando el servicio
 * confirme sus columnas reales; el formulario, el parser de Excel y la
 * exportación se adaptan solos.
 */

export type TipoCampoCita = "numero" | "textoCorto" | "fecha";

export interface SemaforoCampo {
  critico: number;
  atencion: number;
}

export interface CampoCitaConfig {
  id: string;
  etiqueta: string;
  tipo: TipoCampoCita;
  unidad?: string;
  semaforo?: SemaforoCampo;
  sinonimosExcel: string[];
}

export const CAMPOS_CITA: CampoCitaConfig[] = [
  {
    id: "hemograma",
    etiqueta: "Hemograma — neutrófilos",
    tipo: "numero",
    unidad: "/mm³",
    semaforo: { critico: 500, atencion: 1000 },
    sinonimosExcel: ["NEUTROFILOS", "NEUTRÓFILOS", "HEMOGRAMA", "RAN"],
  },
  {
    id: "cicloAdministrado",
    etiqueta: "Ciclo administrado",
    tipo: "textoCorto",
    sinonimosExcel: ["CICLO", "LO ADMINISTRADO", "TRATAMIENTO"],
  },
  {
    id: "proximaCita",
    etiqueta: "Próxima cita",
    tipo: "fecha",
    sinonimosExcel: ["PROX. CITA", "PROXIMA CITA", "PRÓXIMA CITA"],
  },
];

/** Lectura del semáforo para un valor numérico, según la configuración del campo. */
export function lecturaSemaforo(
  campo: CampoCitaConfig,
  texto: string,
): { nivel: "rojo" | "ambar" | "verde"; etiqueta: string } | null {
  if (!campo.semaforo || texto.trim() === "") return null;
  const valor = Number(texto.replace(",", "."));
  if (!Number.isFinite(valor)) return null;
  if (valor < campo.semaforo.critico) return { nivel: "rojo", etiqueta: "Neutropenia" };
  if (valor <= campo.semaforo.atencion) return { nivel: "ambar", etiqueta: "En límite" };
  return { nivel: "verde", etiqueta: "Adecuado" };
}

/** Fila de Excel, en el orden exacto de CAMPOS_CITA. */
export function filaCitaComoTexto(valores: Record<string, string>): string {
  return CAMPOS_CITA.map((campo) => valores[campo.id] ?? "").join("\t");
}
