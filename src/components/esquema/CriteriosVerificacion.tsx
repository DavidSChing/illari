import { Square } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import type { Antropometria } from "@/data/seguimientos";
import { formatearFecha } from "@/lib/formato";
import { ALERTA_FIEBRE_FAMILIA } from "@/state/EstadoClinico";

const SIN_REGISTRO = "Sin registro reciente";

function datoDelCriterio(
  criterio: string,
  paciente: Paciente,
  antropometria: Antropometria | null,
): string {
  const lab = paciente.laboratorio;
  if (criterio.startsWith("Hemograma")) {
    return lab ? `Hemograma del ${formatearFecha(lab.fecha)}` : SIN_REGISTRO;
  }
  if (criterio.startsWith("Recuento de neutrófilos")) {
    return lab ? `${lab.neutrofilos} /mm³ · ${formatearFecha(lab.fecha)}` : SIN_REGISTRO;
  }
  if (criterio.startsWith("Sin fiebre")) {
    return paciente.alertas.includes(ALERTA_FIEBRE_FAMILIA)
      ? "La familia reportó fiebre"
      : "No hay reporte de fiebre registrado";
  }
  if (criterio.startsWith("Peso y talla")) {
    return antropometria
      ? `${antropometria.pesoKg} kg · ${antropometria.tallaCm} cm · ${formatearFecha(antropometria.fecha)}`
      : SIN_REGISTRO;
  }
  return SIN_REGISTRO;
}

export function CriteriosVerificacion({
  criterios,
  paciente,
  antropometria,
}: {
  criterios: string[];
  paciente: Paciente;
  antropometria: Antropometria | null;
}) {
  return (
    <section
      aria-labelledby="titulo-criterios"
      className="bg-card px-4 py-3"
    >
      <h2
        id="titulo-criterios"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Criterios a verificar antes del próximo ciclo
      </h2>

      <ul className="mt-2 grid gap-1.5">
        {criterios.map((criterio) => (
          <li key={criterio} className="flex items-start gap-2 rounded-md border border-border px-2 py-1.5">
            <Square aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm leading-tight">
              <span className="block text-base font-semibold text-foreground">{criterio}</span>
              <span className="block text-muted-foreground">
                {datoDelCriterio(criterio, paciente, antropometria)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-sm font-medium text-muted-foreground">
        Lista de verificación del esquema. La evaluación corresponde al médico tratante.
      </p>
    </section>
  );
}
