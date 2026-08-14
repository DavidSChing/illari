import { useState } from "react";
import { Check } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import {
  calendarioSesiones,
  cuadriculaDelMes,
  fechaEnPalabras,
  inicioDeMes,
  moverMeses,
  nombreDelMes,
  type SesionCalendario,
} from "@/lib/familia";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

export function CalendarioTratamiento({ paciente }: { paciente: Paciente }) {
  const sesiones = calendarioSesiones(paciente);
  const porFecha = new Map<string, SesionCalendario>(sesiones.map((sesion) => [sesion.iso, sesion]));

  const [mes, setMes] = useState(() => inicioDeMes(paciente.fechaProximaCita));
  const [seleccionada, setSeleccionada] = useState<SesionCalendario | null>(
    () => sesiones.find((sesion) => sesion.estado === "proxima") ?? null,
  );

  const celdas = cuadriculaDelMes(mes);

  return (
    <section
      aria-labelledby="titulo-calendario"
      className="rounded-lg border border-border bg-card p-4"
    >
      <h2 id="titulo-calendario" className="text-xl font-bold text-foreground">
        Calendario del tratamiento
      </h2>
      <p className="mt-1 text-base text-foreground">
        Las sesiones con visto verde ya se hicieron. La azul es la próxima. Las grises son fechas
        estimadas.
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMes(moverMeses(mes, -1))}
          className="min-h-12 rounded-md border border-input bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ‹ Anterior
        </button>
        <p aria-live="polite" className="text-lg font-bold text-foreground">
          {nombreDelMes(mes)}
        </p>
        <button
          type="button"
          onClick={() => setMes(moverMeses(mes, 1))}
          className="min-h-12 rounded-md border border-input bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Siguiente ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {DIAS.map((dia, indice) => (
          <p key={`${dia}-${indice}`} className="text-sm font-bold text-muted-foreground">
            {dia}
          </p>
        ))}

        {celdas.map((celda) => {
          const sesion = porFecha.get(celda.iso);

          if (!sesion) {
            return (
              <p
                key={celda.iso}
                className={`flex h-12 items-center justify-center rounded-md text-base ${
                  celda.delMes ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {celda.dia}
              </p>
            );
          }

          const estilo =
            sesion.estado === "realizada"
              ? "border-clinico-verde bg-clinico-verde-suave text-clinico-verde-foreground"
              : sesion.estado === "proxima"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-foreground";

          return (
            <button
              key={celda.iso}
              type="button"
              onClick={() => setSeleccionada(sesion)}
              aria-label={`Sesión ${sesion.numero}, ${fechaEnPalabras(sesion.iso)}`}
              className={`flex h-12 flex-col items-center justify-center rounded-md border-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${estilo}`}
            >
              <span>{celda.dia}</span>
              {sesion.estado === "realizada" ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <span className="text-xs font-semibold">S{sesion.numero}</span>
              )}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-3 rounded-md bg-secondary p-3 text-base font-semibold text-secondary-foreground">
        {seleccionada
          ? `${fechaEnPalabras(seleccionada.iso)} · ${seleccionada.detalle}`
          : "Toque un día marcado para ver qué se hizo o qué se hará."}
      </p>
    </section>
  );
}
