import { ETIQUETA_NIVEL, type BloqueProgramado } from "@/lib/programacion";
import { mensajeRecordatorio } from "@/lib/familia";
import type { Paciente } from "@/data/tipos";

const ENCABEZADOS = ["Hora", "Paciente", "Nivel de alerta", "Bloque"] as const;

/** Tabla en texto separada por tabulaciones, lista para pegar en Excel. */
export function tablaProgramacion(bloques: BloqueProgramado[]): string {
  const filas = bloques.flatMap((bloque) =>
    bloque.entradas.map((entrada) =>
      [
        bloque.hora,
        entrada.paciente.nombre,
        ETIQUETA_NIVEL[entrada.paciente.nivel],
        `Bloque ${bloque.indice + 1}`,
      ].join("\t"),
    ),
  );
  return [ENCABEZADOS.join("\t"), ...filas].join("\n");
}

export interface MensajePrograma {
  pacienteId: string;
  nombre: string;
  hora: string;
  texto: string;
}

/** Mismo texto que se envía de verdad desde la ficha del paciente (lib/familia.ts). */
export function mensajesDeProgramacion(
  bloques: BloqueProgramado[],
  obtenerPaciente: (pacienteId: string) => Paciente | undefined,
): MensajePrograma[] {
  return bloques.flatMap((bloque) =>
    bloque.entradas.flatMap((entrada) => {
      const paciente = obtenerPaciente(entrada.paciente.id);
      if (!paciente) return [];
      return [
        {
          pacienteId: entrada.paciente.id,
          nombre: entrada.paciente.nombre,
          hora: bloque.hora,
          texto: mensajeRecordatorio(paciente, bloque.hora),
        },
      ];
    }),
  );
}
