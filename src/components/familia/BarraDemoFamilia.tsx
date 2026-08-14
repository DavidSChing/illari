import { useNavigate } from "@tanstack/react-router";
import { useEstadoClinico } from "@/state/EstadoClinico";

/** Controles que existen solo para la demostración ante el jurado. */
export function BarraDemoFamilia({ pacienteId }: { pacienteId: string }) {
  const { pacientes } = useEstadoClinico();
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="titulo-controles-demo"
      className="rounded-lg border-2 border-dashed border-border bg-muted p-4"
    >
      <h2
        id="titulo-controles-demo"
        className="text-sm font-bold uppercase tracking-wide text-muted-foreground"
      >
        Controles de demostración
      </h2>

      <label htmlFor="selector-paciente-familia" className="mt-2 block text-base font-semibold text-foreground">
        Ver la pantalla de otro paciente
      </label>
      <select
        id="selector-paciente-familia"
        value={pacienteId}
        onChange={(evento) => navigate({ to: "/familia/$id", params: { id: evento.target.value } })}
        className="mt-1 min-h-12 w-full rounded-md border border-input bg-card px-3 text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {pacientes.map((paciente) => (
          <option key={paciente.id} value={paciente.id}>
            {paciente.nombre}
          </option>
        ))}
      </select>

      <p className="mt-2 text-sm text-muted-foreground">
        En producción, el familiar accede por un enlace único enviado por SMS. Este selector existe
        solo para esta demostración.
      </p>
    </section>
  );
}
