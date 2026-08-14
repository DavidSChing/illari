import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Syringe } from "lucide-react";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { pacientes } from "@/data/pacientes";
import { formatearFecha } from "@/lib/formato";
import { SelectorMedico } from "@/components/ficha/SelectorMedico";
import { BarraFases } from "@/components/ficha/BarraFases";
import { PanelAlertas } from "@/components/ficha/PanelAlertas";
import { TarjetasLaboratorio } from "@/components/ficha/TarjetasLaboratorio";
import { BloqueResponsables } from "@/components/ficha/BloqueResponsables";
import { ProximoPaso } from "@/components/ficha/ProximoPaso";
import { DialogoRegistrarAtencion } from "@/components/ficha/DialogoRegistrarAtencion";

export const Route = createFileRoute("/paciente/$id")({
  loader: ({ params }) => {
    const paciente = pacientes.find((item) => item.id === params.id);
    if (!paciente) throw notFound();
    return { nombre: paciente.nombre, diagnostico: paciente.diagnostico };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Paciente no encontrado · Ficha de Continuidad" }, { name: "robots", content: "noindex" }],
      };
    }
    const titulo = `${loaderData.nombre} · Ficha de Continuidad`;
    return {
      meta: [
        { title: titulo },
        {
          name: "description",
          content: `Ficha de continuidad sintética: fase, ciclo, alertas y próximo paso sugerido (${loaderData.diagnostico}).`,
        },
        { property: "og:title", content: titulo },
        { property: "og:description", content: "Ficha de continuidad con datos sintéticos." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: FichaContinuidad,
});

function FichaContinuidad() {
  const { id } = Route.useParams();
  const { obtenerPaciente, atencionesDePaciente } = useEstadoClinico();
  const paciente = obtenerPaciente(id);

  if (!paciente) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Paciente no encontrado</h1>
        <Link to="/" className="mt-2 inline-block text-primary underline">
          Volver a la jornada de hoy
        </Link>
      </div>
    );
  }

  const registros = atencionesDePaciente(paciente.id);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-2">
      <header className="grid grid-cols-1 items-start gap-2 rounded-md border border-border bg-card px-4 py-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-foreground">{paciente.nombre}</h1>
          <p className="text-lg text-foreground">
            {paciente.edad} años · {paciente.sexo} ·{" "}
            <span className="font-semibold">{paciente.diagnostico}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {paciente.protocolo} · Última atención {formatearFecha(paciente.fechaUltimaAtencion)} · Próxima
            cita {formatearFecha(paciente.fechaProximaCita)}
            {paciente.inasistenciasPrevias > 0
              ? ` · ${paciente.inasistenciasPrevias} inasistencia(s) previa(s)`
              : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1 md:items-end">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:justify-end">
            <SelectorMedico />
            {paciente.procedencia.fueraDeLima ? (
              <p className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-3 py-1.5 text-base font-bold text-primary-foreground">
                <MapPin aria-hidden="true" className="size-5" />
                Viaja {paciente.horasDeViaje} h desde {paciente.procedencia.region}
              </p>
            ) : (
              <p className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-base font-semibold text-secondary-foreground">
                <MapPin aria-hidden="true" className="size-5" />
                Reside en {paciente.procedencia.ciudad}
              </p>
            )}
          </div>
          <Link
            to="/familia/$id"
            params={{ id: paciente.id }}
            className="inline-flex items-center rounded-md py-1 text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ver versión para cuidadores
          </Link>
        </div>

      </header>


      <BarraFases
        fase={paciente.fase}
        cicloActual={paciente.cicloActual}
        ciclosTotales={paciente.ciclosTotales}
      />

      <div className="grid gap-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <PanelAlertas alertas={paciente.alertas} />
          <TarjetasLaboratorio laboratorio={paciente.laboratorio} />
          <section
            aria-labelledby="titulo-administracion"
            className="rounded-md border border-border bg-card p-4"
          >
            <h2
              id="titulo-administracion"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Última administración
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold text-foreground">
              <Syringe aria-hidden="true" className="size-5 text-primary" />
              {paciente.ultimaAdministracion.medicamento}
              <span className="font-medium">{paciente.ultimaAdministracion.dosis}</span>
              <span className="text-base font-medium text-muted-foreground">
                {formatearFecha(paciente.ultimaAdministracion.fecha)}
              </span>
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-2">
          <BloqueResponsables paciente={paciente} />
          <ProximoPaso texto={paciente.proximoPasoSugerido} />
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-4 py-3">
            <DialogoRegistrarAtencion paciente={paciente} />
            {registros.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Atenciones registradas en esta sesión
                </h2>
                <ul className="mt-1 grid gap-1">
                  {registros.map((registro) => (
                    <li key={registro.id} className="text-sm text-foreground">
                      <span className="font-semibold">{formatearFecha(registro.fecha)}:</span>{" "}
                      {registro.queSeHizo}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
