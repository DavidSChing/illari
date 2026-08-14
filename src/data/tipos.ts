export type Sexo = "Femenino" | "Masculino";

export type Fase = "Inducción" | "Consolidación" | "Intensificación" | "Mantenimiento";

export type Diagnostico =
  | "Leucemia Linfoblástica Aguda"
  | "Leucemia Mieloide Aguda"
  | "Linfoma no Hodgkin"
  | "Anemia Aplásica";

export type NivelSemaforo = "rojo" | "ambar" | "verde";

export interface Procedencia {
  region: string;
  ciudad: string;
  fueraDeLima: boolean;
}

export interface Administracion {
  medicamento: string;
  dosis: string;
  fecha: string;
}

export interface Laboratorio {
  /** células por mm3 */
  neutrofilos: number;
  /** miles por mm3 */
  plaquetas: number;
  /** g/dL */
  hemoglobina: number;
  fecha: string;
}

/** Procedencia de un dato leído del Excel, para trazabilidad. */
export interface OrigenDato {
  archivo: string;
  fila: number;
  fechaCarga: string;
}

export interface Paciente {
  id: string;
  /** Número de historia clínica cuando el dato proviene del Excel. */
  hc?: string;
  nombre: string;
  /** Valor tal cual aparece en el Excel, sin normalizar. */
  nombreOriginal?: string;
  edad: number;
  sexo: Sexo;
  procedencia: Procedencia | null;
  horasDeViaje: number;
  diagnostico: string;
  protocolo: string;
  fase: Fase | null;
  cicloActual: number;
  ciclosTotales: number | null;
  fechaUltimaAtencion: string;
  fechaProximaCita: string;
  ultimaAdministracion: Administracion | null;
  laboratorio: Laboratorio | null;
  alertas: string[];
  medicoPrincipalId: string;
  medicoSoporteId: string;
  atendidoUltimaVezPorId: string;
  inasistenciasPrevias: number;
  proximoPasoSugerido: string;
  /** Verdadero cuando el paciente proviene de un Excel cargado. */
  desdeExcel?: boolean;
  origen?: OrigenDato;
  /** Días transcurridos desde la última atención registrada. */
  diasDesdeUltimaAtencion?: number;
  /** Nombres de médicos que figuran en el Excel para este paciente. */
  medicosQueLoAtendieron?: string[];
}

/** Paciente sintético con todos los campos clínicos completos. */
export type PacienteCompleto = Paciente & {
  procedencia: Procedencia;
  diagnostico: Diagnostico;
  fase: Fase;
  ciclosTotales: number;
  ultimaAdministracion: Administracion;
  laboratorio: Laboratorio;
};


export interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  hora: string;
  duracionMinutos: number;
  motivo: string;
}
