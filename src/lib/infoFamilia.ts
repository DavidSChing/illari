import { citasDeHoy } from "@/data/agenda";
import type { Fase, Paciente } from "@/data/tipos";
import { formatearFecha } from "@/lib/formato";

export function citaDelPaciente(pacienteId: string): { hora: string; motivo: string } | undefined {
  return citasDeHoy.find((cita) => cita.pacienteId === pacienteId);
}

export function faseEnPalabras(fase: Fase): string {
  const mapa: Record<Fase, string> = {
    Inducción: "Inicio del tratamiento (inducción)",
    Consolidación: "Refuerzo del tratamiento (consolidación)",
    Intensificación: "Etapa intensa (intensificación)",
    Mantenimiento: "Mantenimiento a largo plazo",
  };
  return mapa[fase];
}

export function cosasParaLlevar(fase: Fase): string[] {
  const base = [
    "DNI o carnet del paciente",
    "Copia del carnet de seguro (SIS/EsSalud)",
    "Frasco de agua",
  ];
  const porFase: Record<Fase, string[]> = {
    Inducción: ["Ropa de cambio", "Medicamentos que toma en casa", "Abrigo"],
    Consolidación: ["Ropa cómoda", "Abrigo", "Algo ligero para comer si espera"],
    Intensificación: ["Mantita", "Abrigo", "Medicamentos que toma en casa"],
    Mantenimiento: ["Resultados de laboratorio recientes", "Recetas vigentes", "Abrigo"],
  };
  return [...base, ...porFase[fase]];
}

export function senalesDeAlarma(paciente: Paciente): string[] {
  const base = [
    "Fiebre o sensación de mucho calor, aunque sea leve",
    "Moretones o sangrado de nariz o encías sin golpe previo",
    "Dolor de cabeza muy fuerte o que no cede",
    "Vómitos que no se detienen",
    "Dificultad para respirar o cansancio extremo",
  ];

  const extras: string[] = [];

  if (paciente.alertas.includes("Neutropenia")) {
    extras.push("Fiebre o escalofríos: acuda a emergencias de inmediato");
  }
  if (paciente.alertas.includes("Fiebre reportada por la familia")) {
    extras.push("Si aún tiene fiebre, vaya hoy a emergencias");
  }
  if (paciente.alertas.includes("Faltó a control previo")) {
    extras.push("Si no puede llegar a esta cita, avise con anticipación");
  }
  if (paciente.alertas.includes("Riesgo social alto")) {
    extras.push("Si no tiene cómo viajar o alojarse, llame cuanto antes");
  }

  return extras.length > 0 ? [...extras, ...base] : base;
}

export function numeroContacto(): string {
  return "(01) 619-1234";
}

export function resumenSms(paciente: Paciente): string {
  const cita = citaDelPaciente(paciente.id);
  const fecha = formatearFecha(paciente.fechaProximaCita);
  const hora = cita?.hora ?? "hora por confirmar";
  const fase = faseEnPalabras(paciente.fase);
  const ciclo = `ciclo ${paciente.cicloActual} de ${paciente.ciclosTotales}`;
  const alertas = paciente.alertas.filter(
    (a) => a === "Neutropenia" || a === "Fiebre reportada por la familia",
  );
  const alerta = alertas.length > 0 ? " Si fiebre, vaya a emergencias." : "";

  const maxBase = 160;
  let mensaje = `Cita de ${paciente.nombre}: ${fecha} ${hora}. ${fase}, ${ciclo}. Lleve DNI, seguro y agua.${alerta} INSN SB`;

  if (mensaje.length > maxBase) {
    mensaje = `Cita ${paciente.nombre.split(" ")[0]}: ${fecha} ${hora}. ${paciente.fase}, ${ciclo}.${alerta} INSN SB`;
  }
  if (mensaje.length > maxBase) {
    mensaje = mensaje.slice(0, maxBase - 1) + "…";
  }

  return mensaje;
}
