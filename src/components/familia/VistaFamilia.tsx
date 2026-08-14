import { useState } from "react";
import {
  AlertTriangle,
  Backpack,
  Calendar,
  Check,
  Clock,
  CreditCard,
  FileText,
  IdCard,
  MapPin,
  Phone,
  Smartphone,
  Thermometer,
  Users,
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

const ICONOS_LLEVAR = [IdCard, CreditCard, FileText, Backpack];

const BOTON_GRANDE =
  "flex min-h-14 w-full items-center justify-center gap-2 rounded-lg px-4 text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function VistaFamilia({ paciente }: { paciente: Paciente }) {
  const { respuestaFamilia, confirmarAsistencia, cancelarAsistencia, reportarFiebre } =
    useEstadoClinico();
  const respuesta = respuestaFamilia(paciente.id);
  const [eligiendoMotivo, setEligiendoMotivo] = useState(false);

  const responsable = obtenerResponsable(paciente.id);
  const nino = primerNombre(paciente.nombre);
  const fecha = fechaEnPalabras(paciente.fechaProximaCita);
  const hora = horaDeLaCita(paciente.id);
  const faltan = cuentaRegresiva(paciente.fechaProximaCita);
  const sms = mensajeSms(paciente);
  const principal = medicos.find((medico) => medico.id === paciente.medicoPrincipalId);
  const soporte = medicos.find((medico) => medico.id === paciente.medicoSoporteId);
  const totalSesiones = paciente.ciclosTotales ?? paciente.cicloActual;
  const avance = totalSesiones > 0 ? Math.round((paciente.cicloActual / totalSesiones) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 pb-8">
      <BarraDemoFamilia pacienteId={paciente.id} />

      {/* 2. Saludo y estado */}
      <section aria-labelledby="titulo-saludo" className="rounded-lg border border-border bg-card p-4">
        <h1 id="titulo-saludo" className="text-3xl font-bold text-foreground">
          Hola, {responsable.nombre}
        </h1>
        <p className="mt-1 text-xl font-semibold text-foreground">
          {nino}, {paciente.edad} años
        </p>
        <p className="mt-3 text-2xl font-bold text-foreground">
          Van {paciente.cicloActual} de {totalSesiones} sesiones
        </p>
        <div
          role="progressbar"
          aria-valuenow={paciente.cicloActual}
          aria-valuemin={0}
          aria-valuemax={totalSesiones}
          aria-label={`Avance del tratamiento: ${paciente.cicloActual} de ${totalSesiones} sesiones`}
          className="mt-2 h-5 w-full overflow-hidden rounded-full border border-border bg-muted"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${avance}%` }} />
        </div>
      </section>

      {/* 3. Próxima cita */}
      <section
        aria-labelledby="titulo-proxima-cita"
        className="rounded-lg border-2 border-primary bg-card p-5"
      >
        <h2
          id="titulo-proxima-cita"
          className="text-base font-bold uppercase tracking-wide text-muted-foreground"
        >
          Su próxima cita
        </h2>
        <p className="mt-1 text-4xl font-bold leading-tight text-foreground">{fecha}</p>
        <p className="mt-2 inline-flex items-center gap-2 text-3xl font-bold text-foreground">
          <Clock aria-hidden="true" className="size-7 text-primary" />
          {hora}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-foreground">
          <MapPin aria-hidden="true" className="size-6 text-primary" />
          {LUGAR_CITA}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-2xl font-bold text-primary-foreground">
          <Calendar aria-hidden="true" className="size-6" />
          {faltan}
        </p>
      </section>

      {/* 4. Acción principal */}
      <section aria-labelledby="titulo-accion" className="rounded-lg border border-border bg-card p-4">
        <h2 id="titulo-accion" className="text-xl font-bold text-foreground">
          ¿Podrán venir a esta cita?
        </h2>

        <div aria-live="polite">
          {respuesta.asistencia === "confirmado" && (
            <p className="mt-3 rounded-lg border-2 border-clinico-verde bg-clinico-verde-suave p-4 text-2xl font-bold text-clinico-verde-foreground">
              Gracias. Los esperamos el {fecha.toLowerCase()} a las {hora}.
            </p>
          )}

          {respuesta.asistencia === "no_asistira" && (
            <p className="mt-3 rounded-lg border-2 border-clinico-ambar bg-clinico-ambar-suave p-4 text-2xl font-bold text-clinico-ambar-foreground">
              Listo. Avisamos al equipo de {nino}. Se comunicarán con usted para reprogramar.
            </p>
          )}
        </div>

        {respuesta.asistencia === "sin_responder" && !eligiendoMotivo && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => confirmarAsistencia(paciente.id)}
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
        )}

        {respuesta.asistencia === "sin_responder" && eligiendoMotivo && (
          <div className="mt-3">
            <p className="text-lg font-semibold text-foreground">¿Cuál es el motivo?</p>
            <div className="mt-2 grid gap-3">
              {MOTIVOS_CANCELACION.map((motivo) => (
                <button
                  key={motivo}
                  type="button"
                  onClick={() => {
                    cancelarAsistencia(paciente.id, motivo);
                    setEligiendoMotivo(false);
                  }}
                  className={`${BOTON_GRANDE} border-2 border-foreground bg-card text-foreground`}
                >
                  {motivo === "El paciente está enfermo" ? `${nino} está enfermo` : motivo}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setEligiendoMotivo(false)}
                className="min-h-12 text-lg font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {respuesta.asistencia !== "sin_responder" && (
          <p className="mt-2 text-base text-foreground">
            Si necesita cambiar su respuesta, llame al {TELEFONO_EQUIPO}.
          </p>
        )}
      </section>

      {/* 5. Señales de alarma */}
      <section
        aria-labelledby="titulo-alarma"
        className="rounded-lg border-4 border-clinico-rojo bg-clinico-rojo-suave p-4"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle aria-hidden="true" className="mt-1 size-7 shrink-0 text-clinico-rojo" />
          <h2 id="titulo-alarma" className="text-xl font-bold text-clinico-rojo-foreground">
            Vaya a emergencia de inmediato si {nino} presenta:
          </h2>
        </div>
        <ul className="mt-3 grid gap-2">
          {SENALES_DE_ALARMA.map((senal) => (
            <li
              key={senal}
              className="flex items-start gap-2 text-lg font-semibold text-clinico-rojo-foreground"
            >
              <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-full bg-clinico-rojo" />
              {senal}
            </li>
          ))}
        </ul>

        <div aria-live="polite">
          {respuesta.fiebreReportada ? (
            <p className="mt-3 rounded-lg border-2 border-clinico-rojo bg-card p-4 text-xl font-bold text-clinico-rojo-foreground">
              Reportado. El equipo de {nino} ya fue avisado.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => reportarFiebre(paciente.id)}
              className={`${BOTON_GRANDE} mt-3 bg-clinico-rojo text-primary-foreground`}
            >
              <Thermometer aria-hidden="true" className="size-6 shrink-0" />
              Reportar fiebre ahora
            </button>
          )}
        </div>
      </section>

      {/* 6. Qué llevar */}
      <section aria-labelledby="titulo-llevar" className="rounded-lg border border-border bg-card p-4">
        <h2 id="titulo-llevar" className="text-xl font-bold text-foreground">
          Qué llevar
        </h2>
        <ul className="mt-2 grid gap-3">
          {COSAS_QUE_LLEVAR.map((cosa, indice) => {
            const Icono = ICONOS_LLEVAR[indice] ?? Check;
            return (
              <li key={cosa} className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <Icono aria-hidden="true" className="size-7 shrink-0 text-primary" />
                {cosa}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 7. Su equipo */}
      <section aria-labelledby="titulo-equipo" className="rounded-lg border border-border bg-card p-4">
        <h2 id="titulo-equipo" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Users aria-hidden="true" className="size-6 text-primary" />
          Su equipo
        </h2>
        <p className="mt-2 text-lg text-foreground">
          Médico principal:{" "}
          <span className="font-bold">{principal?.nombre ?? "Por asignar"}</span>
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
        <p className="mt-2 text-base text-foreground">
          Central de citas: {TELEFONO_EQUIPO}. De lunes a viernes, 8:00 a. m. a 4:00 p. m.
        </p>
      </section>

      {/* 8. Calendario */}
      <CalendarioTratamiento paciente={paciente} />

      {/* 9. Vista SMS */}
      <section aria-labelledby="titulo-sms" className="rounded-lg border border-border bg-secondary p-4">
        <h2
          id="titulo-sms"
          className="flex items-center gap-2 text-xl font-bold text-secondary-foreground"
        >
          <Smartphone aria-hidden="true" className="size-6" />
          Cómo lo recibe una familia sin internet
        </h2>
        <div className="mx-auto mt-3 w-full max-w-xs rounded-3xl border-4 border-foreground bg-card p-3">
          <p className="text-center text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Mensaje de texto
          </p>
          <p className="mt-2 rounded-2xl bg-muted p-3 text-lg leading-snug text-foreground">{sms}</p>
          <p className="mt-2 text-center text-sm text-muted-foreground">{sms.length} / 160 caracteres</p>
        </div>
      </section>
    </div>
  );
}
