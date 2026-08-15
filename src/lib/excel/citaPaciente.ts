/**
 * Lectura del Excel por paciente que el médico ya lleva hoy.
 * Todo ocurre en el navegador con SheetJS: el archivo nunca se sube ni se modifica.
 * La plataforma no adivina: si un valor no se puede interpretar, queda vacío y se reporta.
 */
import { leerFecha, normalizarEncabezado, textoPlano } from "./mapeo";

export type CampoCita =
  | "fecha"
  | "ciclo"
  | "neutrofilos"
  | "plaquetas"
  | "hemoglobina"
  | "estado"
  | "administrado"
  | "dosis"
  | "conducta"
  | "proximaCita"
  | "medico";

const SINONIMOS: Record<CampoCita, string[]> = {
  fecha: ["FECHA", "FECHA CITA", "FECHA DE ATENCION", "FECHA ATENCION"],
  ciclo: ["CICLO", "N CICLO", "NRO CICLO", "SESION"],
  neutrofilos: ["NEUTROFILOS", "NEUTROFILO", "ANC", "RAN"],
  plaquetas: ["PLAQUETAS", "PLQ"],
  hemoglobina: ["HEMOGLOBINA", "HB", "HGB"],
  estado: ["ESTADO DEL PACIENTE", "ESTADO", "ESTADO CLINICO"],
  administrado: ["LO ADMINISTRADO", "ADMINISTRADO", "MEDICAMENTO", "MEDICAMENTOS", "TRATAMIENTO"],
  dosis: ["DOSIS", "DOSIS ADMINISTRADA"],
  conducta: ["CONDUCTA", "DECISION", "PLAN"],
  proximaCita: ["PROX CITA", "PROXIMA CITA", "PROX CONTROL", "SIGUIENTE CITA"],
  medico: ["MEDICO", "MEDICO QUE ATENDIO", "MEDICO TRATANTE", "DOCTOR"],
};

/** Etiqueta legible, tal como aparecería en el archivo. */
export const ETIQUETA_CAMPO: Record<CampoCita, string> = {
  fecha: "FECHA",
  ciclo: "CICLO",
  neutrofilos: "NEUTROFILOS",
  plaquetas: "PLAQUETAS",
  hemoglobina: "HEMOGLOBINA",
  estado: "ESTADO DEL PACIENTE",
  administrado: "LO ADMINISTRADO",
  dosis: "DOSIS",
  conducta: "CONDUCTA",
  proximaCita: "PROX. CITA",
  medico: "MEDICO",
};

export interface LecturaCita {
  archivo: string;
  /** Fila del archivo, en numeración de Excel (1 = primera fila). */
  fila: number;
  valores: Partial<Record<CampoCita, string>>;
  /** Problemas en lenguaje claro, sin adivinar valores. */
  problemas: string[];
  /** Aviso cuando no hubo fila con fecha de hoy o posterior. */
  aviso: string | null;
}

function indicePorCampo(encabezados: string[]): Partial<Record<CampoCita, number>> {
  const normalizados = encabezados.map(normalizarEncabezado);
  const mapa: Partial<Record<CampoCita, number>> = {};
  (Object.keys(SINONIMOS) as CampoCita[]).forEach((campo) => {
    const indice = normalizados.findIndex((encabezado) =>
      SINONIMOS[campo]!.some(
        (sinonimo) => encabezado === sinonimo || encabezado.startsWith(`${sinonimo} `),
      ),
    );
    if (indice >= 0) mapa[campo] = indice;
  });
  return mapa;
}

function filaCabecera(filas: unknown[][]): number {
  let mejor = -1;
  let mejorPuntaje = 0;
  filas.slice(0, 30).forEach((fila, indice) => {
    const encontrados = Object.keys(indicePorCampo((fila ?? []).map((celda) => String(celda ?? ""))));
    if (encontrados.length > mejorPuntaje) {
      mejorPuntaje = encontrados.length;
      mejor = indice;
    }
  });
  return mejorPuntaje >= 3 ? mejor : -1;
}

function esNumero(texto: string): boolean {
  return texto !== "" && Number.isFinite(Number(texto.replace(",", ".")));
}

