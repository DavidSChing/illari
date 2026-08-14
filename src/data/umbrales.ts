import type { Laboratorio, NivelSemaforo } from "./tipos";

export interface LecturaSemaforo {
  nivel: NivelSemaforo;
  etiqueta: string;
  valor: number;
  unidad: string;
  nombre: string;
}

/** Umbrales de semáforo clínico (criterios sintéticos para el prototipo). */
export const umbrales = {
  neutrofilos: { rojo: 500, ambar: 1000, unidad: "/mm³" },
  plaquetas: { rojo: 50, ambar: 100, unidad: "mil/mm³" },
  hemoglobina: { rojo: 8, ambar: 10, unidad: "g/dL" },
} as const;

export function nivelNeutrofilos(valor: number): LecturaSemaforo {
  const nivel: NivelSemaforo =
    valor < umbrales.neutrofilos.rojo ? "rojo" : valor <= umbrales.neutrofilos.ambar ? "ambar" : "verde";
  return {
    nivel,
    nombre: "Neutrófilos",
    valor,
    unidad: umbrales.neutrofilos.unidad,
    etiqueta: nivel === "rojo" ? "Neutropenia" : nivel === "ambar" ? "Neutrófilos en límite" : "Neutrófilos adecuados",
  };
}

export function nivelPlaquetas(valor: number): LecturaSemaforo {
  const nivel: NivelSemaforo =
    valor < umbrales.plaquetas.rojo ? "rojo" : valor <= umbrales.plaquetas.ambar ? "ambar" : "verde";
  return {
    nivel,
    nombre: "Plaquetas",
    valor,
    unidad: umbrales.plaquetas.unidad,
    etiqueta:
      nivel === "rojo" ? "Trombocitopenia" : nivel === "ambar" ? "Plaquetas en límite" : "Plaquetas adecuadas",
  };
}

export function nivelHemoglobina(valor: number): LecturaSemaforo {
  const nivel: NivelSemaforo =
    valor < umbrales.hemoglobina.rojo ? "rojo" : valor <= umbrales.hemoglobina.ambar ? "ambar" : "verde";
  return {
    nivel,
    nombre: "Hemoglobina",
    valor,
    unidad: umbrales.hemoglobina.unidad,
    etiqueta: nivel === "rojo" ? "Anemia severa" : nivel === "ambar" ? "Anemia leve" : "Hemoglobina adecuada",
  };
}

export function lecturasLaboratorio(laboratorio: Laboratorio): LecturaSemaforo[] {
  return [
    nivelNeutrofilos(laboratorio.neutrofilos),
    nivelPlaquetas(laboratorio.plaquetas),
    nivelHemoglobina(laboratorio.hemoglobina),
  ];
}

/** Nivel más severo entre las tres lecturas. */
export function nivelGlobal(laboratorio: Laboratorio): NivelSemaforo {
  const niveles = lecturasLaboratorio(laboratorio).map((lectura) => lectura.nivel);
  if (niveles.includes("rojo")) return "rojo";
  if (niveles.includes("ambar")) return "ambar";
  return "verde";
}
