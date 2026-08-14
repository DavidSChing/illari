import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { citasDeHoy } from "@/data/agenda";
import { pacientes } from "@/data/pacientes";
import { nombreMedico } from "@/data/medicos";
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
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-semibold ${
                nivel === "rojo"
                  ? "border-clinico-rojo bg-clinico-rojo-suave text-clinico-rojo-foreground"
                  : "border-clinico-ambar bg-clinico-ambar-suave text-clinico-ambar-foreground"
              }`}
            >
              <Icono aria-hidden="true" className="size-4" />
              {alerta}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function FilaPaciente({ cita, paciente }: { cita: Cita; paciente: Paciente }) {
  const { medicoActualId } = useEstadoClinico();
  const fueraDeDupla = medicoActualId !== paciente.medicoPrincipalId && medicoActualId !== paciente.medicoSoporteId;

  return (
    <tr
      className={[
        "group border-b border-border transition-colors hover:bg-accent",
        fueraDeDupla ? "bg-clinico-ambar-suave/50" : "bg-card",
      ].join(" ")}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          {fueraDeDupla && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-clinico-ambar bg-clinico-ambar-suave px-2 py-0.5 text-sm font-bold text-clinico-ambar-foreground"
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
        <span className="font-semibold">{paciente.fase}</span>
        <span className="text-muted-foreground"> · Ciclo {paciente.cicloActual} de {paciente.ciclosTotales}</span>
      </td>
      <td className="px-3 py-2">
        <IconosAlerta alertas={paciente.alertas} />
      </td>
      <td className="px-3 py-2 text-base text-foreground">
        {nombreMedico(paciente.medicoPrincipalId)}
      </td>
    </tr>
  );
}

export function TablaJornada() {
  const [busqueda, setBusqueda] = useState("");

  const filas = citasDeHoy
    .map((cita) => ({ cita, paciente: pacientes.find((p) => p.id === cita.pacienteId) }))
    .filter((item): item is { cita: Cita; paciente: Paciente } => {
      if (!item.paciente) return false;
      if (!busqueda.trim()) return true;
      return item.paciente.nombre.toLowerCase().includes(busqueda.toLowerCase());
    })
    .sort((a, b) => a.cita.hora.localeCompare(b.cita.hora));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="buscador-pacientes" className="sr-only">
          Buscar paciente por nombre
        </label>
        <Input
          id="buscador-pacientes"
          type="search"
          placeholder="Buscar paciente por nombre..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filas.length} de {citasDeHoy.length} citas
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-base text-muted-foreground">
                  No se encontraron pacientes para “{busqueda}”.
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
