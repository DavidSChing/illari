import type { Laboratorio, NivelSemaforo } from "@/data/tipos";
import { lecturasLaboratorio } from "@/data/umbrales";
import { formatearFecha } from "@/lib/formato";

const CLASES: Record<NivelSemaforo, string> = {
  rojo: "border-l-[3px] border-l-clinico-rojo bg-muted/40 text-foreground",
  ambar: "border-l-[3px] border-l-clinico-ambar bg-muted/40 text-foreground",
  verde: "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground",
};

const PUNTO: Record<NivelSemaforo, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

export function TarjetasLaboratorio({ laboratorio }: { laboratorio: Laboratorio | null }) {
  if (!laboratorio) {
    return (
      <section aria-labelledby="titulo-lab" className="rounded-md border border-dashed border-border bg-card px-4 py-3">
        <h2 id="titulo-lab" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Últimos valores de laboratorio
        </h2>
        <p className="mt-1 text-base text-foreground">
          El Excel cargado no registra valores de laboratorio. La plataforma no completa datos que no existen
          en el archivo.
        </p>
      </section>
    );
  }

  const lecturas = lecturasLaboratorio(laboratorio);

  return (
    <section aria-labelledby="titulo-lab" className="bg-card px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-lab" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Últimos valores de laboratorio
        </h2>
        <p className="text-sm font-medium text-muted-foreground">
          Examen del {formatearFecha(laboratorio.fecha)}
        </p>
      </div>

      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {lecturas.map((lectura) => (
          <li key={lectura.nombre} className={`rounded-md border px-3 py-2 ${CLASES[lectura.nivel]}`}>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className={`size-3 rounded-full ${PUNTO[lectura.nivel]}`} />
              <span className="text-sm font-semibold uppercase tracking-wide">{lectura.nombre}</span>
            </div>
            <p className="mt-1 text-xl font-bold leading-tight">
              {lectura.valor}
              <span className="ml-1 text-sm font-medium">{lectura.unidad}</span>
            </p>
            <p className="text-sm font-semibold">{lectura.etiqueta}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
