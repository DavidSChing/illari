import { SelectorRol } from "@/components/layout/SelectorRol";

export function BannerPrototipo({ compacto = false }: { compacto?: boolean }) {
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
      <SelectorRol />
    </div>
  );
}
