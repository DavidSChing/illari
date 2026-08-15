import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, CalendarCheck, CalendarX, Thermometer } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useEstadoClinico } from "@/state/EstadoClinico";

import type { Cita, Paciente, NivelSemaforo } from "@/data/tipos";


const SEVERIDAD_ALERTA: Record<string, NivelSemaforo> = {
  Neutropenia: "rojo",
  "Fiebre reportada por la familia": "rojo",
  "Faltó a control previo": "ambar",
  "Riesgo social alto": "ambar",
};

const CLASES_ALERTA: Record<NivelSemaforo, string> = {
  rojo: "text-clinico-rojo",
  ambar: "text-clinico-ambar",
  verde: "text-clinico-verde",
};

function IconosAlerta({ alertas }: { alertas: string[] }) {
  if (alertas.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-clinico-verde">
        <CheckCircle2 aria-hidden="true" className="size-5" />
        Sin alertas
      </span>
    );
  }

  return (
    <ul className="flex flex-wrap items-center gap-1" aria-label={`${alertas.length} alerta(s) activa(s)`}>
      {alertas.map((alerta) => {
        const nivel = SEVERIDAD_ALERTA[alerta] ?? "ambar";
        const Icono = nivel === "rojo" ? AlertTriangle : AlertCircle;
        return (
          <li key={alerta} title={alerta}>
            <span
              className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-foreground"
            >
              <Icono
                aria-hidden="true"
                className={`size-4 shrink-0 ${nivel === "rojo" ? "text-clinico-rojo" : "text-clinico-ambar"}`}
              />
              {alerta}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function EstadoFamilia({ pacienteId }: { pacienteId: string }) {
  const { respuestaFamilia } = useEstadoClinico();
  const respuesta = respuestaFamilia(pacienteId);

  if (respuesta.asistencia === "sin_responder" && !respuesta.fiebreReportada) {
    return <span className="text-sm text-muted-foreground">Sin respuesta de la familia</span>;
  }

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {respuesta.asistencia === "confirmado" && (
        <li>
          <span className="inline-flex items-center gap-1 rounded-md px-0 py-0.5 text-[0.8125rem] font-medium text-foreground">
            <CalendarCheck aria-hidden="true" className="size-4" />
            Confirmado
          </span>
        </li>
      )}
      {respuesta.asistencia === "no_asistira" && (
        <>
          <li>
            <span
              className="inline-flex items-center gap-1 rounded-md px-0 py-0.5 text-[0.8125rem] font-medium text-foreground"
              title={respuesta.motivo ? `Motivo: ${respuesta.motivo}` : undefined}
            >
              <CalendarX aria-hidden="true" className="size-4" />
              No asistirá
            </span>
          </li>
          <li>
            <span className="inline-flex items-center gap-1 rounded-md px-0 py-0.5 text-[0.8125rem] font-medium text-foreground">
              Cupo liberado
            </span>
          </li>
        </>
      )}
      {respuesta.fiebreReportada && (
        <li>
          <span className="inline-flex items-center gap-1 rounded-md px-0 py-0.5 text-[0.8125rem] font-medium text-foreground">
            <Thermometer aria-hidden="true" className="size-4" />
            Fiebre reportada
          </span>
        </li>
      )}
    </ul>
  );
}

function TarjetaPaciente({ cita, paciente }: { cita: Cita; paciente: Paciente }) {
  const { medicoActualId, nombreMedico } = useEstadoClinico();
  const fueraDeDupla =
    medicoActualId !== paciente.medicoPrincipalId && medicoActualId !== paciente.medicoSoporteId;

  return (
    <Link
      to="/paciente/$id"
      params={{ id: paciente.id }}
      className={[
        "flex min-h-24 w-full min-w-0 flex-col gap-1 rounded-md border px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        fueraDeDupla ? "border-clinico-ambar bg-muted/40" : "border-border bg-card",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="truncate text-lg font-bold text-primary underline">{paciente.nombre}</span>
        <span className="shrink-0 text-lg font-bold tabular-nums text-foreground">{cita.hora}</span>
      </div>
      <p className="text-base text-foreground">
        <span className="font-semibold">{paciente.fase ?? "Fase no registrada"}</span> · Ciclo{" "}
        {paciente.cicloActual}
        {paciente.ciclosTotales ? ` de ${paciente.ciclosTotales}` : ""}
      </p>
      <p className="text-base text-foreground">{nombreMedico(paciente.medicoPrincipalId)}</p>
      {fueraDeDupla && (
        <p className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
          <ShieldAlert aria-hidden="true" className="size-4 shrink-0" />
          No es de tu dupla
        </p>
      )}
      <IconosAlerta alertas={paciente.alertas} />
    </Link>
  );
}

function FilaPaciente({ cita, paciente }: { cita: Cita; paciente: Paciente }) {
  const { medicoActualId, nombreMedico } = useEstadoClinico();
  const fueraDeDupla = medicoActualId !== paciente.medicoPrincipalId && medicoActualId !== paciente.medicoSoporteId;

  return (
    <tr
      className={[
        "group border-b border-border transition-colors hover:bg-accent",
        fueraDeDupla ? "bg-muted/40" : "bg-card",
      ].join(" ")}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {fueraDeDupla && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-md border-l-[3px] border-l-clinico-ambar bg-muted/40 px-2 py-0.5 text-[0.8125rem] font-medium text-foreground"
              title="Este paciente no es de tu dupla"
            >
              <ShieldAlert aria-hidden="true" className="size-4" />
              No es de tu dupla
            </span>
          )}
          <Link
            to="/paciente/$id"
            params={{ id: paciente.id }}
            className="text-base font-semibold text-primary hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {paciente.nombre}
          </Link>
        </div>
      </td>
      <td className="px-3 py-2 text-base font-semibold text-foreground">{cita.hora}</td>
      <td className="px-3 py-2 text-base text-foreground">
        <span className="font-semibold">{paciente.fase ?? "Fase no registrada"}</span>
        <span className="text-muted-foreground">
          {" "}· Ciclo {paciente.cicloActual}
          {paciente.ciclosTotales ? ` de ${paciente.ciclosTotales}` : " registrado"}
        </span>
      </td>
      <td className="px-3 py-2">
        <IconosAlerta alertas={paciente.alertas} />
      </td>
      <td className="px-3 py-2 text-base text-foreground">
        {nombreMedico(paciente.medicoPrincipalId)}
      </td>
      <td className="px-3 py-2">
        <EstadoFamilia pacienteId={paciente.id} />
      </td>
    </tr>
  );
}

export function TablaJornada() {
  const [busqueda, setBusqueda] = useState("");
  const { pacientes, citas: citasDeHoy, carga } = useEstadoClinico();

  const filas = citasDeHoy
    .map((cita) => ({ cita, paciente: pacientes.find((p) => p.id === cita.pacienteId) }))
    .filter((item): item is { cita: Cita; paciente: Paciente } => {
      if (!item.paciente) return false;
      if (!busqueda.trim()) return true;
      return item.paciente.nombre.toLowerCase().includes(busqueda.toLowerCase());
    })
    .sort((a, b) => a.cita.hora.localeCompare(b.cita.hora));

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="sticky top-0 z-20 -mx-3 flex flex-col gap-2 border-b border-border bg-background px-3 py-2 sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:px-0 sm:py-0">
      <label htmlFor="buscador-pacientes" className="sr-only">
        Buscar paciente por nombre
      </label>
      <Input
        id="buscador-pacientes"
        type="search"
        placeholder="Buscar paciente por nombre..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        className="h-12 w-full text-base sm:max-w-sm"
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filas.length} de {citasDeHoy.length} citas
        {carga ? ` · leídas de ${carga.archivo} (solo lectura)` : ""}
      </p>
    </div>

      {/* Móvil: una tarjeta por paciente con los datos indispensables. */}
      <ul className="flex flex-col gap-2 md:hidden">
        {filas.length === 0 ? (
          <li className="bg-card px-3 py-6 text-center text-base text-muted-foreground">
            {citasDeHoy.length === 0
              ? "El archivo cargado no registra próximas citas."
              : `No se encontraron pacientes para “${busqueda}”.`}
          </li>
        ) : (
          filas.map(({ cita, paciente }) => (
            <li key={cita.id}>
              <TarjetaPaciente cita={cita} paciente={paciente} />
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-md border border-border md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Pacientes citados en la clínica de día de hoy</caption>
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Paciente
              </th>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Hora
              </th>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Fase y ciclo
              </th>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Alertas
              </th>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Médico responsable
              </th>
              <th scope="col" className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Respuesta de la familia
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-base text-muted-foreground">
                  {citasDeHoy.length === 0
                    ? "El archivo cargado no registra próximas citas. Nada que mostrar en la jornada."
                    : `No se encontraron pacientes para “${busqueda}”.`}
                </td>
              </tr>
            ) : (
              filas.map(({ cita, paciente }) => <FilaPaciente key={cita.id} cita={cita} paciente={paciente} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
