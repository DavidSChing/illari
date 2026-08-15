import { CAMPOS, SIN_MAPEAR, type CampoDestino, type Mapeo } from "@/lib/excel/mapeo";
import { Button } from "@/components/ui/button";

export function ConfirmacionMapeo({
  encabezados,
  muestra,
  mapeo,
  onCambiar,
  onConfirmar,
  onCancelar,
  filaCabecera,
}: {
  encabezados: string[];
  muestra: unknown[][];
  mapeo: Mapeo;
  onCambiar: (campo: CampoDestino, columna: number) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  filaCabecera: number;
}) {
  const faltantes = CAMPOS.filter((campo) => campo.requerido && mapeo[campo.clave] === SIN_MAPEAR);

  return (
    <section aria-labelledby="titulo-mapeo" className="flex flex-col gap-4">
      <div className="bg-card p-4">
        <h2 id="titulo-mapeo" className="text-xl font-bold text-foreground">
          Confirme cómo se interpretó cada columna
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          La cabecera se detectó en la fila {filaCabecera + 1} del archivo. Corrija cualquier
          interpretación antes de confirmar. La plataforma no cambia el archivo: solo lo interpreta.
        </p>

        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {CAMPOS.map((campo) => {
            const idSelector = `mapeo-${campo.clave}`;
            const columna = mapeo[campo.clave];
            return (
              <li key={campo.clave} className="rounded-md border border-border bg-background p-3">
                <label htmlFor={idSelector} className="text-base font-semibold text-foreground">
                  {campo.etiqueta}
                  {campo.requerido ? (
                    <span className="ml-1 text-sm font-bold text-foreground">
                      (obligatorio)
                    </span>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">(opcional)</span>
                  )}
                </label>
                <select
                  id={idSelector}
                  value={columna}
                  onChange={(evento) => onCambiar(campo.clave, Number(evento.target.value))}
                  className="mt-2 min-h-11 w-full rounded-md border border-input bg-card px-3 text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <option value={SIN_MAPEAR}>No está en este archivo</option>
                  {encabezados.map((encabezado, indice) => (
                    <option key={`${encabezado}-${indice}`} value={indice}>
                      Columna {indice + 1}: {encabezado || "(sin título)"}
                    </option>
                  ))}
                </select>
                {columna !== SIN_MAPEAR && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ejemplo del archivo:{" "}
                    <span className="font-semibold text-foreground">
                      {String(muestra[0]?.[columna] ?? "") || "(vacío)"}
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {faltantes.length > 0 && (
          <p
            role="status"
            className="mt-3 rounded-md border-l-[3px] border-l-clinico-ambar bg-muted/40 px-3 py-2 text-base font-semibold text-foreground"
          >
            Falta indicar: {faltantes.map((campo) => campo.etiqueta).join(", ")}.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="min-h-12 text-base"
            disabled={faltantes.length > 0}
            onClick={onConfirmar}
          >
            Confirmar mapeo y consolidar
          </Button>
          <Button type="button" variant="outline" className="min-h-12 text-base" onClick={onCancelar}>
            Elegir otro archivo
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Primeras filas del archivo, tal como están en el Excel</caption>
          <thead className="bg-muted">
            <tr>
              {encabezados.map((encabezado, indice) => (
                <th
                  key={`${encabezado}-${indice}`}
                  scope="col"
                  className="whitespace-nowrap px-2 py-1 font-semibold text-muted-foreground"
                >
                  {encabezado || `Columna ${indice + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {muestra.slice(0, 5).map((fila, indiceFila) => (
              <tr key={indiceFila} className="border-t border-border">
                {encabezados.map((_, indiceColumna) => (
                  <td key={indiceColumna} className="whitespace-nowrap px-2 py-1 text-foreground">
                    {String(fila[indiceColumna] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
