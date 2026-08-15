import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { NivelSemaforo } from "@/data/tipos";

const SEVERIDAD: Record<string, NivelSemaforo> = {
  Neutropenia: "rojo",
  "Fiebre reportada por la familia": "rojo",
  "Faltó a control previo": "ambar",
  "Riesgo social alto": "ambar",
};

const BARRA: Record<NivelSemaforo, string> = {
  rojo: "border-l-clinico-rojo",
  ambar: "border-l-clinico-ambar",
  verde: "border-l-clinico-verde",
};

const ICONO: Record<NivelSemaforo, string> = {
  rojo: "text-clinico-rojo",
  ambar: "text-clinico-ambar",
  verde: "text-clinico-verde",
};

export function PanelAlertas({ alertas }: { alertas: string[] }) {
  return (
    <section aria-labelledby="titulo-alertas">
      <h2 id="titulo-alertas" className="micro-etiqueta">
        Alertas
      </h2>

      {alertas.length === 0 ? (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border border-l-[3px] border-l-clinico-verde bg-card px-3 py-2">
          <CheckCircle2 aria-hidden="true" className={`size-4 shrink-0 ${ICONO.verde}`} />
          <p className="dato-destacado text-foreground">Sin alertas activas registradas</p>
        </div>
      ) : (
        <ul className="mt-2 grid gap-2">
          {alertas.map((alerta) => {
            const nivel = SEVERIDAD[alerta] ?? "ambar";
            return (
              <li
                key={alerta}
                className={`flex items-center gap-2 rounded-md border border-border border-l-[3px] bg-card px-3 py-2 ${BARRA[nivel]}`}
              >
                <AlertTriangle aria-hidden="true" className={`size-4 shrink-0 ${ICONO[nivel]}`} />
                <span className="dato-destacado text-foreground">{alerta}</span>
                <span className="micro-etiqueta ml-auto">
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
