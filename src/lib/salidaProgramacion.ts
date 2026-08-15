import { ETIQUETA_NIVEL, type BloqueProgramado } from "@/lib/programacion";
import { formatearFecha } from "@/lib/formato";

/**
 * Salidas de la programación: texto para pegar en Excel y vista previa de los
 * mensajes a familias. Nada de esto envía información: solo la muestra.
 */

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

/** Texto del SMS que se le mostraría a la familia. No se envía nada. */
export function mensajeFamilia(fechaIso: string, hora: string): string {
  return `INSN: cita de quimioterapia el ${formatearFecha(fechaIso)} a las ${hora}. Clinica de dia p3. Lleve DNI y SIS. Responda SI para confirmar.`;
}

export interface MensajePrograma {
  pacienteId: string;
  nombre: string;
  hora: string;
  texto: string;
}

export function mensajesDeProgramacion(
  bloques: BloqueProgramado[],
  fechaPorPaciente: (pacienteId: string) => string,
): MensajePrograma[] {
  return bloques.flatMap((bloque) =>
    bloque.entradas.map((entrada) => ({
      pacienteId: entrada.paciente.id,
      nombre: entrada.paciente.nombre,
      hora: bloque.hora,
      texto: mensajeFamilia(fechaPorPaciente(entrada.paciente.id), bloque.hora),
    })),
  );
}
