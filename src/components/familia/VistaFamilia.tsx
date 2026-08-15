import { useRef, useState } from "react";
import { Check, Phone, Thermometer } from "lucide-react";

import type { Paciente } from "@/data/tipos";
import { useEstadoClinico } from "@/state/EstadoClinico";
import {
  COSAS_QUE_LLEVAR,
  LUGAR_CITA,
  MOTIVOS_CANCELACION,
  SENALES_DE_ALARMA,
  TELEFONO_EQUIPO,
  cuentaRegresiva,
  fechaCortaEnPalabras,
  horaDeLaCita,
  primerNombre,
} from "@/lib/familia";
import { PanelDemoFamilia } from "@/components/familia/PanelDemoFamilia";
import { CalendarioTratamiento } from "@/components/familia/CalendarioTratamiento";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const BOTON_GRANDE =
  "flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const DISPARADOR =
  "min-h-14 gap-3 py-0 text-left text-lg font-bold text-foreground no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function VistaFamilia({ paciente }: { paciente: Paciente }) {
  const {
    respuestaFamilia,
    confirmarAsistencia,
    cancelarAsistencia,
    reportarFiebre,
    medicos,
    horaPropuesta,
  } = useEstadoClinico();
  const respuesta = respuestaFamilia(paciente.id);
  const [eligiendoMotivo, setEligiendoMotivo] = useState(false);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [seccionAbierta, setSeccionAbierta] = useState<string>("");
  const acordeonRef = useRef<HTMLDivElement>(null);

  const nino = primerNombre(paciente.nombre);
  const fecha = fechaCortaEnPalabras(paciente.fechaProximaCita);
  const hora = horaPropuesta(paciente.id) ?? horaDeLaCita(paciente.id);
  const faltan = cuentaRegresiva(paciente.fechaProximaCita);
  const principal = medicos.find((medico) => medico.id === paciente.medicoPrincipalId);
  const soporte = medicos.find((medico) => medico.id === paciente.medicoSoporteId);
  const totalSesiones = paciente.ciclosTotales ?? paciente.cicloActual;
  const avance = totalSesiones > 0 ? Math.round((paciente.cicloActual / totalSesiones) * 100) : 0;
  const sinResponder = respuesta.asistencia === "sin_responder";

  function abrirSeccion(valor: string) {
    setSeccionAbierta(valor);
    window.requestAnimationFrame(() =>
      acordeonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[480px]">
      <PanelDemoFamilia paciente={paciente} />

      <div className="flex flex-col gap-4 pb-56">
        {/* a) Línea de contexto */}
        <section
          aria-label="Contexto del tratamiento"
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pr-[4.75rem]"
        >
          <p className="min-w-0 truncate text-[0.9375rem] font-semibold text-foreground">
            {nino}, {paciente.edad} años · Sesión {paciente.cicloActual} de {totalSesiones}
          </p>
          <div
            role="progressbar"
            aria-valuenow={paciente.cicloActual}
            aria-valuemin={0}
            aria-valuemax={totalSesiones}
            aria-label={`Avance: ${paciente.cicloActual} de ${totalSesiones} sesiones`}
            className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full bg-primary" style={{ width: `${avance}%` }} />
          </div>
        </section>

        {/* b) Próxima cita */}
        <section
          aria-labelledby="titulo-proxima-cita"
          className="rounded-md border-2 border-primary bg-card px-4 py-3"
        >
          <h1
            id="titulo-proxima-cita"
            className="text-[0.9375rem] font-bold uppercase tracking-wide text-foreground"
          >
            Su próxima cita
          </h1>
          <p className="mt-1 whitespace-nowrap text-[clamp(1.5rem,7.2vw,2rem)] font-bold leading-tight text-foreground">
            {fecha}
          </p>
          <p className="whitespace-nowrap text-[clamp(1.5rem,7.2vw,2rem)] font-bold leading-tight text-foreground">
            {hora}
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-foreground">{LUGAR_CITA}</p>
          <p className="mt-2 inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-1 text-base font-semibold text-foreground">
            {faltan}
          </p>

          <div aria-live="polite">
            {respuesta.asistencia === "confirmado" && (
              <p className="mt-2 border-l-[3px] border-l-clinico-verde bg-muted/40 p-2 text-base font-bold text-foreground">
                Gracias. Los esperamos el {fecha.toLowerCase()} a las {hora}.
              </p>
            )}
            {respuesta.asistencia === "no_asistira" && (
              <p className="mt-2 border-l-[3px] border-l-clinico-ambar bg-muted/40 p-2 text-base font-bold text-foreground">
                Listo. Avisamos al equipo de {nino} para reprogramar.
              </p>
            )}
          </div>
        </section>

        {/* c) Secciones colapsadas */}
        <div ref={acordeonRef}>
          <Accordion
            type="single"
            collapsible
            value={seccionAbierta}
            onValueChange={setSeccionAbierta}
          >
            <AccordionItem value="alarma">
              <AccordionTrigger className={DISPARADOR}>
                <span className="min-w-0">
                  <span className="block">Señales de alarma</span>
                  <span className="block truncate text-[0.9375rem] font-semibold text-muted-foreground">
                    Fiebre, sangrado, dificultad para respirar
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="grid gap-2 border-l-[3px] border-l-clinico-rojo pl-3">
                  {SENALES_DE_ALARMA.map((senal) => (
                    <li key={senal} className="text-lg font-semibold text-foreground">
                      {senal}
                    </li>
                  ))}
                </ul>
                <div aria-live="polite">
                  {respuesta.fiebreReportada ? (
                    <p className="mt-3 border-l-[3px] border-l-clinico-rojo bg-muted/40 p-3 text-lg font-bold text-foreground">
                      Reportado. El equipo de {nino} ya fue avisado.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        reportarFiebre(paciente.id);
                        setConfirmacion(`Avisamos al equipo de ${nino} que tiene fiebre.`);
                      }}
                      className={`${BOTON_GRANDE} mt-3 bg-clinico-rojo text-primary-foreground`}
                    >
                      <Thermometer aria-hidden="true" className="size-6 shrink-0" />
                      Reportar fiebre
                    </button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="llevar">
              <AccordionTrigger className={DISPARADOR}>
                <span className="min-w-0">
                  <span className="block">Qué llevar a la cita</span>
                  <span className="block truncate text-[0.9375rem] font-semibold text-muted-foreground">
                    DNI, SIS y análisis
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="grid gap-2">
                  {COSAS_QUE_LLEVAR.map((cosa) => (
                    <li key={cosa} className="text-lg font-semibold text-foreground">
                      {cosa}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="equipo">
              <AccordionTrigger className={DISPARADOR}>
                <span className="min-w-0">
                  <span className="block">Su equipo médico</span>
                  <span className="block truncate text-[0.9375rem] font-semibold text-muted-foreground">
                    {principal?.nombre ?? "Por asignar"}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-lg text-foreground">
                  Médico principal:{" "}
                  <span className="font-bold">{principal?.nombre ?? "Por asignar"}</span>
                </p>
                <p className="mt-1 text-lg text-foreground">
                  Médico de apoyo:{" "}
                  <span className="font-bold">{soporte?.nombre ?? "Por asignar"}</span>
                </p>
                <a
                  href={`tel:${TELEFONO_EQUIPO.replace(/[^0-9]/g, "")}`}
                  className={`${BOTON_GRANDE} mt-3 bg-primary text-primary-foreground`}
                >
                  <Phone aria-hidden="true" className="size-6 shrink-0" />
                  Llamar al equipo
                </a>
                <p className="mt-2 text-[1.0625rem] text-foreground">
                  Central de citas: {TELEFONO_EQUIPO}. Lunes a viernes, 8:00 a. m. a 4:00 p. m.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="calendario">
              <AccordionTrigger className={DISPARADOR}>
                <span className="min-w-0">
                  <span className="block">Calendario del tratamiento</span>
                  <span className="block truncate text-[0.9375rem] font-semibold text-muted-foreground">
                    {totalSesiones} sesiones en total
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CalendarioTratamiento paciente={paciente} sinTitulo />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="avisos">
              <AccordionTrigger className={DISPARADOR}>
                <span className="min-w-0">
                  <span className="block">Avisos por mensaje de texto</span>
                  <span className="block truncate text-[0.9375rem] font-semibold text-muted-foreground">
                    Recordatorios al celular
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-lg text-foreground">
                  El equipo le envía un mensaje de texto con la fecha y la hora de cada cita, aunque
                  no tenga internet. Puede responder SI o NO a ese mensaje.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* c + d) Barra fija: emergencia y acciones */}
      <div className="pb-segura fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-card">
        <div className="mx-auto w-full max-w-[480px] px-3 py-2">
          <div className="flex items-center justify-between gap-2 border-l-[3px] border-l-clinico-rojo pl-2">
            <p className="min-w-0 truncate text-[0.9375rem] font-bold text-foreground">
              ¿Fiebre de 38 °C o más? Vaya a emergencia
            </p>
            <button
              type="button"
              onClick={() => abrirSeccion("alarma")}
              className="shrink-0 text-[0.9375rem] font-bold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ver señales
            </button>
          </div>

          {sinResponder ? (
            <>
              <p className="mt-2 text-[0.9375rem] font-bold text-foreground">¿Podrán venir?</p>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    confirmarAsistencia(paciente.id);
                    setConfirmacion(`Los esperamos el ${fecha.toLowerCase()} a las ${hora}.`);
                  }}
                  className={`${BOTON_GRANDE} bg-clinico-verde text-primary-foreground`}
                >
                  <Check aria-hidden="true" className="size-6 shrink-0" />
                  Sí, iremos
                </button>
                <button
                  type="button"
                  onClick={() => setEligiendoMotivo(true)}
                  className={`${BOTON_GRANDE} border-2 border-foreground bg-card text-foreground`}
                >
                  No podremos
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-[1.0625rem] font-semibold text-foreground">
              {respuesta.asistencia === "confirmado"
                ? "Asistencia confirmada."
                : "Aviso enviado al equipo."}{" "}
              Para cambiarlo, llame al {TELEFONO_EQUIPO}.
            </p>
          )}
        </div>
      </div>

      {/* Hoja inferior para elegir el motivo */}
      <Sheet open={eligiendoMotivo} onOpenChange={setEligiendoMotivo}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-6 pt-5">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-bold text-foreground">
              ¿Cuál es el motivo?
            </SheetTitle>
          </SheetHeader>
          <div className="mx-auto mt-3 grid w-full max-w-[480px] gap-3">
            {MOTIVOS_CANCELACION.map((motivo) => (
              <button
                key={motivo}
                type="button"
                onClick={() => {
                  cancelarAsistencia(paciente.id, motivo);
                  setEligiendoMotivo(false);
                  setConfirmacion(`Avisamos al equipo de ${nino}. Se comunicarán para reprogramar.`);
                }}
                className={`${BOTON_GRANDE} border-2 border-foreground bg-card text-foreground`}
              >
                {motivo === "El paciente está enfermo" ? `${nino} está enfermo` : motivo}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEligiendoMotivo(false)}
              className="min-h-14 text-lg font-bold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Volver
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmación a pantalla completa */}
      {confirmacion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmación"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-card px-6 text-center"
        >
          <span className="flex size-28 items-center justify-center rounded-full bg-clinico-verde">
            <Check aria-hidden="true" className="size-16 text-primary-foreground" />
          </span>
          <p className="text-[1.25rem] font-bold leading-snug text-foreground">{confirmacion}</p>
          <button
            type="button"
            autoFocus
            onClick={() => setConfirmacion(null)}
            className={`${BOTON_GRANDE} max-w-[420px] bg-primary text-primary-foreground`}
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
