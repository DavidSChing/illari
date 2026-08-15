import { Ruler, AlertTriangle } from "lucide-react";
import type { Antropometria } from "@/data/seguimientos";
import { formatearFecha } from "@/lib/formato";
import { FORMULA_MOSTELLER, medicionDesactualizada, superficieMosteller } from "@/lib/esquema";

export function ReferenciaAntropometrica({ antropometria }: { antropometria: Antropometria | null }) {
  const desactualizada = antropometria ? medicionDesactualizada(antropometria.fecha) : false;

  return (
    <section
      aria-labelledby="titulo-antropometria"
      className={`rounded-md border px-4 py-3 ${
        desactualizada
          ? "border-l-[3px] border-l-clinico-ambar bg-muted/40 text-foreground"
          : "border-border bg-card"
      }`}
    >
      <h2 id="titulo-antropometria" className="text-sm font-semibold uppercase tracking-wide">
        Referencia antropométrica
      </h2>

      {!antropometria ? (
        <p className="mt-1 text-base text-muted-foreground">Sin registro reciente de peso y talla.</p>
      ) : (
        <>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg font-bold text-foreground">
            <Ruler aria-hidden="true" className="size-5 text-primary" />
            <span>Peso {antropometria.pesoKg} kg</span>
            <span>Talla {antropometria.tallaCm} cm</span>
            <span>
              Superficie corporal{" "}
              {superficieMosteller(antropometria.pesoKg, antropometria.tallaCm).toFixed(2)} m²
            </span>
          </p>
          <p className="text-sm font-medium">
            {FORMULA_MOSTELLER} · Medición del {formatearFecha(antropometria.fecha)}
          </p>
          {desactualizada && (
            <p className="mt-1 inline-flex items-center gap-2 rounded-md border-l-[3px] border-l-clinico-ambar px-2 py-1 text-sm font-bold">
              <AlertTriangle aria-hidden="true" className="size-4" />
              Medición desactualizada
            </p>
          )}
        </>
      )}

      <p className="mt-1 text-sm font-medium text-muted-foreground">
        Dato de referencia. La aplicación no calcula ni sugiere dosis.
      </p>
    </section>
  );
}
