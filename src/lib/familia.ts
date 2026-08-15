import { citasDeHoy, fechaJornada } from "@/data/agenda";
import type { Paciente } from "@/data/tipos";

/** Días entre sesiones del esquema (valor sintético del prototipo). */
export const DIAS_ENTRE_SESIONES = 21;

export const LUGAR_CITA = "Clínica de día, piso 3";

export function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.split(" ")[0] ?? nombreCompleto;
}

function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio ?? 2026, (mes ?? 1) - 1, dia ?? 1);
}

function aIso(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, "0");
  const dia = `${fecha.getDate()}`.padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "2026-08-26" → "Miércoles 26 de agosto" */
export function fechaEnPalabras(iso: string): string {
  return conMayuscula(
    aFecha(iso).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }),
  );
}

/** "2026-08-26" → "Mié 26 de agosto" (una sola línea corta) */
export function fechaCortaEnPalabras(iso: string): string {
  const fecha = aFecha(iso);
  const dia = conMayuscula(
    fecha.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", ""),
  );
  const mes = fecha.toLocaleDateString("es-PE", { month: "long" });
  return `${dia} ${fecha.getDate()} de ${mes}`;
}

/** "2026-08-26" → "mié. 26/08" */
export function fechaCorta(iso: string): string {
  const fecha = aFecha(iso);
  const dia = `${fecha.getDate()}`.padStart(2, "0");
  const mes = `${fecha.getMonth() + 1}`.padStart(2, "0");
  return `${dia}/${mes}`;
}

/** "09:00" → "9:00 a. m." */
export function horaEnPalabras(hora24: string): string {
  const [h, m] = hora24.split(":").map(Number);
  if (h === undefined || m === undefined) return hora24;
  const sufijo = h < 12 ? "a. m." : "p. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${`${m}`.padStart(2, "0")} ${sufijo}`;
}

export function horaDeLaCita(pacienteId: string): string {
  const cita = citasDeHoy.find((item) => item.pacienteId === pacienteId);
  return cita ? horaEnPalabras(cita.hora) : "9:00 a. m.";
}

export function diasFaltantes(iso: string, hoyIso: string = fechaJornada): number {
  return Math.round((aFecha(iso).getTime() - aFecha(hoyIso).getTime()) / 86400000);
}

export function cuentaRegresiva(iso: string, hoyIso: string = fechaJornada): string {
  const dias = diasFaltantes(iso, hoyIso);
  if (dias === 0) return "Es hoy";
  if (dias === 1) return "Falta 1 día";
  if (dias < 0) return "Fecha ya pasada";
  return `Faltan ${dias} días`;
}

export type EstadoSesion = "realizada" | "proxima" | "estimada";

export interface SesionCalendario {
  numero: number;
  iso: string;
  estado: EstadoSesion;
  detalle: string;
}

/** Calendario completo de sesiones, calculado a partir de la sesión actual. */
export function calendarioSesiones(paciente: Paciente): SesionCalendario[] {
  const base = aFecha(paciente.fechaProximaCita);
  const total = paciente.ciclosTotales ?? paciente.cicloActual;
  return Array.from({ length: Math.max(total, 1) }, (_, indice) => {
    const numero = indice + 1;
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + (numero - paciente.cicloActual) * DIAS_ENTRE_SESIONES);
    const estado: EstadoSesion =
      numero < paciente.cicloActual ? "realizada" : numero === paciente.cicloActual ? "proxima" : "estimada";
    const detalle =
      estado === "realizada"
        ? `Sesión ${numero}: ya realizada. Recibió su tratamiento y control de sangre.`
        : estado === "proxima"
          ? `Sesión ${numero}: su próxima cita. Control de sangre y tratamiento del día.`
          : `Sesión ${numero}: fecha estimada. El equipo puede moverla según cómo esté ${primerNombre(paciente.nombre)}.`;
    return { numero, iso: aIso(fecha), estado, detalle };
  });
}

export function inicioDeMes(iso: string): string {
  const fecha = aFecha(iso);
  return aIso(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
}

export function moverMeses(isoInicioMes: string, cantidad: number): string {
  const fecha = aFecha(isoInicioMes);
  return aIso(new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1));
}

export function nombreDelMes(isoInicioMes: string): string {
  return conMayuscula(
    aFecha(isoInicioMes).toLocaleDateString("es-PE", { month: "long", year: "numeric" }),
  );
}

export interface CeldaCalendario {
  iso: string;
  dia: number;
  delMes: boolean;
}

/** Cuadrícula de 6 semanas que empieza en lunes. */
export function cuadriculaDelMes(isoInicioMes: string): CeldaCalendario[] {
  const primero = aFecha(isoInicioMes);
  const desplazamiento = (primero.getDay() + 6) % 7; // lunes = 0
  const inicio = new Date(primero);
  inicio.setDate(primero.getDate() - desplazamiento);

  return Array.from({ length: 42 }, (_, indice) => {
    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + indice);
    return {
      iso: aIso(fecha),
      dia: fecha.getDate(),
      delMes: fecha.getMonth() === primero.getMonth(),
    };
  });
}

/** Mensaje de 160 caracteres para familias sin internet. */
export function mensajeSms(paciente: Paciente): string {
  const nombre = primerNombre(paciente.nombre);
  const fecha = fechaCorta(paciente.fechaProximaCita);
  const dia = aFecha(paciente.fechaProximaCita)
    .toLocaleDateString("es-PE", { weekday: "long" })
    .replace("é", "e")
    .replace("á", "a");
  const hora = horaDeLaCita(paciente.id).replace(":00 a. m.", "am").replace(":00 p. m.", "pm");
  const completo = `INSN: ${nombre} tiene cita el ${dia} ${fecha}, ${hora}, Clinica de dia p3. Lleve DNI y SIS. Responda SI para confirmar o NO si no podra ir.`;
  if (completo.length <= 160) return completo;
  return `INSN: ${nombre} tiene cita ${fecha} ${hora}, Clinica de dia p3. Lleve DNI y SIS. Responda SI o NO.`;
}

export const MOTIVOS_CANCELACION = [
  "No tengo cómo viajar",
  "El paciente está enfermo",
  "Otro motivo",
] as const;

export const COSAS_QUE_LLEVAR = [
  "DNI del niño",
  "Carné del SIS",
  "Resultados de los últimos análisis",
  "Algo de comer para la espera",
] as const;

export const SENALES_DE_ALARMA = [
  "Fiebre de 38 °C o más",
  "Sangrado que no para",
  "Dificultad para respirar",
  "Decaimiento extremo, no se levanta ni responde bien",
] as const;

export const TELEFONO_EQUIPO = "(01) 619-1234";
