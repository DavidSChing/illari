/** Formatea "2026-08-14" como "14 ago 2026" en español (Perú). */
export function formatearFecha(iso: string): string {
  if (!iso) return "No registrada";
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia) return iso;
  return new Date(anio, mes - 1, dia).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function diasDesde(iso: string, hoy = new Date()): number {
  const [anio, mes, dia] = iso.split("-").map(Number);
  if (!anio || !mes || !dia) return 0;
  const fecha = new Date(anio, mes - 1, dia);
  return Math.round((hoy.getTime() - fecha.getTime()) / 86400000);
}

