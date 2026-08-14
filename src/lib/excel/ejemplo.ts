/**
 * Archivo de ejemplo para la demostración: reproduce el desorden típico del Excel real
 * (filas de título, cabeceras en mayúsculas con espacios, fechas en dos formatos,
 * una fila duplicada con datos distintos y filas incompletas).
 * Datos 100% sintéticos.
 */
export const NOMBRE_EJEMPLO = "registro_citas.xlsx";

const FILAS: (string | number)[][] = [
  ["UNIDAD DE HEMATOLOGIA PEDIATRICA - INSN SAN BORJA"],
  ["REGISTRO DE CITAS - CLINICA DE DIA (uso interno)"],
  [],
  ["  N HC ", "PACIENTE", "FECHA DE ATENCION", "MEDICO QUE ATENDIO", "PROX. CITA", "HORA"],
  ["HC-1042", "MATEO QUISPE", "12/03/2026", "Dra. Rosa Ccahuana", "02/04/2026", "08:00"],
  ["HC-1042", "mateo  quispe", "02/04/2026", "Dr. Julio Bendezú", "23/04/2026", "08:00"],
  ["HC-1042", "Mateo Quispe", "23/04/2026", "Dra. Rosa Ccahuana", "14/05/2026", "08:30"],
  ["HC-1042", "Mateo Quispe", "14/05/2026", "Dra. Elena Ramos", "", "09:00"],
  ["HC-2317", "LUANA RIOS", 46082, "Dr. Julio Bendezú", 46110, "08:00"],
  ["HC-2317", "Luana Ríos", 46110, "Dr. Julio Bendezú", 46138, "08:00"],
  ["HC-2317", "Luana Rios", 46138, "Dra. Carmen Loayza", "10/08/2026", "09:30"],
  ["HC-0987", "JOAQUIN MAMANI", "05/02/2026", "Dra. Elena Ramos", "05/03/2026", "10:00"],
  ["HC-0987", "Joaquín Mamani", "05/03/2026", "Dra. Elena Ramos", "06/04/2026", "10:00"],
  ["HC-0987", "Joaquín Mamani", "05/03/2026", "Dra. Carmen Loayza", "12/04/2026", "10:00"],
  ["HC-3155", "ANDREA CHOQUE", "07/07/2026", "Dr. Aníbal Yupanqui", "28/07/2026", "11:00"],
  ["HC-3155", "Andrea Choque", "28/07/2026", "Dr. Aníbal Yupanqui", "18/08/2026", "11:00"],
  ["HC-4420", "PIERO SALAS", "03/06/2026", "Dra. Rosa Ccahuana", "24/06/2026", "08:30"],
  ["HC-4420", "Piero Salas", "24/06/2026", "", "15/07/2026", "08:30"],
  ["HC-4420", "Piero Salas", "15/07/2026", "Dra. Rosa Ccahuana", "05/08/2026", "08:30"],
  ["", "NIÑO SIN HC REGISTRADA", "20/07/2026", "Dra. Elena Ramos", "10/08/2026", "09:00"],
  ["HC-5063", "MILAGROS HUAMAN", "04/05/2026", "Dra. Carmen Loayza", "25/05/2026", "12:00"],
  ["HC-5063", "Milagros Huamán", "25/05/2026", "Dra. Carmen Loayza", "", "12:00"],
  ["HC-6781", "SEBASTIAN ÑAHUI", "01/08/2026", "Dr. Aníbal Yupanqui", "22/08/2026", "09:30"],
  ["HC-6781", "Sebastián Ñahui", "fecha por confirmar", "Dr. Aníbal Yupanqui", "22/08/2026", "09:30"],
  ["HC-7290", "CAMILA PEREZ", "06/06/2026", "Dr. Julio Bendezú", "27/06/2026", "10:30"],
  ["HC-7290", "Camila Pérez", "27/06/2026", "Dra. Rosa Ccahuana", "18/07/2026", "10:30"],
];

/** Genera y descarga el archivo de ejemplo. No sobrescribe ningún archivo existente. */
export async function descargarEjemplo(): Promise<void> {
  const XLSX = await import("xlsx");
  const hoja = XLSX.utils.aoa_to_sheet(FILAS);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "CITAS");
  XLSX.writeFile(libro, NOMBRE_EJEMPLO);
}
