import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

import type { Paciente } from "@/data/tipos";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function PanelDemoFamilia({ paciente }: { paciente: Paciente }) {
  const { pacientes } = useEstadoClinico();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir controles de demostración"
        className="fixed right-2 top-2 z-50 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-sm font-semibold text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4 shrink-0" />
        Demo
      </button>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-6 pt-5">
          <SheetHeader>
            <SheetTitle className="text-left text-xl font-bold text-foreground">
              Controles de demostración
            </SheetTitle>
          </SheetHeader>
          <div className="mx-auto mt-3 grid w-full max-w-[480px] gap-4">
            <p className="text-[0.9375rem] text-muted-foreground">
              Datos sintéticos. Sin información real de pacientes.
            </p>

            <div>
              <label
                htmlFor="selector-paciente-familia"
                className="text-[0.9375rem] font-semibold text-foreground"
              >
                Ver la pantalla de otro paciente
              </label>
              <select
                id="selector-paciente-familia"
                value={paciente.id}
                onChange={(evento) =>
                  navigate({ to: "/familia/$id", params: { id: evento.target.value } })
                }
                className="mt-1 min-h-12 w-full min-w-0 rounded-md border border-input bg-card px-2 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {pacientes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/paciente/$id"
              params={{ id: paciente.id }}
              className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              Volver a la ficha médica
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
