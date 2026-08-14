import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { pacientes } from "@/data/pacientes";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { VistaFamilia } from "@/components/familia/VistaFamilia";

export const Route = createFileRoute("/familia/$id")({
  loader: ({ params }) => {
    const paciente = pacientes.find((item) => item.id === params.id);
    if (!paciente) throw notFound();
    return { nombre: paciente.nombre };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Paciente no encontrado · Ficha de Continuidad" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const titulo = `Información para la familia · ${loaderData.nombre}`;
    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content:
            "Pantalla para el responsable legal: próxima cita, confirmación de asistencia, señales de alarma y calendario del tratamiento.",
        },
        { property: "og:title", content: titulo },
        {
          property: "og:description",
          content: "Pantalla sencilla para la familia, con datos sintéticos.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: PaginaFamilia,
});

function PaginaFamilia() {
  const { id } = Route.useParams();
  const { obtenerPaciente } = useEstadoClinico();
  const paciente = obtenerPaciente(id);

  if (!paciente) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">Paciente no encontrado</h1>
        <Link to="/" className="mt-3 inline-flex items-center gap-2 text-lg text-primary underline">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Volver a la jornada de hoy
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="mx-auto w-full max-w-[480px]">
        <Link
          to="/paciente/$id"
          params={{ id: paciente.id }}
          className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Volver a la ficha médica
        </Link>
      </div>

      <VistaFamilia paciente={paciente} />
    </div>
  );
}
