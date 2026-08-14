import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, Users } from "lucide-react";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { obtenerSeguimiento } from "@/data/seguimientos";
import { evaluarEsquema, diferenciaDias, HOY } from "@/lib/esquema";
import { formatearFecha } from "@/lib/formato";

export const Route = createFileRoute("/retrasos")({
  head: () => ({
    meta: [
      { title: "Pacientes retrasados · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Vista de jefatura: pacientes cuyo próximo ciclo está retrasado respecto al calendario de su esquema de demostración.",
      },
      { property: "og:title", content: "Pacientes retrasados · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Retrasos del calendario de tratamiento con datos sintéticos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VistaRetrasos,
});

const DIAS_SIN_ATENCION = 30;

function VistaRetrasos() {
  const { pacientes, nombreMedico } = useEstadoClinico();

  const filas = pacientes
    .map((paciente) => {
      const seguimiento = obtenerSeguimiento(paciente.id);
      if (!seguimiento) return null;
      const evaluacion = evaluarEsquema(seguimiento);
      return { paciente, evaluacion };
    })
    .filter((fila): fila is NonNullable<typeof fila> => fila !== null);

  const retrasados = filas
    .filter((fila) => fila.evaluacion.retrasoActual > 0)
    .sort((a, b) => b.evaluacion.retrasoActual - a.evaluacion.retrasoActual);

  const promedio =
    retrasados.length === 0
      ? 0
      : Math.round(
          retrasados.reduce((total, fila) => total + fila.evaluacion.retrasoActual, 0) /
            retrasados.length,
        );

  const sinAtencion = filas.filter(
    (fila) => diferenciaDias(fila.paciente.fechaUltimaAtencion, HOY) > DIAS_SIN_ATENCION,
  ).length;

  const indicadores = [
    { etiqueta: "Pacientes con retraso", valor: `${retrasados.length}`, Icono: AlertTriangle },
    { etiqueta: "Retraso promedio", valor: `${promedio} días`, Icono: CalendarClock },
    {
      etiqueta: `Sin atención hace más de ${DIAS_SIN_ATENCION} días`,
      valor: `${sinAtencion}`,
      Icono: Users,
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Pacientes retrasados respecto al esquema</h1>
        <p className="text-base text-muted-foreground">
          Vista para la jefatura del servicio. Compara la fecha prevista según el intervalo del esquema
          de demostración con la fecha realmente registrada.
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          El sistema muestra el calendario. La decisión clínica corresponde al médico tratante.
        </p>
      </header>

      <ul className="grid gap-2 md:grid-cols-3">
        {indicadores.map(({ etiqueta, valor, Icono }) => (
          <li key={etiqueta} className="rounded-md border border-border bg-card px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Icono aria-hidden="true" className="size-5" />
              {etiqueta}
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">{valor}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="titulo-tabla-retrasos" className="rounded-md border border-border bg-card">
        <h2 id="titulo-tabla-retrasos" className="sr-only">
          Lista de pacientes con retraso
        </h2>
        {retrasados.length === 0 ? (
          <p className="px-4 py-6 text-base text-muted-foreground">
            Ningún paciente figura retrasado respecto al calendario de su esquema.
          </p>
        ) : (
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Pacientes ordenados por días de retraso, de mayor a menor
            </caption>
            <thead>
              <tr className="border-b border-border text-sm uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-semibold">Paciente</th>
                <th scope="col" className="px-3 py-2 font-semibold">Fase y ciclo</th>
                <th scope="col" className="px-3 py-2 font-semibold">Días de retraso</th>
                <th scope="col" className="px-3 py-2 font-semibold">Procedencia</th>
                <th scope="col" className="px-3 py-2 font-semibold">Médico principal</th>
                <th scope="col" className="px-3 py-2 font-semibold">Última atención</th>
              </tr>
            </thead>
            <tbody>
              {retrasados.map(({ paciente, evaluacion }) => (
                <tr key={paciente.id} className="border-b border-border/60">
                  <th scope="row" className="px-3 py-2 text-left">
                    <Link
                      to="/paciente/$id"
                      params={{ id: paciente.id }}
                      className="text-lg font-bold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {paciente.nombre}
                    </Link>
                  </th>
                  <td className="px-3 py-2 text-base text-foreground">
                    {evaluacion.proximo?.fase ?? "No registrada"} · Ciclo {evaluacion.proximo?.numero}
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded-md border border-clinico-rojo bg-clinico-rojo-suave px-2 py-1 text-base font-bold text-clinico-rojo-foreground">
                      {evaluacion.retrasoActual} días
                    </span>
                  </td>
                  <td className="px-3 py-2 text-base text-foreground">
                    {paciente.procedencia
                      ? `${paciente.procedencia.ciudad}, ${paciente.procedencia.region}`
                      : "No registrada"}
                  </td>
                  <td className="px-3 py-2 text-base text-foreground">
                    {nombreMedico(paciente.medicoPrincipalId)}
                  </td>
                  <td className="px-3 py-2 text-base text-foreground">
                    {formatearFecha(paciente.fechaUltimaAtencion)}
                    <span className="block text-sm text-muted-foreground">
                      hace {diferenciaDias(paciente.fechaUltimaAtencion, HOY)} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
