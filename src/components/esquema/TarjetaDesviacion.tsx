import { CalendarCheck, CalendarX } from "lucide-react";
import type { EvaluacionEsquema } from "@/lib/esquema";
import { formatearFecha } from "@/lib/formato";

export function TarjetaDesviacion({ evaluacion }: { evaluacion: EvaluacionEsquema }) {
  const { proximo, retrasoActual, retrasoAcumulado, alDia } = evaluacion;
  const Icono = alDia ? CalendarCheck : CalendarX;

  return (
    <section
      aria-labelledby="titulo-desviacion"
      className={`rounded-md border-2 px-4 py-3 ${
        alDia
          ? "border-clinico-verde bg-clinico-verde-suave text-clinico-verde-foreground"
          : "border-clinico-rojo bg-clinico-rojo-suave text-clinico-rojo-foreground"
      }`}
    >
      <h2 id="titulo-desviacion" className="text-sm font-semibold uppercase tracking-wide">
        Desviación del calendario
      </h2>

      <p className="mt-1 flex items-start gap-2 text-2xl font-bold leading-tight">
        <Icono aria-hidden="true" className="mt-1 size-7 shrink-0" />
        {alDia ? (
          <span>Al día con el calendario</span>
        ) : (
          <span>
            Ciclo {proximo?.numero} previsto para el {formatearFecha(proximo?.fechaPrevista ?? "")} ·{" "}
            {retrasoActual} días de retraso
          </span>
        )}
      </p>

      <p className="mt-1 text-lg font-semibold">
        Retraso acumulado en el tratamiento: {retrasoAcumulado} días
      </p>

      {alDia && proximo && (
        <p className="text-base font-medium">
          Próximo ciclo {proximo.numero} previsto para el {formatearFecha(proximo.fechaPrevista)}
        </p>
      )}

      <p className="mt-1 text-sm font-medium">
        El sistema muestra el calendario. La decisión clínica corresponde al médico tratante.
      </p>
    </section>
  );
}
