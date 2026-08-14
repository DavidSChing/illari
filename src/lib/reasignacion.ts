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
    if (paciente.medicoPrincipalId in conteo) {
      conteo[paciente.medicoPrincipalId] = (conteo[paciente.medicoPrincipalId] ?? 0) + 1;
    }
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
  const carga = (id: string): number => conteo[id] ?? 0;
  const asignacion = new Map(pacientes.map((p) => [p.id, p.medicoPrincipalId]));
  const sugerencias: SugerenciaReasignacion[] = [];
  const yaMovidos = new Set<string>();

  for (let intento = 0; intento < 20; intento += 1) {
    const ids = medicos.map((m) => m.id);
    if (ids.length === 0) break;
    const mayor = ids.reduce((a, b) => (carga(a) >= carga(b) ? a : b));
    const menor = ids.reduce((a, b) => (carga(a) <= carga(b) ? a : b));
    if (carga(mayor) - carga(menor) <= 1) break;

    const candidatos = pacientes.filter(
      (p) => asignacion.get(p.id) === mayor && !yaMovidos.has(p.id),
    );
    const elegido =
      candidatos.find((p) => p.medicoSoporteId === menor) ??
      candidatos.find((p) => p.atendidoUltimaVezPorId === menor) ??
      candidatos[0];
    if (!elegido) break;

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
    conteo[mayor] = carga(mayor) - 1;
    conteo[menor] = carga(menor) + 1;
  }

  return sugerencias;
};
