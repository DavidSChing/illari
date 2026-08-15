import { Lightbulb } from "lucide-react";

export function ProximoPaso({ texto }: { texto: string }) {
  return (
    <section
      aria-labelledby="titulo-proximo-paso"
      className="rounded-md border border-border border-l-[3px] border-l-primary bg-card px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 id="titulo-proximo-paso" className="micro-etiqueta">
          Próximo paso sugerido
        </h2>
      </div>
      <p className="mt-2 dato-destacado leading-snug text-foreground">{texto}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Sugerencia generada a partir del protocolo. La decisión clínica corresponde al médico tratante.
      </p>
    </section>
  );
}
