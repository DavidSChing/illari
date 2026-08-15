import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, ClipboardCopy, LayoutGrid, PencilLine, Users } from "lucide-react";

import { useEstadoClinico } from "@/state/EstadoClinico";
import { formatearFecha } from "@/lib/formato";
import {
  ETIQUETA_NIVEL,
  ocupacionActual,
  ocupacionSugerida,
  type EntradaCola,
} from "@/lib/programacion";
import { mensajesDeProgramacion, tablaProgramacion } from "@/lib/salidaProgramacion";
import {
  DURACION_FRANJA_ACTUAL,
  FRANJAS_ACTUALES,
  PESOS_ACTUALES,
} from "@/data/ocupacionActual";
import { BloquesSugeridos } from "@/components/programacion/BloquesSugeridos";
import { ComparacionOcupacion } from "@/components/programacion/ComparacionOcupacion";
import { PanelConfiguracion } from "@/components/programacion/PanelConfiguracion";
import { FueraDeProgramacion } from "@/components/programacion/FueraDeProgramacion";
import { RegistroCambios } from "@/components/programacion/RegistroCambios";
import { MensajesFamilias } from "@/components/programacion/MensajesFamilias";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NivelSemaforo } from "@/data/tipos";


export const Route = createFileRoute("/programacion")({
  head: () => ({
    meta: [
      { title: "Programación sugerida · Ficha de Continuidad" },
      {
        name: "description",
        content:
          "Propuesta de orden de citas de quimioterapia en clínica de día por prioridad clínica, con datos sintéticos de demostración.",
      },
      { property: "og:title", content: "Programación sugerida · Ficha de Continuidad" },
      {
        property: "og:description",
        content: "Cola de pacientes ordenada por prioridad y bloques de sillones configurables.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VistaProgramacion,
});

const PUNTO: Record<NivelSemaforo, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

const TITULO_GRUPO: Record<1 | 2 | 3, string> = {
  1: "Grupo 1 · alerta roja",
  2: "Grupo 2 · alerta ámbar",
  3: "Grupo 3 · sin alertas",
};

function VistaProgramacion() {
  const {
    programacion: resultado,
    configProgramacion,
    setConfigProgramacion,
    cambiosProgramacion,
    obtenerPaciente,
  } = useEstadoClinico();
  const [copiado, setCopiado] = useState(false);

  const { cola, bloques, excluidos, horaTermino, opciones } = resultado;

  const sugerida = useMemo(() => ocupacionSugerida(resultado), [resultado]);
  const actual = useMemo(
    () =>
      ocupacionActual(
        cola.length,
        opciones.capacidadPorBloque,
        FRANJAS_ACTUALES,
        PESOS_ACTUALES,
        DURACION_FRANJA_ACTUAL,
      ),
    [cola.length, opciones.capacidadPorBloque],
  );

  const mensajes = useMemo(() => mensajesDeProgramacion(bloques, obtenerPaciente), [bloques, obtenerPaciente]);

  const ultimoCambio = cambiosProgramacion[0];

  const copiarProgramacion = async () => {
    try {
      await navigator.clipboard.writeText(tablaProgramacion(bloques));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 3000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-3 md:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Programación sugerida de clínica de día
        </h1>
      </header>

      {ultimoCambio ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-primary bg-primary/10 px-3 py-2 text-base font-semibold text-foreground"
        >
          <PencilLine aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          Ajuste manual del equipo asistencial · {ultimoCambio.hora} · {ultimoCambio.accion}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-12 text-base" onClick={copiarProgramacion}>
          <ClipboardCopy aria-hidden="true" className="size-5" />
          {copiado ? "Programación copiada" : "Copiar programación"}
        </Button>
        <MensajesFamilias mensajes={mensajes} />
        <p aria-live="polite" className="sr-only">
          {copiado ? "Programación copiada al portapapeles." : ""}
        </p>
      </div>

      <PanelConfiguracion
        valores={configProgramacion}
        onCambio={(parcial) => setConfigProgramacion(parcial)}
      />

      <section aria-label="Indicadores de la programación" className="grid gap-3 sm:grid-cols-3">
        <Indicador
          Icono={Users}
          etiqueta="Pacientes por programar"
          valor={String(cola.length)}
        />
        <Indicador
          Icono={LayoutGrid}
          etiqueta="Bloques necesarios"
          valor={String(bloques.length)}
        />
        <Indicador
          Icono={CalendarClock}
          etiqueta="Hora de término estimada"
          valor={bloques.length === 0 ? "—" : horaTermino}
        />
      </section>

      <Tabs defaultValue="bloques">
        <TabsList aria-label="Secciones de la programación">
          <TabsTrigger value="bloques">Bloques</TabsTrigger>
          <TabsTrigger value="cola">Cola por prioridad</TabsTrigger>
          <TabsTrigger value="comparacion">Comparación de ocupación</TabsTrigger>
        </TabsList>

        <TabsContent value="bloques" className="flex flex-col gap-4">
          <BloquesSugeridos bloques={bloques} capacidad={opciones.capacidadPorBloque} />
          <FueraDeProgramacion excluidos={excluidos} />
          <RegistroCambios cambios={cambiosProgramacion} />
        </TabsContent>

        <TabsContent value="cola" className="bg-card">
          {cola.length === 0 ? (
            <p className="px-3 py-6 text-base text-muted-foreground md:px-4">
              No hay pacientes por programar con los datos cargados.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {cola.map((entrada, indice) => (
                <FilaCola
                  key={entrada.paciente.id}
                  entrada={entrada}
                  cierraGrupo={cola[indice + 1]?.grupo !== entrada.grupo}
                />
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="comparacion">
          <ComparacionOcupacion
            actual={actual}
            sugerida={sugerida}
            capacidad={opciones.capacidadPorBloque}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Indicador({
  Icono,
  etiqueta,
  valor,
}: {
  Icono: typeof Users;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icono aria-hidden="true" className="size-4 shrink-0" />
        {etiqueta}
      </p>
      <p className="mt-1 cifra-clinica text-foreground">{valor}</p>
    </div>
  );
}

function FilaCola({ entrada, cierraGrupo }: { entrada: EntradaCola; cierraGrupo: boolean }) {
  const { paciente, orden, grupo } = entrada;

  return (
    <li className={cierraGrupo ? "border-b-4 border-b-primary/40" : undefined}>
      <Link
        to="/paciente/$id"
        params={{ id: paciente.id }}
        className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:px-4"
      >
        <span className="w-8 shrink-0 text-lg font-bold tabular-nums text-muted-foreground">
          {orden}
        </span>
        <span className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${PUNTO[paciente.nivel]}`} />
          {paciente.nombre}
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          {ETIQUETA_NIVEL[paciente.nivel]}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground">
          <span>
            Diagnóstico:{" "}
            {paciente.fechaDiagnostico ? formatearFecha(paciente.fechaDiagnostico) : "No registrado"}
          </span>
          <span className="tabular-nums">{paciente.horasDeViaje} h de viaje</span>
        </span>
      </Link>
      {cierraGrupo ? (
        <p className="bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-4">
          Fin del {TITULO_GRUPO[grupo]}
        </p>
      ) : null}
    </li>
  );
}
