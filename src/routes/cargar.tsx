import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ZonaSoltar } from "@/components/carga/ZonaSoltar";
import { ConfirmacionMapeo } from "@/components/carga/ConfirmacionMapeo";
import { AvisoSoloLectura, PanelResultados } from "@/components/carga/PanelResultados";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { consolidar } from "@/lib/excel/consolidar";
import {
  detectarFilaCabecera,
  proponerMapeo,
  MAPEO_VACIO,
  type CampoDestino,
  type Mapeo,
} from "@/lib/excel/mapeo";
import { descargarEjemplo } from "@/lib/excel/ejemplo";
import { formatearFecha } from "@/lib/formato";

export const Route = createFileRoute("/cargar")({
  head: () => ({
    meta: [
      { title: "Cargar Excel de citas · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Lectura local y de solo lectura del Excel de citas de hematología pediátrica: consolida atenciones sin modificar el archivo.",
      },
      { property: "og:title", content: "Cargar Excel de citas · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "El Excel sigue siendo la fuente de verdad. La plataforma solo lo lee y lo organiza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CargarExcel,
});

interface ArchivoLeido {
  nombre: string;
  filas: unknown[][];
  filaCabecera: number;
  encabezados: string[];
}

function CargarExcel() {
  const { carga, aplicarCarga, limpiarCarga } = useEstadoClinico();
  const [archivo, setArchivo] = useState<ArchivoLeido | null>(null);
  const [mapeo, setMapeo] = useState<Mapeo>(MAPEO_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const leerArchivo = async (entrada: File) => {
    setError(null);
    setOcupado(true);
    try {
      const XLSX = await import("xlsx");
      const libro = XLSX.read(await entrada.arrayBuffer(), { cellDates: true });
      const nombreHoja = libro.SheetNames[0];
      const hoja = nombreHoja ? libro.Sheets[nombreHoja] : undefined;
      if (!hoja) throw new Error("El archivo no contiene ninguna hoja de cálculo.");

      const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
        header: 1,
        blankrows: false,
        defval: "",
      });
      if (filas.length === 0) throw new Error("La hoja está vacía.");

      const filaCabecera = detectarFilaCabecera(filas);
      const encabezados = (filas[filaCabecera] ?? []).map((celda) => String(celda ?? "").trim());

      setArchivo({ nombre: entrada.name, filas, filaCabecera, encabezados });
      setMapeo(proponerMapeo(encabezados));
    } catch (problema) {
      setError(
        problema instanceof Error
          ? `No se pudo leer el archivo: ${problema.message}`
          : "No se pudo leer el archivo.",
      );
      setArchivo(null);
    } finally {
      setOcupado(false);
    }
  };

  const confirmar = () => {
    if (!archivo) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const resultado = consolidar(archivo.filas.slice(archivo.filaCabecera + 1), mapeo, {
      archivo: archivo.nombre,
      fechaCarga: hoy,
      hoy,
      filaCabecera: archivo.filaCabecera,
    });
    aplicarCarga(resultado);
    setArchivo(null);
  };

  const reiniciar = () => {
    limpiarCarga();
    setArchivo(null);
    setError(null);
  };

  return (
    <section aria-labelledby="titulo-cargar" className="flex flex-col gap-4 pb-8">
      <header>
        <h1 id="titulo-cargar" className="text-2xl font-bold text-foreground">
          Cargar el Excel de citas
        </h1>
        <p className="mt-1 max-w-3xl text-base text-muted-foreground">
          La plataforma lee el archivo que el equipo ya usa hoy, lo consolida y lo organiza. No cambia
          el proceso de registro ni el contenido del archivo.
        </p>
      </header>

      <AvisoSoloLectura />

      {error && (
        <p
          role="alert"
          className="rounded-md border border-clinico-rojo bg-clinico-rojo-suave px-3 py-2 text-base font-semibold text-clinico-rojo-foreground"
        >
          {error}
        </p>
      )}

      {carga && !archivo && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary px-4 py-3">
          <p className="text-base text-secondary-foreground">
            Datos en uso: <span className="font-bold">{carga.archivo}</span>, cargado el{" "}
            {formatearFecha(carga.fechaCarga)}. Alimenta la jornada de hoy, cada Ficha de Continuidad y
            la carga por médico.
          </p>
          <Button type="button" variant="outline" className="min-h-11" onClick={reiniciar}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Volver a los datos sintéticos
          </Button>
        </div>
      )}

      {!archivo && (
        <>
          <ZonaSoltar onArchivo={leerArchivo} ocupado={ocupado} />
          <p className="text-sm text-muted-foreground">
            ¿No tiene el archivo a la mano para la demostración?{" "}
            <button
              type="button"
              onClick={() => void descargarEjemplo()}
              className="font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Download aria-hidden="true" className="mr-1 inline size-4" />
              Descargue un archivo de ejemplo con datos sintéticos
            </button>
          </p>
        </>
      )}

      {archivo && (
        <ConfirmacionMapeo
          encabezados={archivo.encabezados}
          muestra={archivo.filas.slice(archivo.filaCabecera + 1)}
          mapeo={mapeo}
          filaCabecera={archivo.filaCabecera}
          onCambiar={(campo: CampoDestino, columna: number) =>
            setMapeo((previo) => ({ ...previo, [campo]: columna }))
          }
          onConfirmar={confirmar}
          onCancelar={() => setArchivo(null)}
        />
      )}

      {carga && !archivo && <PanelResultados resultado={carga} />}
    </section>
  );
}
