/** Responsables legales sintéticos. Ninguna persona real. */
export interface Responsable {
  nombre: string;
  parentesco: string;
  telefono: string;
}

const RESPONSABLES: Record<string, Responsable> = {
  "pac-01": { nombre: "Rosa", parentesco: "madre", telefono: "984 512 776" },
  "pac-02": { nombre: "Nélida", parentesco: "madre", telefono: "965 210 445" },
  "pac-03": { nombre: "Teodoro", parentesco: "abuelo", telefono: "912 447 803" },
  "pac-04": { nombre: "Marisol", parentesco: "madre", telefono: "998 336 120" },
  "pac-05": { nombre: "Édgar", parentesco: "padre", telefono: "947 802 551" },
  "pac-06": { nombre: "Yolanda", parentesco: "madre", telefono: "931 665 208" },
  "pac-07": { nombre: "Fermín", parentesco: "padre", telefono: "976 118 342" },
  "pac-08": { nombre: "Delia", parentesco: "abuela", telefono: "920 774 916" },
  "pac-09": { nombre: "Sara", parentesco: "madre", telefono: "958 301 627" },
  "pac-10": { nombre: "Isabel", parentesco: "madre", telefono: "989 542 130" },
  "pac-11": { nombre: "Walter", parentesco: "padre", telefono: "943 208 764" },
  "pac-12": { nombre: "Juana", parentesco: "madre", telefono: "917 655 402" },
};

export function obtenerResponsable(pacienteId: string): Responsable {
  return RESPONSABLES[pacienteId] ?? { nombre: "Familiar", parentesco: "apoderado", telefono: "—" };
}
