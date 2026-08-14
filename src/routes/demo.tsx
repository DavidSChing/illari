import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, RotateCcw, TableProperties, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanillaExcel } from "@/components/demo/PlanillaExcel";
import { FichaCompacta } from "@/components/demo/FichaCompacta";
import { pacientes } from "@/data/pacientes";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demostración de tiempos · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Comparación en vivo del tiempo para reconstruir el estado de un paciente en una planilla cruda frente a la Ficha de Continuidad.",
      },
      { property: "og:title", content: "Demostración de tiempos · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Cronómetro comparativo con datos sintéticos, sin información real de pacientes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PantallaDemo,
});

const PACIENTE_TRAZADOR = "pac-01";

function formatearTiempo(ms: number): string {
  const total = Math.floor(ms / 100) / 10;
  const minutos = Math.floor(total / 60);
  const segundos = (total % 60).toFixed(1).padStart(4, "0");
  return `${String(minutos).padStart(2, "0")}:${segundos}`;
}

function PantallaDemo() {
  const paciente = pacientes.find((item) => item.id === PACIENTE_TRAZADOR) ?? pacientes[0]!;

  const [inicio, setInicio] = useState<number | null>(null);
  const [transcurrido, setTranscurrido] = useState(0);
  const [tiempoExcel, setTiempoExcel] = useState<number | null>(null);
  const [tiempoFicha, setTiempoFicha] = useState<number | null>(null);
  const intervalo = useRef<number | null>(null);

  useEffect(() => {
    if (inicio === null) return;
    intervalo.current = window.setInterval(() => setTranscurrido(Date.now() - inicio), 100);
    return () => {
      if (intervalo.current) window.clearInterval(intervalo.current);
    };
  }, [inicio]);

  const enMarcha = inicio !== null;
  const ambosRegistrados = tiempoExcel !== null && tiempoFicha !== null;

  const iniciar = useCallback(() => {
    setTiempoExcel(null);
    setTiempoFicha(null);
    setTranscurrido(0);
    setInicio(Date.now());
  }, []);

  const reiniciar = useCallback(() => {
    if (intervalo.current) window.clearInterval(intervalo.current);
    setInicio(null);
    setTranscurrido(0);
    setTiempoExcel(null);
    setTiempoFicha(null);
  }, []);

  const registrar = useCallback(
    (lado: "excel" | "ficha") => {
      if (inicio === null) return;
      const marca = Date.now() - inicio;
      if (lado === "excel") setTiempoExcel(marca);
      else setTiempoFicha(marca);
    },
    [inicio],
  );

  useEffect(() => {
    if (ambosRegistrados && intervalo.current) {
      window.clearInterval(intervalo.current);
      intervalo.current = null;
    }
  }, [ambosRegistrados]);

  const reduccion =
    tiempoExcel && tiempoFicha && tiempoExcel > 0
      ? Math.max(0, Math.round(((tiempoExcel - tiempoFicha) / tiempoExcel) * 100))
      : null;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-2 lg:h-[calc(100vh-9rem)]">
      <header className="rounded-md border border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">Demostración de tiempos</h1>
            <p className="text-base text-foreground">
              Tarea: encontrar en qué <strong>ciclo</strong> está el paciente{" "}
              <strong>Mateo Quispe</strong> y si tiene alguna <strong>alerta</strong>.
            </p>
          </div>

          <p
            className="font-mono text-5xl font-bold tabular-nums text-primary"
            role="timer"
            aria-live="off"
            aria-label={`Cronómetro: ${formatearTiempo(transcurrido)}`}
          >
            {formatearTiempo(transcurrido)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={iniciar} size="lg" className="text-base">
              <Play aria-hidden="true" className="size-5" />
              {enMarcha ? "Reiniciar prueba" : "Iniciar prueba"}
            </Button>
            <Button
              onClick={() => registrar("excel")}
              disabled={!enMarcha || tiempoExcel !== null}
              variant="outline"
              size="lg"
              className="text-base"
            >
              <TableProperties aria-hidden="true" className="size-5" />
              Encontrado en Excel
            </Button>
            <Button
              onClick={() => registrar("ficha")}
              disabled={!enMarcha || tiempoFicha !== null}
              variant="outline"
              size="lg"
              className="text-base"
            >
              <FileText aria-hidden="true" className="size-5" />
              Encontrado en la Ficha
            </Button>
            <Button onClick={reiniciar} variant="ghost" size="lg" className="text-base">
              <RotateCcw aria-hidden="true" className="size-5" />
              Limpiar
            </Button>
          </div>
        </div>

        <div aria-live="polite" className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-base">
          <span className="text-foreground">
            Excel:{" "}
            <strong className="font-mono tabular-nums">
              {tiempoExcel === null ? "—" : formatearTiempo(tiempoExcel)}
            </strong>
          </span>
          <span className="text-foreground">
            Ficha:{" "}
            <strong className="font-mono tabular-nums">
              {tiempoFicha === null ? "—" : formatearTiempo(tiempoFicha)}
            </strong>
          </span>
          {reduccion !== null ? (
            <span className="rounded-md border-2 border-clinico-verde bg-clinico-verde-suave px-3 py-1 font-bold text-clinico-verde-foreground">
              Reducción de tiempo: {reduccion} % ({formatearTiempo(tiempoExcel!)} →{" "}
              {formatearTiempo(tiempoFicha!)})
            </span>
          ) : (
            <span className="text-muted-foreground">
              Registre ambos lados para ver la comparación. El sistema muestra, el médico decide.
            </span>
          )}
        </div>
      </header>

      <p
        role="note"
        className="rounded-md border border-border bg-secondary px-3 py-2 text-base font-semibold text-secondary-foreground lg:hidden"
      >
        Para la comparación completa, use una pantalla más grande. Aquí se muestra una encima de la
        otra.
      </p>

      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-2">
        <section aria-labelledby="titulo-planilla" className="flex min-h-0 min-w-0 flex-col gap-1">
          <h2 id="titulo-planilla" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Hoy: planilla de cálculo (200 filas · 25 columnas)
          </h2>
          <div className="h-[50vh] min-h-0 lg:h-auto lg:flex-1">
            <PlanillaExcel />
          </div>
        </section>

        <section aria-labelledby="titulo-ficha-demo" className="flex min-h-0 min-w-0 flex-col gap-1">
          <h2 id="titulo-ficha-demo" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Propuesta: Ficha de Continuidad
          </h2>
          <div className="min-h-0 lg:flex-1">
            <FichaCompacta paciente={paciente} />
          </div>
        </section>
      </div>
    </div>
  );
}
