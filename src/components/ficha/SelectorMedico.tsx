import { medicos } from "@/data/medicos";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { Label } from "@/components/ui/label";

export function SelectorMedico() {
  const { medicoActualId, setMedicoActualId } = useEstadoClinico();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="selector-medico" className="text-sm font-medium text-muted-foreground">
        Estás ingresando como:
      </Label>
      <select
        id="selector-medico"
        value={medicoActualId}
        onChange={(evento) => setMedicoActualId(evento.target.value)}
        className="min-h-11 rounded-md border border-input bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {medicos.map((medico) => (
          <option key={medico.id} value={medico.id}>
            {medico.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
