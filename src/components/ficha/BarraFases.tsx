import type { Fase } from "@/data/tipos";

const FASES: Fase[] = ["Inducción", "Consolidación", "Intensificación", "Mantenimiento"];

export function BarraFases({
  fase,
  cicloActual,
  ciclosTotales,
}: {
  fase: Fase | null;
  cicloActual: number;
  ciclosTotales: number | null;
}) {
  const indiceActual = fase ? FASES.indexOf(fase) : -1;
  const porcentaje = ciclosTotales ? Math.round((cicloActual / ciclosTotales) * 100) : null;

  return (
    <section aria-labelledby="titulo-fases" className="rounded-md border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-fases" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fase del tratamiento
        </h2>
        <p className="text-xl font-bold text-foreground">
          Ciclo {cicloActual}{ciclosTotales ? ` de ${ciclosTotales}` : " registrado"}
          {porcentaje !== null && (
            <span className="ml-2 text-base font-medium text-muted-foreground">({porcentaje}%)</span>
          )}
        </p>
      </div>

      {!fase && (
        <p className="mt-2 text-base text-muted-foreground">
          El Excel no registra la fase del tratamiento. Solo se muestra lo que el archivo contiene.
        </p>
      )}

      <ol className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Fases del protocolo">
        {FASES.map((nombre, indice) => {
          const completada = indice < indiceActual;
          const actual = indice === indiceActual;
          return (
            <li
              key={nombre}
              aria-current={actual ? "step" : undefined}
              className={[
                "rounded-md border px-3 py-2 text-base",
                actual
                  ? "border-primary bg-primary text-primary-foreground font-bold"
                  : completada
                    ? "border-border bg-secondary text-secondary-foreground font-medium"
                    : "border-dashed border-border bg-card text-muted-foreground",
              ].join(" ")}
            >
              <span className="block text-xs uppercase tracking-wide opacity-90">
                {completada ? "Completada" : actual ? "En curso" : "Pendiente"}
              </span>
              {nombre}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
