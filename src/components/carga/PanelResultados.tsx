import { Link } from "@tanstack/react-router";
import { AlertTriangle, FileWarning, Lock } from "lucide-react";
import type { ResultadoCarga } from "@/lib/excel/consolidar";
import { formatearFecha } from "@/lib/formato";

function Indicador({ etiqueta, valor, detalle }: { etiqueta: string; valor: number; detalle: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{valor}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>
    </div>
  );
}

export function AvisoSoloLectura() {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-md border-2 border-primary bg-accent px-3 py-2 text-base font-bold text-accent-foreground"
    >
      <Lock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      Solo lectura. Este archivo no fue modificado. El Excel sigue siendo la fuente de verdad y la
      plataforma no decide nada clínico.
    </p>
  );
}

export function PanelResultados({ resultado }: { resultado: ResultadoCarga }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          etiqueta="Filas leídas"
          valor={resultado.filasLeidas}
          detalle={`Del archivo ${resultado.archivo}`}
        />
        <Indicador
          etiqueta="Pacientes detectados"
          valor={resultado.pacientes.length}
          detalle="Agrupados por historia clínica"
        />
        <Indicador
          etiqueta="Atenciones incorporadas"
          valor={resultado.atenciones.length}
          detalle="Clave: historia clínica + fecha"
        />
        <Indicador
          etiqueta="Filas con problemas"
          valor={resultado.problemas.length}
          detalle="Fechas ambiguas, campos vacíos o pacientes no reconocidos"
        />
      </div>

      {resultado.problemas.length > 0 && (
        <section aria-labelledby="titulo-problemas" className="rounded-lg border border-border bg-card p-4">
          <h2 id="titulo-problemas" className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileWarning aria-hidden="true" className="size-5 text-clinico-ambar" />
            Filas con problemas
          </h2>
          <ul className="mt-2 grid gap-1">
            {resultado.problemas.map((problema, indice) => (
              <li
                key={`${problema.fila}-${indice}`}
                className="rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
              >
                <span className="font-bold">Fila {problema.fila}</span> ·{" "}
                <span className="font-semibold">{problema.motivo}</span>: {problema.detalle}
              </li>
            ))}
          </ul>
        </section>
      )}

      {resultado.discrepancias.length > 0 && (
        <section
          aria-labelledby="titulo-discrepancias"
          className="rounded-lg border-2 border-clinico-rojo bg-card p-4"
        >
          <h2
            id="titulo-discrepancias"
            className="flex items-center gap-2 text-lg font-bold text-clinico-rojo-foreground"
          >
            <AlertTriangle aria-hidden="true" className="size-5" />
            Discrepancias: requiere revisión del equipo médico
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            La misma historia clínica y fecha aparece con datos distintos. La plataforma no elige
            ninguna versión: las muestra lado a lado.
          </p>
          <ul className="mt-3 grid gap-3">
            {resultado.discrepancias.map((discrepancia) => (
              <li key={discrepancia.clave} className="rounded-md border border-border bg-background p-3">
                <p className="text-base font-bold text-foreground">
                  {discrepancia.nombre} · HC {discrepancia.hc} · {formatearFecha(discrepancia.fecha)}
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {discrepancia.versiones.map((version) => (
                    <div
                      key={version.fila}
                      className="rounded-md border border-clinico-rojo bg-clinico-rojo-suave px-3 py-2 text-sm text-clinico-rojo-foreground"
                    >
                      <p className="font-bold">Versión de la fila {version.fila}</p>
                      <p>Paciente: {version.nombreOriginal || "(vacío)"}</p>
                      <p>Médico: {version.medicoOriginal || "(vacío)"}</p>
                      <p>Fecha en el archivo: {version.fechaOriginal || "(vacío)"}</p>
                      <p>Próxima cita: {version.proximaCitaOriginal || "(vacío)"}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="titulo-vacios" className="rounded-lg border border-border bg-card p-4">
        <h2 id="titulo-vacios" className="text-lg font-semibold text-foreground">
          Requiere atención del equipo
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Cada punto es informativo. La plataforma señala; la acción y la decisión son de una persona.
        </p>
        {resultado.vacios.length === 0 ? (
          <p className="mt-3 rounded-md border border-clinico-verde bg-clinico-verde-suave px-3 py-2 text-base text-clinico-verde-foreground">
            No se detectaron vacíos en el archivo cargado.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {resultado.vacios.map((vacio, indice) => (
              <li
                key={`${vacio.tipo}-${indice}`}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <p className="text-base font-semibold text-foreground">{vacio.titulo}</p>
                <p className="text-sm text-muted-foreground">{vacio.detalle}</p>
                {vacio.pacienteId && (
                  <Link
                    to="/paciente/$id"
                    params={{ id: vacio.pacienteId }}
                    className="mt-1 inline-block text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Abrir su Ficha de Continuidad
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-consolidado" className="rounded-lg border border-border bg-card p-4">
        <h2 id="titulo-consolidado" className="text-lg font-semibold text-foreground">
          Pacientes consolidados
        </h2>
        <div className="mt-2 overflow-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Pacientes consolidados a partir del Excel</caption>
            <thead className="bg-muted">
              <tr>
                {[
                  "Paciente",
                  "HC",
                  "Atenciones",
                  "Última atención",
                  "Días desde entonces",
                  "Próxima cita",
                  "Médicos que lo atendieron",
                ].map((titulo) => (
                  <th
                    key={titulo}
                    scope="col"
                    className="px-2 py-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resultado.pacientes.map((paciente) => (
                <tr key={paciente.hc}>
                  <td className="px-2 py-1 text-base">
                    <Link
                      to="/paciente/$id"
                      params={{ id: `hc-${paciente.hc.replace(/\s+/g, "")}` }}
                      className="font-semibold text-primary hover:underline"
                      title={`Origen: ${resultado.archivo}, fila ${paciente.filaOrigen}, cargado el ${formatearFecha(resultado.fechaCarga)}`}
                    >
                      {paciente.nombre}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      En el archivo: “{paciente.nombreOriginal}”
                    </span>
                  </td>
                  <td className="px-2 py-1 text-base text-foreground">{paciente.hc}</td>
                  <td className="px-2 py-1 text-base tabular-nums text-foreground">
                    {paciente.cicloActual}
                  </td>
                  <td className="px-2 py-1 text-base text-foreground">
                    {formatearFecha(paciente.ultimaAtencion)}
                  </td>
                  <td className="px-2 py-1 text-base tabular-nums text-foreground">
                    {paciente.diasDesdeUltimaAtencion}
                  </td>
                  <td className="px-2 py-1 text-base text-foreground">
                    {paciente.proximaCita ? formatearFecha(paciente.proximaCita) : "No anotada"}
                  </td>
                  <td className="px-2 py-1 text-base text-foreground">
                    {paciente.medicos.join(", ") || "No registrado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
