import { Link } from "@tanstack/react-router";
import { CalendarDays, Users, PlayCircle, Timer, FileSpreadsheet, CalendarClock } from "lucide-react";

const secciones = [
  { to: "/", etiqueta: "Jornada de hoy", Icono: CalendarDays },
  { to: "/cargar", etiqueta: "Cargar Excel", Icono: FileSpreadsheet },
  { to: "/retrasos", etiqueta: "Pacientes retrasados", Icono: CalendarClock },
  { to: "/carga", etiqueta: "Carga médica", Icono: Users },
  { to: "/modo-demo", etiqueta: "Modo demo", Icono: PlayCircle },
  { to: "/demo", etiqueta: "Demostración de tiempos", Icono: Timer },
] as const;

export function BarraLateral() {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex w-full shrink-0 flex-col bg-sidebar text-sidebar-foreground md:w-72"
    >
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/80">
          INSN San Borja
        </p>
        <h1 className="mt-1 text-xl font-bold leading-tight">Ficha de Continuidad</h1>
        <p className="mt-1 text-sm text-sidebar-foreground/80">Hematología pediátrica</p>
      </div>

      <ul className="flex flex-1 flex-col gap-1 p-3">
        {secciones.map(({ to, etiqueta, Icono }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "bg-sidebar-accent font-semibold",
                "aria-current": "page",
              }}
              className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-base text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring"
            >
              <Icono aria-hidden="true" className="size-5 shrink-0" />
              <span>{etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="border-t border-sidebar-border px-5 py-4 text-sm text-sidebar-foreground/80">
        El sistema muestra, el médico decide.
      </p>
    </nav>
  );
}
