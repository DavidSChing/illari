import { ChevronDown, History } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CambioProgramacion } from "@/state/EstadoClinico";

/** Trazabilidad: qué ajustó el equipo asistencial sobre la propuesta automática. */
export function RegistroCambios({ cambios }: { cambios: CambioProgramacion[] }) {
  return (
    <Collapsible defaultOpen className="rounded-md border border-border bg-card">
      <CollapsibleTrigger className="group flex min-h-12 w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:px-4">
        <History aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Registro de cambios ({cambios.length})
        </span>
        <ChevronDown
          aria-hidden="true"
          className="ml-auto size-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {cambios.length === 0 ? (
          <p className="border-t border-border px-3 py-3 text-base text-muted-foreground md:px-4">
            Aún no hay ajustes manuales. La propuesta mostrada es la automática.
          </p>
        ) : (
          <ol className="divide-y divide-border border-t border-border">
            {cambios.map((cambio) => (
              <li key={cambio.id} className="flex gap-3 px-3 py-2 md:px-4">
                <span className="shrink-0 text-base font-bold tabular-nums text-foreground">
                  {cambio.hora}
                </span>
                <span className="text-base text-foreground">{cambio.accion}</span>
              </li>
            ))}
          </ol>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
