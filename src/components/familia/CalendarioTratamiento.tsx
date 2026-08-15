import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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

function useEsAngosto(limite = 480) {
  const [angosto, setAngosto] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia(`(max-width: ${limite - 1}px)`);
    const actualizar = () => setAngosto(consulta.matches);
    actualizar();
    consulta.addEventListener("change", actualizar);
    return () => consulta.removeEventListener("change", actualizar);
  }, [limite]);

  return angosto;
}

export function CalendarioTratamiento({ paciente }: { paciente: Paciente }) {
  const sesiones = calendarioSesiones(paciente);
  const porFecha = new Map<string, SesionCalendario>(sesiones.map((sesion) => [sesion.iso, sesion]));

  const [mes, setMes] = useState(() => inicioDeMes(paciente.fechaProximaCita));
  const [seleccionada, setSeleccionada] = useState<SesionCalendario | null>(
    () => sesiones.find((sesion) => sesion.estado === "proxima") ?? null,
  );
  const [mesCompleto, setMesCompleto] = useState(false);
  const angosto = useEsAngosto();

  const celdas = cuadriculaDelMes(mes);

  const cuadricula = (
    <>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMes(moverMeses(mes, -1))}
          className="min-h-12 min-w-12 rounded-md border border-input bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ‹ Anterior
        </button>
        <p aria-live="polite" className="text-lg font-bold text-foreground">
          {nombreDelMes(mes)}
        </p>
        <button
          type="button"
          onClick={() => setMes(moverMeses(mes, 1))}
          className="min-h-12 min-w-12 rounded-md border border-input bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Siguiente ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {DIAS.map((dia, indice) => (
          <p key={`${dia}-${indice}`} className="text-[0.9375rem] font-bold text-foreground">
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
              ? "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground"
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
    </>
  );

  return (
    <section aria-labelledby="titulo-calendario" className="bg-card p-4">
      <h2 id="titulo-calendario" className="text-xl font-bold text-foreground">
        Calendario del tratamiento
      </h2>
      <p className="mt-1 text-[1.0625rem] text-foreground">
        Las sesiones con visto verde ya se hicieron. La azul es la próxima. Las grises son fechas
        estimadas.
      </p>

      {angosto ? (
        <>
          <ul className="mt-3 flex flex-col gap-2">
            {sesiones.map((sesion) => {
              const estilo =
                sesion.estado === "realizada"
                  ? "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground"
                  : sesion.estado === "proxima"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground";
              return (
                <li key={sesion.iso}>
                  <button
                    type="button"
                    onClick={() => setSeleccionada(sesion)}
                    className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-md border-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${estilo}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-lg font-bold">{fechaEnPalabras(sesion.iso)}</span>
                      <span className="block text-[0.9375rem] font-semibold">
                        Sesión {sesion.numero} ·{" "}
                        {sesion.estado === "realizada"
                          ? "Ya se hizo"
                          : sesion.estado === "proxima"
                            ? "Su próxima cita"
                            : "Fecha estimada"}
                      </span>
                    </span>
                    {sesion.estado === "realizada" && (
                      <Check aria-hidden="true" className="size-6 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setMesCompleto(true)}
            className="mt-3 flex min-h-14 w-full items-center justify-center rounded-md border-2 border-foreground bg-card px-4 text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ver mes completo
          </button>
        </>
      ) : (
        cuadricula
      )}

      <p
        aria-live="polite"
        className="mt-3 rounded-md bg-secondary p-3 text-[1.0625rem] font-semibold text-secondary-foreground"
      >
        {seleccionada
          ? `${fechaEnPalabras(seleccionada.iso)} · ${seleccionada.detalle}`
          : "Toque una fecha marcada para ver qué se hizo o qué se hará."}
      </p>

      {mesCompleto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Calendario del mes completo"
          className="fixed inset-0 z-50 overflow-y-auto bg-background p-4"
        >
          <div className="mx-auto w-full max-w-[480px]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-foreground">Mes completo</h3>
              <button
                type="button"
                autoFocus
                onClick={() => setMesCompleto(false)}
                className="flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-md border-2 border-foreground px-3 text-lg font-bold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X aria-hidden="true" className="size-6" />
                Cerrar
              </button>
            </div>
            {cuadricula}
            <p className="mt-3 rounded-md bg-secondary p-3 text-[1.0625rem] font-semibold text-secondary-foreground">
              {seleccionada
                ? `${fechaEnPalabras(seleccionada.iso)} · ${seleccionada.detalle}`
                : "Toque un día marcado para ver qué se hizo o qué se hará."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
