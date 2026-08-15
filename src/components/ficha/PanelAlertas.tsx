import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { NivelSemaforo } from "@/data/tipos";

const SEVERIDAD: Record<string, NivelSemaforo> = {
  Neutropenia: "rojo",
  "Fiebre reportada por la familia": "rojo",
  "Faltó a control previo": "ambar",
  "Riesgo social alto": "ambar",
};

const CLASES: Record<NivelSemaforo, string> = {
  rojo: "border-l-[3px] border-l-clinico-rojo bg-muted/40 text-foreground",
  ambar: "border-l-[3px] border-l-clinico-ambar bg-muted/40 text-foreground",
  verde: "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground",
};

export function PanelAlertas({ alertas }: { alertas: string[] }) {
  return (
    <section aria-labelledby="titulo-alertas" className="bg-card px-4 py-3">
      <h2 id="titulo-alertas" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Alertas
      </h2>

      {alertas.length === 0 ? (
        <div className={`mt-2 flex items-center gap-2 rounded-md border px-3 py-2 ${CLASES.verde}`}>
          <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
          <p className="text-base font-semibold">Sin alertas activas registradas</p>
        </div>
      ) : (
        <ul className="mt-2 grid gap-2">
          {alertas.map((alerta) => {
            const nivel = SEVERIDAD[alerta] ?? "ambar";
            return (
              <li
                key={alerta}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 ${CLASES[nivel]}`}
              >
                <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
                <span className="text-base font-semibold">{alerta}</span>
                <span className="ml-auto text-xs font-semibold uppercase tracking-wide">
                  {nivel === "rojo" ? "Prioridad alta" : "Atención"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
