/** Números sintéticos para recordatorios por mensaje de texto. Ninguna persona real. */
export interface NumeroSms {
  id: string;
  etiqueta: string;
  /** 9 dígitos sin espacios. */
  numero: string;
  activo: boolean;
}

export const ETIQUETAS_SUGERIDAS = ["Mamá", "Papá", "Abuela", "Abuelo", "Tía", "Otro"] as const;

/** Dos números precargados por paciente, iguales en toda la demostración. */
export function numerosInicialesDe(pacienteId: string): NumeroSms[] {
  return [
    { id: `${pacienteId}-sms-1`, etiqueta: "Mamá", numero: "987654321", activo: true },
    { id: `${pacienteId}-sms-2`, etiqueta: "Abuela Rosa", numero: "954321987", activo: true },
  ];
}

/** "987654321" → "987 654 321" */
export function formatearNumero(numero: string): string {
  const limpio = numero.replace(/\D/g, "").slice(0, 9);
  return limpio.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
}

export function numeroValido(numero: string): boolean {
  return /^9\d{8}$/.test(numero.replace(/\D/g, ""));
}
