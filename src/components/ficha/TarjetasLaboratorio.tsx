import type { Laboratorio, NivelSemaforo } from "@/data/tipos";
import { lecturasLaboratorio } from "@/data/umbrales";
import { formatearFecha } from "@/lib/formato";

const PUNTO: Record<NivelSemaforo, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

export function TarjetasLaboratorio({ laboratorio }: { laboratorio: Laboratorio | null }) {
  if (!laboratorio) {
    return (
      <section aria-labelledby="titulo-lab" className="linea-superior pt-3">
        <h2 id="titulo-lab" className="micro-etiqueta">
          Últimos valores de laboratorio
        </h2>
        <p className="mt-2 text-base text-foreground">
          El Excel cargado no registra valores de laboratorio. La plataforma no completa datos que no existen
          en el archivo.
        </p>
      </section>
    );
  }

  const lecturas = lecturasLaboratorio(laboratorio);

  return (
    <section aria-labelledby="titulo-lab" className="linea-superior pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-lab" className="micro-etiqueta">
          Últimos valores de laboratorio
        </h2>
        <p className="text-xs text-muted-foreground">
          Examen del {formatearFecha(laboratorio.fecha)}
        </p>
      </div>

      <ul className="mt-3 grid gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {lecturas.map((lectura) => (
          <li key={lectura.nombre} className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
            <p className="micro-etiqueta">{lectura.nombre}</p>
            <p className="mt-1 cifra-clinica text-foreground">
              {lectura.valor}
              <span className="ml-1.5 text-[0.8125rem] font-normal tracking-normal text-muted-foreground">
                {lectura.unidad}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs font-medium text-foreground">
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${PUNTO[lectura.nivel]}`} />
              {lectura.etiqueta}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
