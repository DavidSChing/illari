import type { NivelSemaforo, Paciente } from "@/data/tipos";

/**
 * Motor de programación por prioridad clínica.
 *
 * El orden NO significa gravedad ni urgencia de tratamiento: significa quién no
 * debe esperar. La plataforma solo PROPONE una programación; la confirmación y
 * toda decisión clínica corresponden al equipo asistencial.
 */

/** Nivel de alerta asociado a cada alerta registrada. */
export const NIVEL_POR_ALERTA: Record<string, NivelSemaforo> = {
  Neutropenia: "rojo",
  "Fiebre reportada por la familia": "rojo",
  "Faltó a control previo": "ambar",
  "Riesgo social alto": "ambar",
};

/** Nivel más severo entre las alertas del paciente. Sin alertas, verde. */
export function nivelAlerta(alertas: string[]): NivelSemaforo {
  const niveles = alertas.map((alerta) => NIVEL_POR_ALERTA[alerta] ?? "ambar");
  if (niveles.includes("rojo")) return "rojo";
  if (niveles.includes("ambar")) return "ambar";
  return "verde";
}

export const ETIQUETA_NIVEL: Record<NivelSemaforo, string> = {
  rojo: "Alerta roja",
  ambar: "Alerta ámbar",
  verde: "Sin alertas",
};

export interface PacienteProgramable {
  id: string;
  nombre: string;
  nivel: NivelSemaforo;
  /** AAAA-MM-DD o AAAA-MM-DDTHH:mm. Cadena vacía si no se conoce. */
  fechaDiagnostico: string;
  horasDeViaje: number;
}

export interface EntradaCola {
  orden: number;
  grupo: 1 | 2 | 3;
  paciente: PacienteProgramable;
  /** El equipo asistencial fijó a este paciente en su bloque. */
  fijado?: boolean;
}

export interface BloqueProgramado {
  indice: number;
  hora: string;
  entradas: EntradaCola[];
}

/** Ajustes manuales hechos por el equipo asistencial sobre la propuesta. */
export interface AjustesManuales {
  /** pacienteId -> índice de bloque en el que queda fijado. */
  fijados?: Record<string, number>;
  /** pacienteId -> motivo de exclusión. */
  excluidos?: Record<string, string>;
}

export interface OpcionesProgramacion {
  /** Sillones disponibles por bloque. */
  capacidadPorBloque?: number;
  /** Hora del primer bloque, formato HH:mm. */
  horaInicio?: string;
  /** Separación entre bloques, en horas. */
  intervaloBloques?: number;
  /** Ajustes manuales que el motor debe respetar. */
  ajustes?: AjustesManuales;
}

export interface ResultadoProgramacion {
  cola: EntradaCola[];
  bloques: BloqueProgramado[];
  /** Pacientes dejados fuera de la programación por el equipo. */
  excluidos: { paciente: PacienteProgramable; motivo: string }[];
  /** Hora estimada de término del último bloque. */
  horaTermino: string;
  opciones: Required<Omit<OpcionesProgramacion, "ajustes">> & { ajustes: AjustesManuales };
}


export const OPCIONES_POR_DEFECTO: Required<OpcionesProgramacion> = {
  capacidadPorBloque: 9,
  horaInicio: "08:00",
  intervaloBloques: 2,
};

const GRUPO_POR_NIVEL: Record<NivelSemaforo, 1 | 2 | 3> = { rojo: 1, ambar: 2, verde: 3 };

function aMinutos(hora: string): number {
  const [h = "0", m = "0"] = hora.split(":");
  return Number(h) * 60 + Number(m);
}

