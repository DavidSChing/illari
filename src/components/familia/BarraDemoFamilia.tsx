import { useNavigate } from "@tanstack/react-router";
import { useEstadoClinico } from "@/state/EstadoClinico";

/** Franja delgada de demostración: no debe robar espacio a la próxima cita. */
export function BarraDemoFamilia({ pacienteId }: { pacienteId: string }) {
  const { pacientes } = useEstadoClinico();
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="titulo-controles-demo"
      className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted px-2 py-1"
    >
      <h2
        id="titulo-controles-demo"
        className="shrink-0 text-[0.9375rem] font-bold uppercase tracking-wide text-foreground"
      >
        Demo
      </h2>
      <label htmlFor="selector-paciente-familia" className="sr-only">
        Ver la pantalla de otro paciente
      </label>
      <select
        id="selector-paciente-familia"
        value={pacienteId}
        onChange={(evento) => navigate({ to: "/familia/$id", params: { id: evento.target.value } })}
        className="min-h-12 w-full min-w-0 rounded-md border border-input bg-card px-2 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {pacientes.map((paciente) => (
          <option key={paciente.id} value={paciente.id}>
            {paciente.nombre}
          </option>
        ))}
      </select>
    </section>
  );
}