/** Lee el archivo en el navegador y devuelve los valores de la cita correspondiente. */
export async function leerExcelDeCita(archivo: File, hoyIso: string): Promise<LecturaCita> {
  const XLSX = await import("xlsx");
  const datos = await archivo.arrayBuffer();
  const libro = XLSX.read(datos, { cellDates: true });
  const hoja = libro.Sheets[libro.SheetNames[0] ?? ""];
  if (!hoja) {
    return { archivo: archivo.name, fila: 0, valores: {}, problemas: ["El archivo no tiene hojas legibles."], aviso: null };
  }

  const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, { header: 1, blankrows: true, raw: false, defval: "" });
  const indiceCabecera = filaCabecera(filas);
  if (indiceCabecera < 0) {
    return {
      archivo: archivo.name,
      fila: 0,
      valores: {},
      problemas: ["No se reconoció la fila de cabecera (FECHA, CICLO, NEUTROFILOS...). Complete manualmente."],
      aviso: null,
    };
  }

  const columnas = indicePorCampo((filas[indiceCabecera] ?? []).map((celda) => String(celda ?? "")));
  const cuerpo = filas
    .slice(indiceCabecera + 1)
    .map((fila, posicion) => ({ fila, numero: indiceCabecera + 2 + posicion }))
    .filter((item) => (item.fila ?? []).some((celda) => textoPlano(celda) !== ""));

  if (cuerpo.length === 0) {
    return {
      archivo: archivo.name,
      fila: 0,
      valores: {},
      problemas: ["El archivo no tiene filas de citas."],
      aviso: null,
    };
  }

  const columnaFecha = columnas.fecha;
  const candidatas =
    columnaFecha === undefined
      ? []
      : cuerpo.filter((item) => {
          const iso = leerFecha(item.fila?.[columnaFecha]).iso;
          return iso !== null && iso >= hoyIso;
        });

  const elegida = candidatas.length > 0 ? candidatas[candidatas.length - 1]! : cuerpo[cuerpo.length - 1]!;
  const aviso =
    candidatas.length > 0
      ? null
      : `Ninguna fila tiene fecha de hoy o posterior: se tomó la última fila del archivo (fila ${elegida.numero}).`;

  const valores: Partial<Record<CampoCita, string>> = {};
  const problemas: string[] = [];

  (Object.keys(SINONIMOS) as CampoCita[]).forEach((campo) => {
    const columna = columnas[campo];
    if (columna === undefined) {
      problemas.push(`No se reconoció la columna: ${ETIQUETA_CAMPO[campo]}. Complete manualmente.`);
      return;
    }
    const crudo = textoPlano(elegida.fila?.[columna]);
    if (crudo === "") return;

    if (campo === "fecha" || campo === "proximaCita") {
      const { iso } = leerFecha(elegida.fila?.[columna]);
      if (!iso) {
        problemas.push(
          `No se pudo interpretar: ${ETIQUETA_CAMPO[campo]} (fila ${elegida.numero}). Complete manualmente.`,
        );
        return;
      }
      valores[campo] = iso;
      return;
    }

    if (campo === "neutrofilos" || campo === "plaquetas" || campo === "hemoglobina" || campo === "ciclo") {
      if (!esNumero(crudo)) {
        problemas.push(
          `No se pudo interpretar: ${ETIQUETA_CAMPO[campo]} (fila ${elegida.numero}). Complete manualmente.`,
        );
        return;
      }
      valores[campo] = crudo.replace(",", ".");
      return;
    }

    valores[campo] = crudo;
  });

  return { archivo: archivo.name, fila: elegida.numero, valores, problemas, aviso };
}

/** Separa "Nauseas; Fiebre" o "Nauseas, Fiebre" en partes limpias. */
export function separarLista(texto: string): string[] {
  return texto
    .split(/[;,]/)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Devuelve la opción de la lista que coincide con el texto, o null si no hay coincidencia. */
export function coincidenciaEn(opciones: readonly string[], texto: string): string | null {
  const buscado = sinTildes(texto);
  return (
    opciones.find((opcion) => sinTildes(opcion) === buscado) ??
    opciones.find((opcion) => buscado.includes(sinTildes(opcion))) ??
    null
  );
}