function aTexto(minutos: number): string {
  const total = ((minutos % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Convierte un paciente del dominio en una entrada programable. */
export function aProgramable(paciente: Paciente): PacienteProgramable {
  return {
    id: paciente.id,
    nombre: paciente.nombre,
    nivel: nivelAlerta(paciente.alertas),
    fechaDiagnostico: paciente.fechaDiagnostico ?? "",
    horasDeViaje: paciente.horasDeViaje,
  };
}

/**
 * Función pura: ordena la cola por prioridad y la reparte en bloques.
 * Paso 1 agrupa por nivel, paso 2 ordena por fecha de diagnóstico ascendente
 * (empate: horas de viaje descendente), paso 3 concatena, paso 4 parte en
 * bloques completos y paso 5 asigna horas.
 */
export function programarCitas(
  pacientes: PacienteProgramable[],
  opciones: OpcionesProgramacion = {},
): ResultadoProgramacion {
  const config: Required<OpcionesProgramacion> = { ...OPCIONES_POR_DEFECTO, ...opciones };
  const capacidad = Math.max(1, Math.floor(config.capacidadPorBloque));

  const porGrupo = (grupo: 1 | 2 | 3) =>
    pacientes
      .filter((paciente) => GRUPO_POR_NIVEL[paciente.nivel] === grupo)
      .slice()
      .sort((a, b) => {
        if (a.fechaDiagnostico !== b.fechaDiagnostico) {
          return a.fechaDiagnostico < b.fechaDiagnostico ? -1 : 1;
        }
        return b.horasDeViaje - a.horasDeViaje;
      });

  const cola: EntradaCola[] = [];
  ([1, 2, 3] as const).forEach((grupo) => {
    porGrupo(grupo).forEach((paciente) => {
      cola.push({ orden: cola.length + 1, grupo, paciente });
    });
  });

  const bloques: BloqueProgramado[] = [];
  const inicio = aMinutos(config.horaInicio);
  for (let i = 0; i * capacidad < cola.length; i += 1) {
    bloques.push({
      indice: i,
      hora: aTexto(inicio + i * config.intervaloBloques * 60),
      entradas: cola.slice(i * capacidad, (i + 1) * capacidad),
    });
  }

  const horaTermino = aTexto(inicio + bloques.length * config.intervaloBloques * 60);

  return { cola, bloques, horaTermino, opciones: config };
}

/** Cantidad de pacientes de cada grupo dentro de un bloque. */
export function composicionBloque(bloque: BloqueProgramado): Record<NivelSemaforo, number> {
  const conteo: Record<NivelSemaforo, number> = { rojo: 0, ambar: 0, verde: 0 };
  bloque.entradas.forEach((entrada) => {
    conteo[entrada.paciente.nivel] += 1;
  });
  return conteo;
}

export interface FranjaOcupacion {
  hora: string;
  pacientes: number;
}

export interface ResumenOcupacion {
  franjas: FranjaOcupacion[];
  /** Mayor número de pacientes citados en una misma franja. */
  ocupacionMaxima: number;
  /** Franjas de la jornada con al menos un sillón sin usar. */
  franjasConVacios: number;
  /** Hora en que termina de atenderse al último paciente. */
  horaTermino: string;
}

/**
 * Reparte un total de pacientes entre franjas según pesos, con el método del
 * resto mayor para que la suma sea exacta. Función pura.
 */
export function repartirPorPesos(total: number, pesos: number[]): number[] {
  const suma = pesos.reduce((acumulado, peso) => acumulado + peso, 0) || 1;
  const exactos = pesos.map((peso) => (total * peso) / suma);
  const base = exactos.map((valor) => Math.floor(valor));
  let restante = total - base.reduce((acumulado, valor) => acumulado + valor, 0);

  const porResto = exactos
    .map((valor, indice) => ({ indice, resto: valor - Math.floor(valor) }))
    .sort((a, b) => b.resto - a.resto);

  for (let i = 0; restante > 0 && i < porResto.length; i += 1) {
    const indice = porResto[i]!.indice;
    base[indice] = (base[indice] ?? 0) + 1;
    restante -= 1;
  }
  return base;
}

/**
 * Ocupación de la programación actual: las citas llegan concentradas y lo que
 * excede la capacidad se arrastra a la franja siguiente como espera.
 */
export function ocupacionActual(
  total: number,
  capacidad: number,
  franjas: readonly string[],
  pesos: number[],
  duracionFranja = 1,
): ResumenOcupacion {
  const reparto = repartirPorPesos(total, pesos.slice(0, franjas.length));
  const detalle: FranjaOcupacion[] = franjas.map((hora, indice) => ({
    hora,
    pacientes: reparto[indice] ?? 0,
  }));

  const cap = Math.max(1, Math.floor(capacidad));
  let cola = 0;
  let ultimaConAtencion = -1;
  detalle.forEach((franja, indice) => {
    cola += franja.pacientes;
    if (cola > 0) ultimaConAtencion = indice;
    cola = Math.max(0, cola - cap);
  });

  const minutosFin =
    ultimaConAtencion < 0
      ? aMinutos(franjas[0] ?? "08:00")
      : aMinutos(franjas[ultimaConAtencion]!) +
        (1 + Math.ceil(cola / cap)) * duracionFranja * 60;

  const usadas = detalle.filter((franja) => franja.pacientes > 0);

  return {
    franjas: detalle,
    ocupacionMaxima: detalle.reduce((maximo, franja) => Math.max(maximo, franja.pacientes), 0),
    franjasConVacios: usadas.filter((franja) => franja.pacientes < cap).length,
    horaTermino: aTexto(minutosFin),
  };
}

/** Ocupación resultante del motor de programación. */
export function ocupacionSugerida(resultado: ResultadoProgramacion): ResumenOcupacion {
  const capacidad = resultado.opciones.capacidadPorBloque;
  const franjas: FranjaOcupacion[] = resultado.bloques.map((bloque) => ({
    hora: bloque.hora,
    pacientes: bloque.entradas.length,
  }));

  return {
    franjas,
    ocupacionMaxima: franjas.reduce((maximo, franja) => Math.max(maximo, franja.pacientes), 0),
    franjasConVacios: franjas.filter((franja) => franja.pacientes < capacidad).length,
    horaTermino: resultado.horaTermino,
  };
}
