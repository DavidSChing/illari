import { useEstadoClinico, type Rol } from "@/state/EstadoClinico";

const OPCIONES: { valor: Rol; etiqueta: string }[] = [
  { valor: "medico", etiqueta: "Médico" },
  { valor: "enfermera", etiqueta: "Enfermería" },
];

export function SelectorRol() {
  const { rol, setRol } = useEstadoClinico();

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-secondary-foreground">
      Ingresando como
      <select
        value={rol}
        onChange={(evento) => setRol(evento.target.value as Rol)}
        className="min-h-8 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}
