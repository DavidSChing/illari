import { SelectorRol } from "@/components/layout/SelectorRol";
import { useEstadoClinico } from "@/state/EstadoClinico";

export function BannerPrototipo({ compacto = false }: { compacto?: boolean }) {
  const { cerrarSesion } = useEstadoClinico();

  if (compacto) {
    return (
      <div
        role="note"
        className="border-b border-border bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
      >
        Demo · Datos sintéticos
      </div>
    );
  }

  return (
    <div
      role="note"
      className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground sm:px-5"
    >
      <span className="sm:hidden">Demo · Datos sintéticos</span>
      <span className="hidden sm:inline">
        Prototipo demostrativo · Datos sintéticos · Sin información real de pacientes
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <SelectorRol />
        <button
          type="button"
          onClick={cerrarSesion}
          className="min-h-8 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
