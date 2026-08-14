import { Lightbulb } from "lucide-react";

export function ProximoPaso({ texto }: { texto: string }) {
  return (
    <section
      aria-labelledby="titulo-proximo-paso"
      className="rounded-md border-2 border-primary bg-accent px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="size-5 shrink-0 text-primary" />
        <h2 id="titulo-proximo-paso" className="text-sm font-bold uppercase tracking-wide text-primary">
          Próximo paso sugerido
        </h2>
      </div>
      <p className="mt-2 text-base font-semibold leading-snug text-accent-foreground">{texto}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Sugerencia generada a partir del protocolo. La decisión clínica corresponde al médico tratante.
      </p>
    </section>
  );
}
