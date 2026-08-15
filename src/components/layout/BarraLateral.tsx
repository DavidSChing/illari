import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Users,
  PlayCircle,
  Timer,
  FileSpreadsheet,
  CalendarClock,
  ListOrdered,
} from "lucide-react";

const secciones = [
  { to: "/", etiqueta: "Jornada de hoy", Icono: CalendarDays },
  { to: "/programacion", etiqueta: "Programación sugerida", Icono: ListOrdered },
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
      className="hidden w-full shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex md:w-64"
    >
      <div className="border-b border-sidebar-border px-5 py-6">
        <p className="micro-etiqueta text-sidebar-foreground/70">INSN San Borja</p>
        <h1 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.02em] text-sidebar-primary">
          Ficha de Continuidad
        </h1>
        <p className="mt-1 text-xs text-sidebar-foreground/70">Hematología pediátrica</p>
      </div>

      <ul className="flex flex-1 flex-col py-3">
        {secciones.map(({ to, etiqueta, Icono }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "border-l-primary text-sidebar-primary font-medium",
                "aria-current": "page",
              }}
              inactiveProps={{ className: "border-l-transparent" }}
              className="flex min-h-11 items-center gap-3 border-l-2 px-5 py-2 text-[0.8125rem] text-sidebar-foreground transition-colors duration-150 hover:text-sidebar-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring"
            >
              <Icono aria-hidden="true" className="size-4 shrink-0" />
              <span>{etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/70">
        El sistema muestra, el médico decide.
      </p>
    </nav>
  );
}
