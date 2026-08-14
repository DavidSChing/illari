/**
 * Lectura y mapeo del Excel que el equipo médico ya usa hoy.
 * Todo ocurre en el navegador: el archivo nunca se sube ni se modifica.
 */

export type CampoDestino = "hc" | "paciente" | "medico" | "fecha" | "proximaCita" | "hora";

export interface DefinicionCampo {
  clave: CampoDestino;
  etiqueta: string;
  requerido: boolean;
  sinonimos: string[];
}

export const CAMPOS: DefinicionCampo[] = [
  {
    clave: "hc",
    etiqueta: "Historia clínica (identificador)",
    requerido: true,
    sinonimos: ["HC", "N HC", "NRO HC", "NO HC", "HISTORIA", "HISTORIA CLINICA", "N HISTORIA", "ID"],
  },
  {
    clave: "paciente",
    etiqueta: "Nombre del paciente",
    requerido: true,
    sinonimos: ["PACIENTE", "NOMBRE", "NOMBRES", "NOMBRE DEL PACIENTE", "APELLIDOS Y NOMBRES"],
  },
  {
    clave: "medico",
    etiqueta: "Médico que atendió",
    requerido: true,
    sinonimos: ["MEDICO QUE ATENDIO", "MEDICO", "MEDICO TRATANTE", "DOCTOR", "ATENDIDO POR", "RESPONSABLE"],
  },
  {
    clave: "fecha",
    etiqueta: "Fecha de la atención",
    requerido: true,
    sinonimos: ["FECHA", "FECHA DE ATENCION", "FECHA ATENCION", "FECHA CITA", "DIA"],
  },
  {
    clave: "proximaCita",
    etiqueta: "Próxima cita",
    requerido: false,
    sinonimos: ["PROX CITA", "PROXIMA CITA", "PROX CONTROL", "SIGUIENTE CITA", "PROXIMO CONTROL"],
  },
  {
    clave: "hora",
    etiqueta: "Hora de la cita",
    requerido: false,
    sinonimos: ["HORA", "HORA CITA", "HORARIO"],
  },
];

export const SIN_MAPEAR = -1;

export type Mapeo = Record<CampoDestino, number>;

export const MAPEO_VACIO: Mapeo = {
  hc: SIN_MAPEAR,
  paciente: SIN_MAPEAR,
  medico: SIN_MAPEAR,
  fecha: SIN_MAPEAR,
  proximaCita: SIN_MAPEAR,
  hora: SIN_MAPEAR,
};

/** "  Próx. Cita " → "PROX CITA" */
export function normalizarEncabezado(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.:°º#]/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function coincide(encabezado: string, campo: DefinicionCampo): boolean {
  if (!encabezado) return false;
  return campo.sinonimos.some(
    (sinonimo) => encabezado === sinonimo || encabezado.startsWith(`${sinonimo} `),
  );
}

/** Busca la fila de cabecera: la que reconoce más columnas conocidas. */
export function detectarFilaCabecera(filas: unknown[][]): number {
  let mejorFila = 0;
  let mejorPuntaje = 0;
  const limite = Math.min(filas.length, 25);

  for (let indice = 0; indice < limite; indice += 1) {
    const encabezados = (filas[indice] ?? []).map(normalizarEncabezado);
    const puntaje = CAMPOS.filter((campo) =>
      encabezados.some((encabezado) => coincide(encabezado, campo)),
    ).length;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorFila = indice;
    }
  }

  return mejorFila;
}

/** Propone qué columna corresponde a cada campo, por sinónimos. */
export function proponerMapeo(encabezados: string[]): Mapeo {
  const normalizados = encabezados.map(normalizarEncabezado);
  const mapeo: Mapeo = { ...MAPEO_VACIO };

  for (const campo of CAMPOS) {
    const indice = normalizados.findIndex((encabezado) => coincide(encabezado, campo));
    if (indice >= 0) mapeo[campo.clave] = indice;
  }

  return mapeo;
}

export interface FechaLeida {
  iso: string | null;
  original: string;
  ambigua: boolean;
}

const FECHA_VACIA: FechaLeida = { iso: null, original: "", ambigua: false };

function aIso(anio: number, mes: number, dia: number): string | null {
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) return null;
  return `${anio}-${`${mes}`.padStart(2, "0")}-${`${dia}`.padStart(2, "0")}`;
}

/**
 * Normaliza fechas guardadas como texto ("15/06/2026") o como fecha real de Excel.
 * Conserva siempre el valor original y marca las ambiguas para revisión humana.
 */
export function leerFecha(valor: unknown): FechaLeida {
  if (valor === null || valor === undefined || valor === "") return FECHA_VACIA;

  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return {
      iso: aIso(valor.getFullYear(), valor.getMonth() + 1, valor.getDate()),
      original: valor.toLocaleDateString("es-PE"),
      ambigua: false,
    };
  }

  if (typeof valor === "number" && Number.isFinite(valor)) {
    // Número de serie de Excel (base 1899-12-30).
    const ms = Math.round(valor) * 86400000;
    const fecha = new Date(Date.UTC(1899, 11, 30) + ms);
    return {
      iso: aIso(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate()),
      original: String(valor),
      ambigua: false,
    };
  }

  const original = String(valor).trim();

  const iso = original.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) {
    return {
      iso: aIso(Number(iso[1]), Number(iso[2]), Number(iso[3])),
      original,
      ambigua: false,
    };
  }

  const latino = original.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (latino) {
    const dia = Number(latino[1]);
    const mes = Number(latino[2]);
    let anio = Number(latino[3]);
    if (anio < 100) anio += 2000;
    return {
      iso: aIso(anio, mes, dia),
      original,
      // Si ambas cifras son válidas como día y como mes, el formato es ambiguo.
      ambigua: dia <= 12 && mes <= 12,
    };
  }

  return { iso: null, original, ambigua: false };
}

/** "  jUAN  pérez  " → "Juan Pérez" (conserva aparte el valor original). */
export function normalizarNombre(valor: unknown): string {
  const texto = String(valor ?? "").replace(/\s+/g, " ").trim();
  if (!texto) return "";
  return texto
    .toLocaleLowerCase("es-PE")
    .split(" ")
    .map((palabra) =>
      palabra.length > 0 ? palabra.charAt(0).toLocaleUpperCase("es-PE") + palabra.slice(1) : palabra,
    )
    .join(" ");
}

export function textoPlano(valor: unknown): string {
  return String(valor ?? "").replace(/\s+/g, " ").trim();
}
