/**
 * Lectura del Excel de la cita, guiada por src/config/camposCita.ts.
 * Todo ocurre en el navegador con SheetJS: el archivo nunca se sube ni se modifica.
 * Si un valor no se puede interpretar, queda vacío y se reporta: la plataforma no adivina.
 */
import { CAMPOS_CITA } from "@/config/camposCita";
import { leerFecha, normalizarEncabezado, textoPlano } from "./mapeo";

export interface LecturaCampos {
  archivo: string;
  /** Fila del archivo, en numeración de Excel (1 = primera fila). */
  fila: number;
  valores: Record<string, string>;
  problemas: string[];
  aviso: string | null;
}

function indicePorCampo(encabezados: string[]): Record<string, number> {
  const normalizados = encabezados.map(normalizarEncabezado);
  const mapa: Record<string, number> = {};
  CAMPOS_CITA.forEach((campo) => {
    const sinonimos = campo.sinonimosExcel.map(normalizarEncabezado);
    const indice = normalizados.findIndex((encabezado) =>
      sinonimos.some((sinonimo) => encabezado === sinonimo || encabezado.startsWith(`${sinonimo} `)),
    );
    if (indice >= 0) mapa[campo.id] = indice;
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
  return mejorPuntaje >= 1 ? mejor : -1;
}

function esNumero(texto: string): boolean {
  return texto !== "" && Number.isFinite(Number(texto.replace(",", ".")));
}

export async function leerCamposDeCita(archivo: File, hoyIso: string): Promise<LecturaCampos> {
  const XLSX = await import("xlsx");
  const datos = await archivo.arrayBuffer();
  const libro = XLSX.read(datos, { cellDates: true });
  const hoja = libro.Sheets[libro.SheetNames[0] ?? ""];
  const vacio: LecturaCampos = { archivo: archivo.name, fila: 0, valores: {}, problemas: [], aviso: null };
  if (!hoja) return { ...vacio, problemas: ["El archivo no tiene hojas legibles."] };

  const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
    header: 1,
    blankrows: true,
    raw: false,
    defval: "",
  });
  const indiceCabecera = filaCabecera(filas);
  if (indiceCabecera < 0) {
    return {
      ...vacio,
      problemas: ["No se reconoció la fila de cabecera. Complete manualmente."],
    };
  }

  const columnas = indicePorCampo((filas[indiceCabecera] ?? []).map((celda) => String(celda ?? "")));
  const cuerpo = filas
    .slice(indiceCabecera + 1)
    .map((fila, posicion) => ({ fila, numero: indiceCabecera + 2 + posicion }))
    .filter((item) => (item.fila ?? []).some((celda) => textoPlano(celda) !== ""));

  if (cuerpo.length === 0) return { ...vacio, problemas: ["El archivo no tiene filas de citas."] };

  const campoFecha = CAMPOS_CITA.find((campo) => campo.tipo === "fecha");
  const columnaFecha = campoFecha ? columnas[campoFecha.id] : undefined;
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
      : `Se tomó la última fila del archivo (fila ${elegida.numero}).`;

  const valores: Record<string, string> = {};
  const problemas: string[] = [];

  CAMPOS_CITA.forEach((campo) => {
    const columna = columnas[campo.id];
    if (columna === undefined) {
      problemas.push(`No se reconoció la columna: ${campo.etiqueta}. Complete manualmente.`);
      return;
    }
    const crudo = textoPlano(elegida.fila?.[columna]);
    if (crudo === "") return;

    if (campo.tipo === "fecha") {
      const { iso } = leerFecha(elegida.fila?.[columna]);
      if (!iso) {
        problemas.push(`No se pudo interpretar: ${campo.etiqueta} (fila ${elegida.numero}).`);
        return;
      }
      valores[campo.id] = iso;
      return;
    }

    if (campo.tipo === "numero") {
      if (!esNumero(crudo)) {
        problemas.push(`No se pudo interpretar: ${campo.etiqueta} (fila ${elegida.numero}).`);
        return;
      }
      valores[campo.id] = crudo.replace(",", ".");
      return;
    }

    valores[campo.id] = crudo;
  });

  return { archivo: archivo.name, fila: elegida.numero, valores, problemas, aviso };
}
