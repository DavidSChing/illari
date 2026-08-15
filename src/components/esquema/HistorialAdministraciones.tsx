import type { AdministracionCiclo } from "@/data/seguimientos";
import { formatearFecha } from "@/lib/formato";

export function HistorialAdministraciones({
  administraciones,
  nombreMedico,
}: {
  administraciones: AdministracionCiclo[];
  nombreMedico: (id: string) => string;
}) {
  const ordenadas = [...administraciones].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <section
      aria-labelledby="titulo-historial"
      className="bg-card px-4 py-3"
    >
      <h2
        id="titulo-historial"
        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Historial de administraciones
      </h2>

      {ordenadas.length === 0 ? (
        <p className="mt-2 text-base text-muted-foreground">
          No hay administraciones registradas para este paciente.
        </p>
      ) : (
        <div className="mt-2 max-h-52 overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Administraciones registradas, de la más reciente a la más antigua
            </caption>
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="py-1 pr-2 font-semibold">Fecha</th>
                <th scope="col" className="py-1 pr-2 font-semibold">Ciclo</th>
                <th scope="col" className="py-1 pr-2 font-semibold">Administrado</th>
                <th scope="col" className="py-1 pr-2 font-semibold">Dosis registrada</th>
                <th scope="col" className="py-1 font-semibold">Médico que atendió</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((adm) => (
                <tr key={`${adm.ciclo}-${adm.fecha}`} className="border-b border-border/60">
                  <td className="py-1 pr-2 font-semibold text-foreground">{formatearFecha(adm.fecha)}</td>
                  <td className="py-1 pr-2 text-foreground">Ciclo {adm.ciclo}</td>
                  <td className="py-1 pr-2 text-foreground">{adm.medicamento}</td>
                  <td className="py-1 pr-2 text-foreground">{adm.dosis}</td>
                  <td className="py-1 text-foreground">{nombreMedico(adm.medicoId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
