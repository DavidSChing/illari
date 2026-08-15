import type { OpcionesProgramacion } from "@/lib/programacion";

interface Props {
  valores: Required<OpcionesProgramacion>;
  onCambio: (parcial: Partial<Required<OpcionesProgramacion>>) => void;
}

const campo =
  "min-h-12 w-full rounded-md border border-input bg-background px-3 text-base tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function PanelConfiguracion({ valores, onCambio }: Props) {
  return (
    <section
      aria-labelledby="titulo-configuracion"
      className="rounded-md border border-border bg-card px-3 py-3 md:px-4"
    >
      <h2
        id="titulo-configuracion"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Configuración de la propuesta
      </h2>

      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="capacidad" className="text-sm font-semibold text-foreground">
            Capacidad por bloque (sillones)
          </label>
          <input
            id="capacidad"
            type="number"
            min={1}
            max={30}
            step={1}
            value={valores.capacidadPorBloque}
            onChange={(evento) => {
              const numero = Number(evento.target.value);
              if (Number.isFinite(numero) && numero >= 1) {
                onCambio({ capacidadPorBloque: Math.min(30, Math.floor(numero)) });
              }
            }}
            className={`mt-1 ${campo}`}
          />
        </div>

        <div>
          <label htmlFor="hora-inicio" className="text-sm font-semibold text-foreground">
            Hora de inicio
          </label>
          <input
            id="hora-inicio"
            type="time"
            step={1800}
            value={valores.horaInicio}
            onChange={(evento) => {
              if (evento.target.value) onCambio({ horaInicio: evento.target.value });
            }}
            className={`mt-1 ${campo}`}
          />
        </div>

        <div>
          <label htmlFor="intervalo" className="text-sm font-semibold text-foreground">
            Intervalo entre bloques (horas)
          </label>
          <select
            id="intervalo"
            value={String(valores.intervaloBloques)}
            onChange={(evento) => onCambio({ intervaloBloques: Number(evento.target.value) })}
            className={`mt-1 ${campo}`}
          >
            {[1, 1.5, 2, 2.5, 3].map((horas) => (
              <option key={horas} value={horas}>
                {horas} h
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
