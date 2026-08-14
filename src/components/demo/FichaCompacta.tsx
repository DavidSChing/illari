import { MapPin, Syringe } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import { formatearFecha } from "@/lib/formato";
import { BarraFases } from "@/components/ficha/BarraFases";
import { PanelAlertas } from "@/components/ficha/PanelAlertas";
import { TarjetasLaboratorio } from "@/components/ficha/TarjetasLaboratorio";
import { ProximoPaso } from "@/components/ficha/ProximoPaso";

/** Misma Ficha de Continuidad, reducida para el panel derecho de la demostración. */
export function FichaCompacta({ paciente }: { paciente: Paciente }) {
  return (
    <div
      className="flex h-full flex-col gap-2 overflow-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      tabIndex={0}
      role="group"
      aria-label={`Ficha de Continuidad de ${paciente.nombre}`}
    >
      <header className="rounded-md border border-border bg-card px-3 py-2">
        <h3 className="text-xl font-bold leading-tight text-foreground">{paciente.nombre}</h3>
        <p className="text-base text-foreground">
          {paciente.edad} años · {paciente.sexo} ·{" "}
          <span className="font-semibold">{paciente.diagnostico}</span>
        </p>
        {paciente.procedencia.fueraDeLima ? (
          <p className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-2 py-1 text-sm font-bold text-primary-foreground">
            <MapPin aria-hidden="true" className="size-4" />
            Viaja {paciente.horasDeViaje} h desde {paciente.procedencia.region}
          </p>
        ) : null}
      </header>

      <BarraFases
        fase={paciente.fase}
        cicloActual={paciente.cicloActual}
        ciclosTotales={paciente.ciclosTotales}
      />
      <PanelAlertas alertas={paciente.alertas} />
      <TarjetasLaboratorio laboratorio={paciente.laboratorio} />
      <p className="flex flex-wrap items-center gap-x-2 rounded-md border border-border bg-card px-3 py-2 text-base font-semibold text-foreground">
        <Syringe aria-hidden="true" className="size-4 text-primary" />
        {paciente.ultimaAdministracion.medicamento}
        <span className="font-medium">{paciente.ultimaAdministracion.dosis}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {formatearFecha(paciente.ultimaAdministracion.fecha)}
        </span>
      </p>
      <ProximoPaso texto={paciente.proximoPasoSugerido} />
    </div>
  );
}
