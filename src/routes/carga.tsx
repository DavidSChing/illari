import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import { useEstadoClinico } from "@/state/EstadoClinico";
import {
  calcularSugerencias,
  conteoPorMedico,
  dispersionCarga,
} from "@/lib/reasignacion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/carga")({
  head: () => ({
    meta: [
      { title: "Carga médica · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Distribución de pacientes por médico principal en hematología pediátrica, con sugerencias de reasignación para equilibrar la carga.",
      },
      { property: "og:title", content: "Carga médica · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Desbalance de pacientes por médico principal y sugerencias de reasignación.",
      },
    ],
  }),
  component: CargaMedica,
});

function CargaMedica() {
  const { pacientes, reasignarPrincipal, medicos, nombreMedico, carga } = useEstadoClinico();
  const [dispersionInicial, setDispersionInicial] = useState<number | null>(null);
  const [aplicadas, setAplicadas] = useState(0);

  const conteo = useMemo(() => conteoPorMedico(pacientes, medicos), [pacientes, medicos]);
  const dispersion = dispersionCarga(conteo);
  const sugerencias = useMemo(() => calcularSugerencias(pacientes, medicos), [pacientes, medicos]);
  const maximo = Math.max(1, ...Object.values(conteo));

  const aplicar = () => {
    if (sugerencias.length === 0) return;
    if (dispersionInicial === null) setDispersionInicial(dispersion);
    setAplicadas((previas) => previas + sugerencias.length);
    reasignarPrincipal(
      sugerencias.map((sugerencia) => ({
        pacienteId: sugerencia.pacienteId,
        aMedicoId: sugerencia.aMedicoId,
      })),
    );
  };

  return (
    <section aria-labelledby="titulo-carga" className="flex flex-col gap-4 pb-6">
      <header>
        <h1 id="titulo-carga" className="text-2xl font-bold text-foreground">
          Carga médica
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Pacientes asignados como médico principal. El sistema muestra el desbalance; la
          reasignación la decide el equipo médico.
        </p>
        {carga && (
          <p className="mt-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
            Carga calculada a partir de quién figura como médico que atendió en{" "}
            <span className="font-bold">{carga.archivo}</span>. Solo lectura: el archivo no fue modificado.
          </p>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <IndicadorDispersion
          etiqueta="Dispersión actual"
          valor={dispersion}
          detalle="Diferencia entre el médico con más y con menos pacientes"
          destacado
        />
        <IndicadorDispersion
          etiqueta="Dispersión antes de aplicar"
          valor={dispersionInicial}
          detalle={dispersionInicial === null ? "Aún no se aplican sugerencias" : "Valor registrado al inicio"}
        />
        <IndicadorDispersion
          etiqueta="Reasignaciones aplicadas"
          valor={aplicadas}
          detalle="Cambios en memoria de esta sesión"
        />
      </div>

      <div className="bg-card p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Pacientes por médico principal
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {medicos.map((medico) => {
            const cantidad = conteo[medico.id] ?? 0;
            const porcentaje = Math.round((cantidad / maximo) * 100);
            return (
              <li key={medico.id} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-medium text-foreground">{medico.nombre}</span>
                  <span className="text-base font-semibold tabular-nums text-foreground">
                    {cantidad} {cantidad === 1 ? "paciente" : "pacientes"}
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${medico.nombre}: ${cantidad} pacientes asignados`}
                  className="h-6 w-full overflow-hidden rounded-sm bg-muted"
                >
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{ width: `${Math.max(porcentaje, cantidad > 0 ? 6 : 0)}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{medico.especialidad}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Sugerencias de reasignación</h2>
          <Button onClick={aplicar} disabled={sugerencias.length === 0} className="min-h-11">
            Aplicar sugerencia
          </Button>
        </div>

        {sugerencias.length === 0 ? (
          <p className="mt-3 rounded-md border-l-[3px] border-l-clinico-verde/40 bg-muted/40 px-3 py-2 text-base text-foreground">
            La carga está equilibrada: la diferencia entre médicos es de {dispersion}{" "}
            {dispersion === 1 ? "paciente" : "pacientes"}. No hay sugerencias pendientes.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {sugerencias.map((sugerencia) => (
              <li
                key={sugerencia.pacienteId}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-base text-foreground">
                  <span className="font-semibold">{sugerencia.pacienteNombre}</span>
                  <span className="text-muted-foreground">
                    {nombreMedico(sugerencia.deMedicoId)}
                  </span>
                  <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-medium">{nombreMedico(sugerencia.aMedicoId)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{sugerencia.motivo}</p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Sugerencia orientativa basada solo en el número de pacientes. El sistema muestra, el
            médico decide. Los cambios son en memoria y se pierden al recargar.
          </span>
        </p>
      </div>
    </section>
  );
}

function IndicadorDispersion({
  etiqueta,
  valor,
  detalle,
  destacado = false,
}: {
  etiqueta: string;
  valor: number | null;
  detalle: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-4 ${destacado ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
    >
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {etiqueta}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{valor ?? "—"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detalle}</p>
    </div>
  );
}
