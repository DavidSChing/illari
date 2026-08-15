import { Check, CircleDot, CalendarClock, AlertTriangle } from "lucide-react";
import type { CicloEvaluado, EstadoCiclo } from "@/lib/esquema";
import { FASES_ESQUEMA } from "@/data/esquemas";
import { formatearFecha } from "@/lib/formato";

const ESTILO: Record<EstadoCiclo, { clase: string; etiqueta: string; Icono: typeof Check }> = {
  realizado: {
    clase: "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground",
    etiqueta: "Realizado",
    Icono: Check,
  },
  en_curso: {
    clase: "border-primary bg-primary text-primary-foreground",
    etiqueta: "En curso",
    Icono: CircleDot,
  },
  programado: {
    clase: "border-border bg-secondary text-muted-foreground",
    etiqueta: "Programado",
    Icono: CalendarClock,
  },
  retrasado: {
    clase: "border-l-[3px] border-l-clinico-rojo bg-muted/40 text-foreground",
    etiqueta: "Retrasado",
    Icono: AlertTriangle,
  },
};

export function LineaTiempoEsquema({ ciclos }: { ciclos: CicloEvaluado[] }) {
  return (
    <section
      aria-labelledby="titulo-linea-tiempo"
      className="bg-card px-4 py-3"
    >
      <h2
        id="titulo-linea-tiempo"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Línea de tiempo del esquema
      </h2>

      <ol className="mt-2 grid gap-2 md:grid-cols-4">
        {FASES_ESQUEMA.map((fase) => {
          const deLaFase = ciclos.filter((ciclo) => ciclo.fase === fase);
          return (
            <li key={fase} className="rounded-md border border-border p-2">
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">{fase}</p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {deLaFase.map((ciclo) => {
                  const { clase, etiqueta, Icono } = ESTILO[ciclo.estado];
                  const detalle =
                    ciclo.estado === "realizado"
                      ? formatearFecha(ciclo.fechaReal ?? "")
                      : ciclo.estado === "retrasado"
                        ? `${ciclo.diasDesviacion} d de retraso`
                        : formatearFecha(ciclo.fechaPrevista);
                  return (
                    <li
                      key={ciclo.numero}
                      className={`flex min-w-[7.5rem] flex-1 items-start gap-1.5 rounded-md border px-2 py-1 ${clase}`}
                    >
                      <Icono aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      <span className="text-xs leading-tight">
                        <span className="block text-sm font-bold">Ciclo {ciclo.numero}</span>
                        <span className="block font-semibold">{etiqueta}</span>
                        <span className="block">{detalle}</span>
                      </span>
                    </li>
                  );
                })}
                {deLaFase.length === 0 && (
                  <li className="text-sm text-muted-foreground">Sin ciclos en esta fase</li>
                )}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
