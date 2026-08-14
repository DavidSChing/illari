import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ZonaSoltar({
  onArchivo,
  ocupado,
}: {
  onArchivo: (archivo: File) => void;
  ocupado: boolean;
}) {
  const [encima, setEncima] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const tomar = (lista: FileList | null) => {
    const archivo = lista?.[0];
    if (archivo) onArchivo(archivo);
  };

  return (
    <div
      onDragOver={(evento) => {
        evento.preventDefault();
        setEncima(true);
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(evento) => {
        evento.preventDefault();
        setEncima(false);
        tomar(evento.dataTransfer.files);
      }}
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center",
        encima ? "border-primary bg-accent" : "border-border bg-card",
      ].join(" ")}
    >
      <FileSpreadsheet aria-hidden="true" className="size-10 text-primary" />
      <p className="text-xl font-bold text-foreground">
        Arrastre aquí el archivo .xlsx de registro de citas
      </p>
      <p className="max-w-xl text-base text-muted-foreground">
        El archivo se lee dentro de este navegador. No se envía a ningún servidor, no se modifica y no
        se sobrescribe.
      </p>

      <input
        ref={entrada}
        id="entrada-archivo-excel"
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={(evento) => tomar(evento.target.files)}
      />
      <Button
        type="button"
        className="min-h-12 text-base"
        disabled={ocupado}
        onClick={() => entrada.current?.click()}
      >
        <Upload aria-hidden="true" className="size-5" />
        {ocupado ? "Leyendo archivo..." : "Seleccionar archivo del equipo"}
      </Button>
    </div>
  );
}
