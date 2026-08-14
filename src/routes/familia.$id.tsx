import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { pacientes } from "@/data/pacientes";
import { VistaFamilia } from "@/components/ficha/VistaFamilia";

export const Route = createFileRoute("/familia/$id")({
  loader: ({ params }) => {
    const paciente = pacientes.find((item) => item.id === params.id);
    if (!paciente) throw notFound();
    return { nombre: paciente.nombre };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Paciente no encontrado · Ficha de Continuidad" }, { name: "robots", content: "noindex" }],
      };
    }
    const titulo = `Información para cuidadores · ${loaderData.nombre}`;
    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content: "Resumen sencillo para cuidadores: cita, fase del tratamiento, señales de alarma y contactos.",
        },
        { property: "og:title", content: titulo },
        {
          property: "og:description",
          content: "Resumen sencillo para cuidadores con datos sintéticos.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: PaginaFamilia,
});

function PaginaFamilia() {
  const { id } = Route.useParams();
  const paciente = pacientes.find((item) => item.id === id);

  if (!paciente) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Paciente no encontrado</h1>
        <Link to="/" className="mt-3 inline-flex items-center gap-2 text-lg text-primary underline">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Volver a la jornada de hoy
        </Link>
      </div>
    );
  }

  return (
    <section aria-labelledby="titulo-familia" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 id="titulo-familia" className="text-2xl font-bold text-foreground">
          Vista para cuidadores
        </h1>
        <Link
          to="/paciente/$id"
          params={{ id: paciente.id }}
          className="inline-flex items-center gap-2 text-base font-semibold text-primary underline"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Volver a ficha médica
        </Link>
      </div>

      <VistaFamilia paciente={paciente} />
    </section>
  );
}
