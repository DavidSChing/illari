import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEstadoClinico } from "@/state/EstadoClinico";
import type { ResultadoProgramacion } from "@/lib/programacion";

/** Pacientes que el equipo dejó fuera de la propuesta, con su motivo. */
export function FueraDeProgramacion({
  excluidos,
}: {
  excluidos: ResultadoProgramacion["excluidos"];
}) {
  const { cambiarMotivoExclusion, reincluirPaciente } = useEstadoClinico();

  if (excluidos.length === 0) return null;

  return (
    <section
      aria-labelledby="titulo-fuera"
      className="bg-card"
    >
      <h2
        id="titulo-fuera"
        className="border-b border-border px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground md:px-4"
      >
        Fuera de la programación
      </h2>

      <ul className="divide-y divide-border">
          {excluidos.map(({ paciente, motivo }) => (
            <li key={paciente.id} className="grid gap-2 px-3 py-3 md:px-4">
              <p className="text-base font-semibold text-foreground">{paciente.nombre}</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <Label htmlFor={`motivo-fuera-${paciente.id}`} className="text-sm">
                    Motivo
                  </Label>
                  <Input
                    id={`motivo-fuera-${paciente.id}`}
                    value={motivo}
                    onChange={(evento) => cambiarMotivoExclusion(paciente.id, evento.target.value)}
                    className="min-h-12 text-base"
                    placeholder="Escriba el motivo"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-12 text-base"
                  onClick={() => reincluirPaciente(paciente.id)}
                >
                  Devolver a la programación
                </Button>
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
