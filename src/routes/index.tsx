import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jornada de hoy · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Jornada de clínica de día en hematología pediátrica: dónde está cada paciente y cuál es el siguiente paso.",
      },
      { property: "og:title", content: "Jornada de hoy · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Prototipo demostrativo de ruta asistencial con datos sintéticos.",
      },
    ],
  }),
  component: JornadaDeHoy,
});

function JornadaDeHoy() {
  return (
    <section aria-labelledby="titulo-jornada">
      <h1 id="titulo-jornada" className="text-2xl font-bold text-foreground">
        Jornada de hoy
      </h1>
      <p className="mt-2 text-base text-muted-foreground">Sección en construcción.</p>
    </section>
  );
}
