import type { Paciente } from "@/data/tipos";
import { ETIQUETA_DEMO } from "@/data/esquemas";
import { obtenerSeguimiento } from "@/data/seguimientos";
import { evaluarEsquema } from "@/lib/esquema";
import { LineaTiempoEsquema } from "./LineaTiempoEsquema";
import { TarjetaDesviacion } from "./TarjetaDesviacion";
import { HistorialAdministraciones } from "./HistorialAdministraciones";
import { CriteriosVerificacion } from "./CriteriosVerificacion";
import { ReferenciaAntropometrica } from "./ReferenciaAntropometrica";

export function PestanaEsquema({
  paciente,
  nombreMedico,
}: {
  paciente: Paciente;
  nombreMedico: (id: string) => string;
}) {
  const seguimiento = obtenerSeguimiento(paciente.id);

  if (!seguimiento) {
    return (
      <div className="bg-card px-4 py-6">
        <h2 className="text-lg font-bold text-foreground">Sin esquema registrado</h2>
        <p className="mt-1 text-base text-muted-foreground">
          Este paciente no tiene un esquema de demostración asociado. El archivo cargado no incluye el
          calendario de fases y ciclos.
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          El sistema muestra el calendario. La decisión clínica corresponde al médico tratante.
        </p>
      </div>
    );
  }

  const evaluacion = evaluarEsquema(seguimiento);

  return (
    <div className="flex flex-col gap-2">
      <p className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground">
        {evaluacion.esquema.nombre} · {ETIQUETA_DEMO}
      </p>

      <TarjetaDesviacion evaluacion={evaluacion} />
      <LineaTiempoEsquema ciclos={evaluacion.ciclos} />

      <div className="grid gap-2 lg:grid-cols-2">
        <HistorialAdministraciones
          administraciones={seguimiento.administraciones}
          nombreMedico={nombreMedico}
        />
        <div className="flex flex-col gap-2">
          <CriteriosVerificacion
            criterios={evaluacion.esquema.criterios}
            paciente={paciente}
            antropometria={seguimiento.antropometria}
          />
          <ReferenciaAntropometrica antropometria={seguimiento.antropometria} />
        </div>
      </div>
    </div>
  );
}
