import { describe, expect, it } from "vitest";
import { composicionBloque, programarCitas, type PacienteProgramable } from "./programacion";

function generar(nivel: PacienteProgramable["nivel"], cantidad: number, base: number): PacienteProgramable[] {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: `${nivel}-${i}`,
    nombre: `Paciente ${nivel} ${i}`,
    nivel,
    fechaDiagnostico: `2025-01-${String(base + i).padStart(2, "0")}`,
    horasDeViaje: i % 12,
  }));
}

describe("programarCitas", () => {
  it("reparte 10 rojos, 15 ámbar y 11 verdes en cuatro bloques de 9", () => {
    const pacientes = [
      ...generar("verde", 11, 1),
      ...generar("ambar", 15, 1),
      ...generar("rojo", 10, 1),
    ];

    const { bloques, horaTermino } = programarCitas(pacientes, {
      capacidadPorBloque: 9,
      horaInicio: "08:00",
      intervaloBloques: 2,
    });

    expect(bloques.map((b) => b.hora)).toEqual(["08:00", "10:00", "12:00", "14:00"]);
    expect(composicionBloque(bloques[0]!)).toEqual({ rojo: 9, ambar: 0, verde: 0 });
    expect(composicionBloque(bloques[1]!)).toEqual({ rojo: 1, ambar: 8, verde: 0 });
    expect(composicionBloque(bloques[2]!)).toEqual({ rojo: 0, ambar: 7, verde: 2 });
    expect(composicionBloque(bloques[3]!)).toEqual({ rojo: 0, ambar: 0, verde: 9 });
    expect(horaTermino).toBe("16:00");
  });

  it("ordena por fecha de diagnóstico y desempata por horas de viaje", () => {
    const { cola } = programarCitas([
      { id: "a", nombre: "A", nivel: "rojo", fechaDiagnostico: "2025-03-01", horasDeViaje: 2 },
      { id: "b", nombre: "B", nivel: "rojo", fechaDiagnostico: "2025-01-01", horasDeViaje: 1 },
      { id: "c", nombre: "C", nivel: "rojo", fechaDiagnostico: "2025-01-01", horasDeViaje: 9 },
      { id: "d", nombre: "D", nivel: "verde", fechaDiagnostico: "2024-01-01", horasDeViaje: 5 },
    ]);

    expect(cola.map((entrada) => entrada.paciente.id)).toEqual(["c", "b", "a", "d"]);
    expect(cola.map((entrada) => entrada.orden)).toEqual([1, 2, 3, 4]);
  });

  it("no genera bloques cuando no hay pacientes", () => {
    const resultado = programarCitas([]);
    expect(resultado.bloques).toHaveLength(0);
    expect(resultado.horaTermino).toBe("08:00");
  });

  it("respeta a los pacientes fijados y excluye a los que el equipo retira", () => {
    const pacientes = [...generar("rojo", 3, 1), ...generar("verde", 3, 1)];

    const { bloques, excluidos } = programarCitas(pacientes, {
      capacidadPorBloque: 2,
      ajustes: { fijados: { "verde-0": 0 }, excluidos: { "rojo-1": "Fiebre" } },
    });

    expect(excluidos.map((e) => e.paciente.id)).toEqual(["rojo-1"]);
    expect(bloques[0]!.entradas.map((e) => e.paciente.id)).toEqual(["verde-0", "rojo-2"]);
    expect(bloques[0]!.entradas[0]!.fijado).toBe(true);
    expect(bloques.flatMap((b) => b.entradas).map((e) => e.paciente.id)).not.toContain("rojo-1");
  });
});
