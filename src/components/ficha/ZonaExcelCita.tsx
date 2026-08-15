import { useRef, useState } from "react";

/** Zona compacta de carga: lectura local del Excel del paciente. No sube nada a ningún servidor. */
export function ZonaExcelCita({ onArchivo }: { onArchivo: (archivo: File) => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [sobre, setSobre] = useState(false);

  return (
    <div
      onDragOver={(evento) => {
        evento.preventDefault();
        setSobre(true);
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={(evento) => {
        evento.preventDefault();
        setSobre(false);
        const archivo = evento.dataTransfer.files?.[0];
        if (archivo) onArchivo(archivo);
      }}
      className={`flex max-h-[72px] items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2 ${
        sobre ? "border-primary bg-muted/60" : "border-border"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          ¿Ya tiene el Excel de esta cita? Suéltelo aquí y completamos el formulario.
        </p>
        <p className="text-xs text-muted-foreground">Solo lectura. Su archivo no se modifica.</p>
      </div>
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        className="h-9 shrink-0 rounded-md border border-border px-3 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Elegir archivo
      </button>
      <input
        ref={entrada}
        type="file"
        accept=".xlsx,.xls"
        className="sr-only"
        aria-label="Elegir el Excel de esta cita"
        onChange={(evento) => {
          const archivo = evento.target.files?.[0];
          if (archivo) onArchivo(archivo);
          evento.target.value = "";
        }}
      />
    </div>
  );
}
