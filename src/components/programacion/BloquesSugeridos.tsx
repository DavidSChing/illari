import { Anchor } from "lucide-react";

import { composicionBloque, type BloqueProgramado } from "@/lib/programacion";
import { MenuAjustePaciente } from "@/components/programacion/MenuAjustePaciente";
import type { NivelSemaforo } from "@/data/tipos";


const BARRA: Record<NivelSemaforo, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

const PLURAL: Record<NivelSemaforo, [string, string]> = {
  rojo: ["rojo", "rojos"],
  ambar: ["ámbar", "ámbar"],
  verde: ["sin alertas", "sin alertas"],
};

/** "Mateo Quispe" -> "Mateo Q." */
function nombreCorto(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return nombre;
  return `${partes[0]} ${partes[1]!.charAt(0)}.`;
}

function textoComposicion(bloque: BloqueProgramado): string {
  const conteo = composicionBloque(bloque);
  return (["rojo", "ambar", "verde"] as const)
    .filter((nivel) => conteo[nivel] > 0)
    .map((nivel) => `${conteo[nivel]} ${PLURAL[nivel][conteo[nivel] === 1 ? 0 : 1]}`)
    .join(" · ");
}

export function BloquesSugeridos({
  bloques,
  capacidad,
}: {
  bloques: BloqueProgramado[];
  capacidad: number;
}) {
  if (bloques.length === 0) {
    return (
      <p className="rounded-md border border-border bg-card px-4 py-6 text-base text-muted-foreground">
        No hay bloques por mostrar con los datos cargados.
      </p>
    );
  }

  return (
    <ol className="grid gap-3">
      {bloques.map((bloque) => {
        const libres = Math.max(0, capacidad - bloque.entradas.length);
        return (
          <li
            key={bloque.indice}
            className="rounded-md border border-border bg-card px-3 py-3 md:px-4"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-bold tabular-nums text-foreground">{bloque.hora}</p>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Bloque {bloque.indice + 1} de {bloques.length}
              </p>
              <p className="ml-auto text-base font-semibold text-foreground">
                {textoComposicion(bloque)}
              </p>
            </div>

            <ul
              aria-label={`Sillones del bloque de las ${bloque.hora}`}
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9"
            >
              {Array.from(
                { length: Math.max(capacidad, bloque.entradas.length) },
                (_, indice) => {
                  const entrada = bloque.entradas[indice];
                  if (!entrada) {
                    return (
                      <li
                        key={`libre-${indice}`}
                        className="flex min-h-12 items-center justify-center rounded-sm border-2 border-dashed border-border text-sm font-semibold text-muted-foreground"
                      >
                        Libre
                      </li>
                    );
                  }
                  return (
                    <li
                      key={entrada.paciente.id}
                      className="flex min-h-12 items-center rounded-sm border border-border bg-muted/40"
                    >
                      <span
                        aria-hidden="true"
                        className={`w-[3px] shrink-0 self-stretch rounded-l-sm ${BARRA[entrada.paciente.nivel]}`}
                      />
                      <span className="flex min-w-0 flex-1 items-center gap-1 px-2">
                        {entrada.fijado ? (
                          <Anchor
                            aria-label="Fijado por el equipo"
                            className="size-4 shrink-0 text-foreground"
                          />
                        ) : null}
                        <span className="truncate text-sm font-semibold text-foreground">
                          {nombreCorto(entrada.paciente.nombre)}
                        </span>
                      </span>
                      <MenuAjustePaciente
                        pacienteId={entrada.paciente.id}
                        nombre={entrada.paciente.nombre}
                        indiceBloque={bloque.indice}
                        horasDeBloques={bloques.map((otro) => otro.hora)}
                        fijado={Boolean(entrada.fijado)}
                      />
                    </li>
                  );
                },
              )}

            </ul>

            {libres > 0 ? (
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {libres} {libres === 1 ? "asiento disponible" : "asientos disponibles"}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
