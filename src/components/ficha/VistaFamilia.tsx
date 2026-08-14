import { Calendar, Clock, MapPin, Phone, AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import { medicos, obtenerMedico } from "@/data/medicos";
import { formatearFecha } from "@/lib/formato";
import {
  citaDelPaciente,
  cosasParaLlevar,
  faseEnPalabras,
  numeroContacto,
  resumenSms,
  senalesDeAlarma,
} from "@/lib/infoFamilia";

export function VistaFamilia({ paciente }: { paciente: Paciente }) {
  const cita = citaDelPaciente(paciente.id);
  const alarma = senalesDeAlarma(paciente);
  const llevar = cosasParaLlevar(paciente.fase);
  const sms = resumenSms(paciente);
  const medicoPrincipal = obtenerMedico(paciente.medicoPrincipalId);
  const medicoSoporte = obtenerMedico(paciente.medicoSoporteId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <header className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Información para cuidadores
        </p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{paciente.nombre}</h1>
        <p className="mt-1 text-xl text-foreground">
          {paciente.edad} años · Tratamiento: {paciente.diagnostico}
        </p>
      </header>

      <section
        aria-labelledby="titulo-cita"
        className="rounded-lg border border-border bg-card p-5"
      >
        <h2 id="titulo-cita" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Próxima cita
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-bold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Calendar aria-hidden="true" className="size-6 text-primary" />
            {formatearFecha(paciente.fechaProximaCita)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden="true" className="size-6 text-primary" />
            {cita?.hora ?? "Hora por confirmar"}
          </span>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Lugar: INSN San Borja, clínica de día de hematología pediátrica.
        </p>
        {paciente.procedencia.fueraDeLima && (
          <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <MapPin aria-hidden="true" className="size-5 text-primary" />
            Viaje desde {paciente.procedencia.region}: aproximadamente {paciente.horasDeViaje} horas
          </p>
        )}
      </section>

      <section
        aria-labelledby="titulo-fase"
        className="rounded-lg border border-border bg-card p-5"
      >
        <h2 id="titulo-fase" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ¿En qué parte del tratamiento va?
        </h2>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {faseEnPalabras(paciente.fase)}
        </p>
        <p className="mt-1 text-xl text-foreground">
          Ciclo {paciente.cicloActual} de {paciente.ciclosTotales}
        </p>
      </section>

      <section
        aria-labelledby="titulo-llevar"
        className="rounded-lg border border-border bg-card p-5"
      >
        <h2 id="titulo-llevar" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ¿Qué debe llevar?
        </h2>
        <ul className="mt-2 grid gap-2">
          {llevar.map((item) => (
            <li key={item} className="flex items-start gap-2 text-lg text-foreground">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-clinico-verde" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="titulo-alarmas"
        className="rounded-lg border-2 border-clinico-rojo bg-clinico-rojo-suave p-5"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle aria-hidden="true" className="size-6 text-clinico-rojo" />
          <h2
            id="titulo-alarmas"
            className="text-lg font-bold uppercase tracking-wide text-clinico-rojo-foreground"
          >
            Señales de alarma: vaya a emergencias
          </h2>
        </div>
        <ul className="mt-2 grid gap-2">
          {alarma.map((item) => (
            <li key={item} className="flex items-start gap-2 text-lg font-semibold text-clinico-rojo-foreground">
              <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-clinico-rojo" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-base text-clinico-rojo-foreground">
          Si nota algo de esta lista, acuda al servicio de emergencias del INSN San Borja. No espere a la cita programada.
        </p>
      </section>

      <section
        aria-labelledby="titulo-contacto"
        className="rounded-lg border border-border bg-card p-5"
      >
        <h2 id="titulo-contacto" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          ¿A quién contactar?
        </h2>
        <div className="mt-2 grid gap-3">
          <p className="text-lg font-semibold text-foreground">
            Médico principal: {medicoPrincipal?.nombre ?? "No asignado"}
          </p>
          <p className="text-lg font-semibold text-foreground">
            Médico de apoyo: {medicoSoporte?.nombre ?? "No asignado"}
          </p>
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <Phone aria-hidden="true" className="size-5 text-primary" />
            Central de citas INSN San Borja: {numeroContacto()}
          </p>
          <p className="text-base text-muted-foreground">
            Llame de lunes a viernes de 8:00 a. m. a 4:00 p. m. En emergencias, acuda directamente al servicio de emergencias.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="titulo-sms"
        className="rounded-lg border border-border bg-secondary p-5"
      >
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="size-5 text-primary" />
          <h2 id="titulo-sms" className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
            Resumen para enviar por SMS
          </h2>
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          Así se vería el mensaje que recibiría la familia en un celular básico (máximo 160 caracteres):
        </p>
        <div className="mt-3 rounded-md border border-border bg-card p-4 font-sans text-lg leading-snug text-foreground">
          <p>{sms}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {sms.length} / 160 caracteres
        </p>
      </section>
    </div>
  );
}
