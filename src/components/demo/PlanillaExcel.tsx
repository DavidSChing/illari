import { COLUMNAS_PLANILLA, filasPlanilla } from "@/data/planilla";

/**
 * Reproducción deliberadamente cruda de la planilla actual: sin buscador,
 * sin colores, sin jerarquía visual. Solo se usa en la demostración comparativa.
 */
export function PlanillaExcel() {
  return (
    <div
      className="h-full overflow-auto border border-neutral-400 bg-white"
      tabIndex={0}
      role="region"
      aria-label="Planilla de cálculo con 200 filas y 25 columnas de datos crudos"
    >
      <table className="w-max border-collapse text-[11px] leading-tight text-black">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 top-0 z-20 border border-neutral-400 bg-neutral-200 px-1 py-0.5 font-normal"
            >
              #
            </th>
            {COLUMNAS_PLANILLA.map((columna) => (
              <th
                key={columna}
                scope="col"
                className="sticky top-0 z-10 whitespace-nowrap border border-neutral-400 bg-neutral-200 px-1 py-0.5 text-left font-normal"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filasPlanilla.map((fila, indice) => (
            <tr key={fila[0]}>
              <th
                scope="row"
                className="sticky left-0 z-10 border border-neutral-400 bg-neutral-100 px-1 py-0.5 text-right font-normal text-neutral-600"
              >
                {indice + 2}
              </th>
              {fila.map((celda, columna) => (
                <td
                  key={COLUMNAS_PLANILLA[columna]}
                  className="whitespace-nowrap border border-neutral-300 px-1 py-0.5"
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
