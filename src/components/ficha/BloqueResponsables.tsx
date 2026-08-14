import { Info } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import { nombreMedico } from "@/data/medicos";
import { useEstadoClinico } from "@/state/EstadoClinico";

export function BloqueResponsables({ paciente }: { paciente: Paciente }) {
  const { medicoActualId } = useEstadoClinico();
  const fueraDeDupla =
    medicoActualId !== paciente.medicoPrincipalId && medicoActualId !== paciente.medicoSoporteId;

  const filas = [
    { etiqueta: "Médico principal", valor: nombreMedico(paciente.medicoPrincipalId) },
    { etiqueta: "Médico de soporte", valor: nombreMedico(paciente.medicoSoporteId) },
    { etiqueta: "Atendido la última vez por", valor: nombreMedico(paciente.atendidoUltimaVezPorId) },
  ];

  return (
    <section aria-labelledby="titulo-responsables" className="rounded-md border border-border bg-card p-4">
      <h2
        id="titulo-responsables"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Responsables
      </h2>

      <dl className="mt-2 grid gap-1">
        {filas.map((fila) => (
          <div key={fila.etiqueta} className="flex flex-wrap justify-between gap-2 border-b border-border py-1 last:border-b-0">
            <dt className="text-sm text-muted-foreground">{fila.etiqueta}</dt>
            <dd className="text-base font-semibold text-foreground">{fila.valor}</dd>
          </div>
        ))}
      </dl>

      {fueraDeDupla && (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-md border border-clinico-ambar bg-clinico-ambar-suave px-3 py-2 text-base font-semibold text-clinico-ambar-foreground"
        >
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          Estás atendiendo a un paciente que no es de tu dupla. Esta ficha resume su estado.
        </p>
      )}
    </section>
  );
}
