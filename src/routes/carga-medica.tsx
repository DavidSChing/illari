import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/carga-medica")({
  head: () => ({
    meta: [
      { title: "Carga médica · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Distribución de pacientes por médico principal y de soporte en hematología pediátrica del INSN San Borja.",
      },
      { property: "og:title", content: "Carga médica · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Distribución de pacientes por médico principal y de soporte.",
      },
    ],
  }),
  component: CargaMedica,
});

function CargaMedica() {
  return (
    <section aria-labelledby="titulo-carga">
      <h1 id="titulo-carga" className="text-2xl font-bold text-foreground">
        Carga médica
      </h1>
      <p className="mt-2 text-base text-muted-foreground">Sección en construcción.</p>
    </section>
  );
}
