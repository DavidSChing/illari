import type { ResumenOcupacion } from "@/lib/programacion";

interface Props {
  actual: ResumenOcupacion;
  sugerida: ResumenOcupacion;
  capacidad: number;
}

const ALTO = 140;

function Grafico({
  titulo,
  resumen,
  escala,
  capacidad,
  tono,
}: {
  titulo: string;
  resumen: ResumenOcupacion;
  escala: number;
  capacidad: number;
  tono: string;
}) {
  const franjas = resumen.franjas;
  const proporcionCapacidad = Math.min(1, capacidad / escala);

  return (
    <figure className="rounded-md border border-border bg-card px-3 py-3">
      <figcaption className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </figcaption>

      <div className="mt-3 flex gap-2">
        <div
          aria-hidden="true"
          className="flex flex-col justify-between text-[0.6875rem] tabular-nums text-muted-foreground"
          style={{ height: ALTO }}
        >
          <span>{escala}</span>
          <span>0</span>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative flex items-end gap-1 border-b border-l border-border"
            style={{ height: ALTO }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-foreground/40"
              style={{ bottom: `${proporcionCapacidad * 100}%` }}
            />
            {franjas.map((franja) => (
              <div key={franja.hora} className="flex h-full min-w-0 flex-1 items-end">
                <div
                  className={`w-full rounded-t-[4px] ${tono}`}
                  style={{ height: `${Math.max(2, (franja.pacientes / escala) * 100)}%` }}
                  title={`${franja.hora}: ${franja.pacientes} pacientes`}
                />
              </div>
            ))}
          </div>

          <div className="mt-1 flex gap-1">
            {franjas.map((franja) => (
              <span
                key={franja.hora}
                className="min-w-0 flex-1 truncate text-center text-[0.6875rem] tabular-nums text-muted-foreground"
              >
                {franja.hora}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{titulo}: pacientes por franja horaria</caption>
        <thead>
          <tr>
            <th scope="col">Franja</th>
            <th scope="col">Pacientes</th>
          </tr>
        </thead>
        <tbody>
          {franjas.map((franja) => (
            <tr key={franja.hora}>
              <th scope="row">{franja.hora}</th>
              <td>{franja.pacientes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Cifra({
  etiqueta,
  antes,
  despues,
}: {
  etiqueta: string;
  antes: string;
  despues: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {etiqueta}
      </p>
      <dl className="mt-1 flex items-baseline gap-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Antes</dt>
          <dd className="text-2xl font-bold tabular-nums text-muted-foreground">{antes}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Después</dt>
          <dd className="text-2xl font-bold tabular-nums text-foreground">{despues}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ComparacionOcupacion({ actual, sugerida, capacidad }: Props) {
  const escala = Math.max(capacidad, actual.ocupacionMaxima, sugerida.ocupacionMaxima, 1);

  return (
    <section aria-labelledby="titulo-comparacion" className="grid gap-3">
      <h2 id="titulo-comparacion" className="text-lg font-bold text-foreground">
        Comparación de la ocupación
      </h2>
      <p className="text-sm text-muted-foreground">
        Ambos gráficos usan la misma escala vertical. La línea punteada marca la capacidad de{" "}
        {capacidad} {capacidad === 1 ? "sillón" : "sillones"}.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Grafico
          titulo="Programación actual"
          resumen={actual}
          escala={escala}
          capacidad={capacidad}
          tono="bg-muted-foreground/60"
        />
        <Grafico
          titulo="Programación sugerida"
          resumen={sugerida}
          escala={escala}
          capacidad={capacidad}
          tono="bg-primary"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Cifra
          etiqueta="Ocupación máxima en una franja"
          antes={String(actual.ocupacionMaxima)}
          despues={String(sugerida.ocupacionMaxima)}
        />
        <Cifra
          etiqueta="Franjas con sillones vacíos"
          antes={String(actual.franjasConVacios)}
          despues={String(sugerida.franjasConVacios)}
        />
        <Cifra
          etiqueta="Hora de término de la jornada"
          antes={actual.horaTermino}
          despues={sugerida.horaTermino}
        />
      </div>
    </section>
  );
}
