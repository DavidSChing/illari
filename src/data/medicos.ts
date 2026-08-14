import type { Medico } from "./tipos";

/** Datos sintéticos. Ningún médico real. */
export const medicos: Medico[] = [
  { id: "med-1", nombre: "Dra. Rosa Ccahuana", especialidad: "Hematología pediátrica" },
  { id: "med-2", nombre: "Dr. Julio Bendezú", especialidad: "Hematología pediátrica" },
  { id: "med-3", nombre: "Dra. Elena Ramos", especialidad: "Oncohematología" },
  { id: "med-4", nombre: "Dr. Aníbal Yupanqui", especialidad: "Hematología pediátrica" },
  { id: "med-5", nombre: "Dra. Carmen Loayza", especialidad: "Oncohematología" },
];

export const obtenerMedico = (id: string): Medico | undefined =>
  medicos.find((medico) => medico.id === id);

export const nombreMedico = (id: string): string => obtenerMedico(id)?.nombre ?? "No asignado";
