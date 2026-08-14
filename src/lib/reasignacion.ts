import type { Medico, Paciente } from "@/data/tipos";

export interface SugerenciaReasignacion {
  pacienteId: string;
  pacienteNombre: string;
  deMedicoId: string;
  aMedicoId: string;
  motivo: string;
}

export const conteoPorMedico = (pacientes: Paciente[], medicos: Medico[]): Record<string, number> => {
  const conteo: Record<string, number> = {};
  for (const medico of medicos) conteo[medico.id] = 0;
  for (const paciente of pacientes) {
    if (paciente.medicoPrincipalId in conteo) conteo[paciente.medicoPrincipalId] += 1;
  }
  return conteo;
};

export const dispersionCarga = (conteo: Record<string, number>): number => {
  const valores = Object.values(conteo);
  if (valores.length === 0) return 0;
  return Math.max(...valores) - Math.min(...valores);
};

/**
 * Sugerencias de reasignación puramente indicativas: mueven pacientes del médico
 * con más carga al de menos, priorizando a quien ya es médico de soporte del paciente.
 * El sistema muestra; la decisión final es del equipo médico.
 */
export const calcularSugerencias = (
  pacientes: Paciente[],
  medicos: Medico[],
): SugerenciaReasignacion[] => {
  const conteo = { ...conteoPorMedico(pacientes, medicos) };
  const asignacion = new Map(pacientes.map((p) => [p.id, p.medicoPrincipalId]));
  const sugerencias: SugerenciaReasignacion[] = [];
  const yaMovidos = new Set<string>();

  for (let intento = 0; intento < 20; intento += 1) {
    const ids = medicos.map((m) => m.id);
    const mayor = ids.reduce((a, b) => (conteo[a] >= conteo[b] ? a : b));
    const menor = ids.reduce((a, b) => (conteo[a] <= conteo[b] ? a : b));
    if (conteo[mayor] - conteo[menor] <= 1) break;

    const candidatos = pacientes.filter(
      (p) => asignacion.get(p.id) === mayor && !yaMovidos.has(p.id),
    );
    if (candidatos.length === 0) break;

    const elegido =
      candidatos.find((p) => p.medicoSoporteId === menor) ??
      candidatos.find((p) => p.atendidoUltimaVezPorId === menor) ??
      candidatos[0];

    const motivo =
      elegido.medicoSoporteId === menor
        ? "Ya es su médico de soporte: continuidad conservada."
        : elegido.atendidoUltimaVezPorId === menor
          ? "Fue quien lo atendió la última vez."
          : "Equilibra la carga sin alterar la fase de tratamiento.";

    sugerencias.push({
      pacienteId: elegido.id,
      pacienteNombre: elegido.nombre,
      deMedicoId: mayor,
      aMedicoId: menor,
      motivo,
    });

    yaMovidos.add(elegido.id);
    asignacion.set(elegido.id, menor);
    conteo[mayor] -= 1;
    conteo[menor] += 1;
  }

  return sugerencias;
};
