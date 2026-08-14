import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/modo-demo")({
  head: () => ({
    meta: [
      { title: "Modo demo · Ficha de Continuidad" },
      {
        name: "description",
        content: "Recorrido guiado del prototipo de ruta asistencial en hematología pediátrica.",
      },
      { property: "og:title", content: "Modo demo · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Recorrido guiado del prototipo con datos sintéticos.",
      },
    ],
  }),
  component: ModoDemo,
});

function ModoDemo() {
  return (
    <section aria-labelledby="titulo-demo">
      <h1 id="titulo-demo" className="text-2xl font-bold text-foreground">
        Modo demo
      </h1>
      <p className="mt-2 text-base text-muted-foreground">Sección en construcción.</p>
    </section>
  );
}
