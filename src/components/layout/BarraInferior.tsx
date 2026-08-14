import { Link } from "@tanstack/react-router";
import { CalendarDays, Users, Timer, FileSpreadsheet, CalendarClock } from "lucide-react";

const secciones = [
  { to: "/", etiqueta: "Jornada", Icono: CalendarDays },
  { to: "/retrasos", etiqueta: "Retrasos", Icono: CalendarClock },
  { to: "/carga", etiqueta: "Carga", Icono: Users },
  { to: "/cargar", etiqueta: "Excel", Icono: FileSpreadsheet },
  { to: "/demo", etiqueta: "Demo", Icono: Timer },
] as const;

/** Navegación principal en móvil: barra inferior fija con icono y etiqueta. */
export function BarraInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="pb-segura fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden"
    >
      <ul className="flex items-stretch">
        {secciones.map(({ to, etiqueta, Icono }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "bg-sidebar-accent font-bold",
                "aria-current": "page",
              }}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-center text-[0.8125rem] font-semibold leading-tight text-sidebar-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sidebar-ring"
            >
              <Icono aria-hidden="true" className="size-6 shrink-0" />
              <span className="truncate">{etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
