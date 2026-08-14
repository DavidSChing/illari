import { obtenerEsquema, type Esquema } from "@/data/esquemas";
import type { Fase } from "@/data/tipos";
import type { Seguimiento } from "@/data/seguimientos";

/** Fecha de referencia de la demostración (jornada de hoy). */
export const HOY = "2026-08-14";

export interface CicloPlan {
  numero: number;
  fase: Fase;
  indiceEnFase: number;
  ciclosEnFase: number;
  offsetDias: number;
}

export type EstadoCiclo = "realizado" | "en_curso" | "programado" | "retrasado";

export interface CicloEvaluado extends CicloPlan {
  fechaPrevista: string;
  fechaReal: string | null;
  estado: EstadoCiclo;
  /** Días de desviación respecto a lo previsto (positivo = retraso). */
  diasDesviacion: number;
}

export interface EvaluacionEsquema {
  esquema: Esquema;
  ciclos: CicloEvaluado[];
  proximo: CicloEvaluado | null;
  /** Días de retraso del próximo ciclo pendiente. 0 si está al día. */
  retrasoActual: number;
  /** Suma de desviaciones positivas de todo el tratamiento. */
  retrasoAcumulado: number;
  alDia: boolean;
}

function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio ?? 1970, (mes ?? 1) - 1, dia ?? 1);
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = aFecha(iso);
  fecha.setDate(fecha.getDate() + dias);
  const mes = `${fecha.getMonth() + 1}`.padStart(2, "0");
  const dia = `${fecha.getDate()}`.padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function diferenciaDias(desdeIso: string, hastaIso: string): number {
  return Math.round((aFecha(hastaIso).getTime() - aFecha(desdeIso).getTime()) / 86400000);
}

/** Calendario previsto del esquema: un ciclo tras otro según el intervalo de su fase. */
export function ciclosPrevistos(esquema: Esquema): CicloPlan[] {
  const ciclos: CicloPlan[] = [];
  let numero = 0;
  let offset = 0;
  for (const tramo of esquema.tramos) {
    for (let i = 0; i < tramo.ciclos; i += 1) {
      numero += 1;
      ciclos.push({
        numero,
        fase: tramo.fase,
        indiceEnFase: i + 1,
        ciclosEnFase: tramo.ciclos,
        offsetDias: offset,
      });
      offset += tramo.intervaloDias;
    }
  }
  return ciclos;
}

/** Fecha de inicio del esquema para que un ciclo caiga en la fecha prevista indicada. */
export function inicioParaPrevisto(esquemaId: string, ciclo: number, fechaPrevista: string): string {
  const plan = ciclosPrevistos(obtenerEsquema(esquemaId));
  const objetivo = plan.find((item) => item.numero === ciclo);
  return sumarDias(fechaPrevista, -(objetivo?.offsetDias ?? 0));
}

/**
 * Compara la fecha prevista según el intervalo del esquema con la fecha real
 * registrada. No evalúa si el ciclo procede: eso corresponde al médico tratante.
 */
export function evaluarEsquema(seguimiento: Seguimiento, hoy = HOY): EvaluacionEsquema {
  const esquema = obtenerEsquema(seguimiento.esquemaId);
  const plan = ciclosPrevistos(esquema);

  let pendienteMarcado = false;
  const ciclos: CicloEvaluado[] = plan.map((item) => {
    const fechaPrevista = sumarDias(seguimiento.fechaInicio, item.offsetDias);
    const realizado = seguimiento.administraciones.find((adm) => adm.ciclo === item.numero);

    if (realizado) {
      return {
        ...item,
        fechaPrevista,
        fechaReal: realizado.fecha,
        estado: "realizado" as EstadoCiclo,
        diasDesviacion: diferenciaDias(fechaPrevista, realizado.fecha),
      };
    }

    const desviacion = diferenciaDias(fechaPrevista, hoy);
    let estado: EstadoCiclo = "programado";
    if (!pendienteMarcado) {
      pendienteMarcado = true;
      if (desviacion > 0) estado = "retrasado";
      else if (desviacion >= -1) estado = "en_curso";
    }

    return {
      ...item,
      fechaPrevista,
      fechaReal: null,
      estado,
      diasDesviacion: estado === "retrasado" ? desviacion : 0,
    };
  });

  const proximo = ciclos.find((ciclo) => ciclo.fechaReal === null) ?? null;
  const retrasoActual = proximo && proximo.estado === "retrasado" ? proximo.diasDesviacion : 0;
  const acumuladoRealizados = ciclos
    .filter((ciclo) => ciclo.fechaReal !== null)
    .reduce((total, ciclo) => total + Math.max(0, ciclo.diasDesviacion), 0);

  return {
    esquema,
    ciclos,
    proximo,
    retrasoActual,
    retrasoAcumulado: acumuladoRealizados + retrasoActual,
    alDia: retrasoActual === 0,
  };
}

/** Superficie corporal según la fórmula de Mosteller. Dato de referencia, no calcula dosis. */
export function superficieMosteller(pesoKg: number, tallaCm: number): number {
  return Math.sqrt((tallaCm * pesoKg) / 3600);
}

export const FORMULA_MOSTELLER = "Mosteller: √(talla cm × peso kg / 3600)";

export const DIAS_MEDICION_VIGENTE = 30;

export function medicionDesactualizada(fechaIso: string, hoy = HOY): boolean {
  return diferenciaDias(fechaIso, hoy) > DIAS_MEDICION_VIGENTE;
}
