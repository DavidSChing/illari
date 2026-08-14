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

export interface Paciente {
  id: string;
  nombre: string;
  edad: number;
  sexo: Sexo;
  procedencia: Procedencia;
  horasDeViaje: number;
  diagnostico: Diagnostico;
  protocolo: string;
  fase: Fase;
  cicloActual: number;
  ciclosTotales: number;
  fechaUltimaAtencion: string;
  fechaProximaCita: string;
  ultimaAdministracion: Administracion;
  laboratorio: Laboratorio;
  alertas: string[];
  medicoPrincipalId: string;
  medicoSoporteId: string;
  atendidoUltimaVezPorId: string;
  inasistenciasPrevias: number;
  proximoPasoSugerido: string;
}

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
