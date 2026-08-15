import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Phone,
  Thermometer,
} from "lucide-react";

import type { Paciente } from "@/data/tipos";
import { obtenerResponsable } from "@/data/responsables";
import { useEstadoClinico } from "@/state/EstadoClinico";
import {
  COSAS_QUE_LLEVAR,
  LUGAR_CITA,
  MOTIVOS_CANCELACION,
  SENALES_DE_ALARMA,
  TELEFONO_EQUIPO,
  cuentaRegresiva,
  fechaEnPalabras,
  horaDeLaCita,
  mensajeSms,
  primerNombre,
} from "@/lib/familia";
import { BarraDemoFamilia } from "@/components/familia/BarraDemoFamilia";
import { CalendarioTratamiento } from "@/components/familia/CalendarioTratamiento";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const BOTON_GRANDE =
  "flex min-h-14 w-full items-center justify-center gap-2 rounded-md px-4 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

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

  const responsable = obtenerResponsable(paciente.id);
  const nino = primerNombre(paciente.nombre);
  const fecha = fechaEnPalabras(paciente.fechaProximaCita);
  const hora = horaPropuesta(paciente.id) ?? horaDeLaCita(paciente.id);
  const faltan = cuentaRegresiva(paciente.fechaProximaCita);
  const sms = mensajeSms(paciente);
  const principal = medicos.find((medico) => medico.id === paciente.medicoPrincipalId);
  const soporte = medicos.find((medico) => medico.id === paciente.medicoSoporteId);
  const totalSesiones = paciente.ciclosTotales ?? paciente.cicloActual;
  const avance = totalSesiones > 0 ? Math.round((paciente.cicloActual / totalSesiones) * 100) : 0;
  const sinResponder = respuesta.asistencia === "sin_responder";

  return (
    <div className="mx-auto w-full min-w-0 max-w-[480px]">
      <div className="flex flex-col gap-8 pb-44">
        {/* 1. Franja de demostración, delgada */}
        <BarraDemoFamilia pacienteId={paciente.id} />

        {/* 2. Saludo compacto */}
        <section aria-labelledby="titulo-saludo" className="bg-card px-4 py-3">
          <h1 id="titulo-saludo" className="text-2xl font-bold text-foreground">
            Hola, {responsable.nombre}
          </h1>
          <p className="text-lg font-semibold text-foreground">
            {nino}, {paciente.edad} años
          </p>

          {/* 3. Progreso */}
          <p className="mt-2 text-lg font-bold text-foreground">
            Van {paciente.cicloActual} de {totalSesiones} sesiones
          </p>
          <div
            role="progressbar"
            aria-valuenow={paciente.cicloActual}
            aria-valuemin={0}
            aria-valuemax={totalSesiones}
            aria-label={`Avance del tratamiento: ${paciente.cicloActual} de ${totalSesiones} sesiones`}
            className="mt-1 h-4 w-full overflow-hidden rounded-full border border-border bg-muted"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${avance}%` }} />
          </div>
        </section>

        {/* 4. Próxima cita: lo más grande de la pantalla */}
        <section
          aria-labelledby="titulo-proxima-cita"
          className="rounded-md border-2 border-primary bg-card px-4 py-3"
        >
          <h2
            id="titulo-proxima-cita"
            className="text-[0.9375rem] font-bold uppercase tracking-wide text-foreground"
          >
            Su próxima cita
          </h2>
          <p className="mt-1 text-[2.125rem] font-bold leading-none text-foreground">{fecha}</p>
          <p className="mt-1 flex items-center gap-2 text-[1.75rem] font-bold text-foreground">
            {hora}
          </p>
          <p className="mt-1 flex items-start gap-2 text-lg font-semibold text-foreground">
            {LUGAR_CITA}
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xl font-bold text-primary-foreground">
            {faltan}
          </p>

          <div aria-live="polite">
            {respuesta.asistencia === "confirmado" && (
              <p className="mt-3 rounded-md border-l-[3px] border-l-clinico-verde bg-muted/40 p-3 text-lg font-bold text-foreground">
                Gracias. Los esperamos el {fecha.toLowerCase()} a las {hora}.
              </p>
            )}
            {respuesta.asistencia === "no_asistira" && (
              <p className="mt-3 rounded-md border-l-[3px] border-l-clinico-ambar bg-muted/40 p-3 text-lg font-bold text-foreground">
                Listo. Avisamos al equipo de {nino}. Se comunicarán con usted para reprogramar.
              </p>
            )}
          </div>
        </section>

        {/* 5. Señales de alarma */}
        <section
          aria-labelledby="titulo-alarma"
          className="rounded-md border-l-[3px] border-l-clinico-rojo bg-muted/40 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle aria-hidden="true" className="mt-1 size-7 shrink-0 text-clinico-rojo" />
            <h2 id="titulo-alarma" className="text-xl font-bold text-foreground">
              Vaya a emergencia de inmediato si {nino} presenta:
            </h2>
          </div>
          <ul className="mt-3 grid gap-2">
            {SENALES_DE_ALARMA.map((senal) => (
              <li
                key={senal}
                className="flex items-start gap-2 text-lg font-semibold text-foreground"
              >
                <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-clinico-rojo" />
                {senal}
              </li>
            ))}
          </ul>

          <div aria-live="polite">
            {respuesta.fiebreReportada ? (
              <p className="mt-3 rounded-md border-l-[3px] border-l-clinico-rojo bg-card p-4 text-lg font-bold text-foreground">
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
                Reportar fiebre ahora
              </button>
            )}
          </div>
        </section>

        {/* 6. Qué llevar */}
        <section aria-labelledby="titulo-llevar" className="bg-card p-4">
          <h2 id="titulo-llevar" className="text-xl font-bold text-foreground">
            Qué llevar
          </h2>
          <ul className="mt-2 grid gap-3">
            {COSAS_QUE_LLEVAR.map((cosa) => (
              <li key={cosa} className="text-lg font-semibold text-foreground">
                {cosa}
              </li>
            ))}
          </ul>
        </section>

        {/* 7. Su equipo */}
        <section aria-labelledby="titulo-equipo" className="bg-card p-4">
          <h2 id="titulo-equipo" className="flex items-center gap-2 text-xl font-bold text-foreground">
            Su equipo
          </h2>
          <p className="mt-2 text-lg text-foreground">
            Médico principal: <span className="font-bold">{principal?.nombre ?? "Por asignar"}</span>
          </p>
          <p className="mt-1 text-lg text-foreground">
            Médico de apoyo: <span className="font-bold">{soporte?.nombre ?? "Por asignar"}</span>
          </p>
          <a
            href={`tel:${TELEFONO_EQUIPO.replace(/[^0-9]/g, "")}`}
            className={`${BOTON_GRANDE} mt-3 bg-primary text-primary-foreground`}
          >
            <Phone aria-hidden="true" className="size-6 shrink-0" />
            Llamar al equipo
          </a>
          <p className="mt-2 text-[1.0625rem] text-foreground">
            Central de citas: {TELEFONO_EQUIPO}. De lunes a viernes, 8:00 a. m. a 4:00 p. m.
          </p>
        </section>

        {/* 8. Calendario */}
        <CalendarioTratamiento paciente={paciente} />

        {/* 9. Vista SMS */}
        <section aria-labelledby="titulo-sms" className="rounded-md border border-border bg-secondary p-4">
          <h2
            id="titulo-sms"
            className="flex items-center gap-2 text-xl font-bold text-secondary-foreground"
          >
            Cómo lo recibe una familia sin internet
          </h2>
          <div className="mx-auto mt-3 w-full max-w-xs rounded-3xl border-4 border-foreground bg-card p-3">
            <p className="text-center text-[0.9375rem] font-bold uppercase tracking-wide text-foreground">
              Mensaje de texto
            </p>
            <p className="mt-2 rounded-md bg-muted p-3 text-lg leading-snug text-foreground">{sms}</p>
            <p className="mt-2 text-center text-[0.9375rem] text-foreground">
              {sms.length} / 160 caracteres
            </p>
          </div>
        </section>
      </div>

      {/* Barra fija de acciones, siempre al alcance del pulgar */}
      <div className="pb-segura fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-card px-3 py-3">
        <div className="mx-auto w-full max-w-[480px]">
          {sinResponder ? (
            <>
              <p className="mb-2 text-[0.9375rem] font-bold text-foreground">
                ¿Podrán venir a esta cita?
              </p>
              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    confirmarAsistencia(paciente.id);
                    setConfirmacion(`Los esperamos el ${fecha.toLowerCase()} a las ${hora}.`);
                  }}
                  className={`${BOTON_GRANDE} bg-clinico-verde text-primary-foreground`}
                >
                  <Check aria-hidden="true" className="size-6 shrink-0" />
                  Sí, vamos a asistir
                </button>
                <button
                  type="button"
                  onClick={() => setEligiendoMotivo(true)}
                  className={`${BOTON_GRANDE} border-2 border-foreground bg-card text-foreground`}
                >
                  No podremos ir
                </button>
              </div>
            </>
          ) : (
            <p className="text-[1.0625rem] font-semibold text-foreground">
              {respuesta.asistencia === "confirmado"
                ? "Asistencia confirmada."
                : "Aviso enviado al equipo."}{" "}
              Si necesita cambiarlo, llame al {TELEFONO_EQUIPO}.
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
