import type { Laboratorio, NivelSemaforo } from "@/data/tipos";
import { lecturasLaboratorio } from "@/data/umbrales";
import { formatearFecha } from "@/lib/formato";

const CLASES: Record<NivelSemaforo, string> = {
  rojo: "border-clinico-rojo bg-clinico-rojo-suave text-clinico-rojo-foreground",
  ambar: "border-clinico-ambar bg-clinico-ambar-suave text-clinico-ambar-foreground",
  verde: "border-clinico-verde bg-clinico-verde-suave text-clinico-verde-foreground",
};

const PUNTO: Record<NivelSemaforo, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

export function TarjetasLaboratorio({ laboratorio }: { laboratorio: Laboratorio }) {
  const lecturas = lecturasLaboratorio(laboratorio);

  return (
    <section aria-labelledby="titulo-lab" className="rounded-md border border-border bg-card p-4">
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
            <p className="mt-1 text-2xl font-bold leading-tight">
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
