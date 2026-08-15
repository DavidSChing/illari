export interface ResultadoSms {
  exito: boolean;
  simulado: boolean;
  detalle: string;
  idExterno?: string;
}

export function normalizarTelefono(numero: string, codigoPaisDefecto = "51"): string {
  let limpio = numero.replace(/[^\d+]/g, "");
  if (limpio.startsWith("00")) limpio = `+${limpio.slice(2)}`;
  if (!limpio.startsWith("+")) limpio = `+${codigoPaisDefecto}${limpio}`;
  return limpio;
}

function escaparShell(texto: string): string {
  return `'${texto.replace(/'/g, `'\\''`)}'`;
}

function credencialesTermuxConfiguradas(): boolean {
  return Boolean(process.env["TERMUX_HOST"] && process.env["TERMUX_USER"] && process.env["TERMUX_PASSWORD"]);
}

async function enviarSmsTermux(destino: string, mensaje: string): Promise<ResultadoSms> {
  const host = process.env["TERMUX_HOST"];
  const username = process.env["TERMUX_USER"];
  const password = process.env["TERMUX_PASSWORD"];
  if (!host || !username || !password) {
    return { exito: false, simulado: false, detalle: "Faltan TERMUX_HOST/USER/PASSWORD en .env." };
  }

  const { Client } = await import("ssh2");
  const comando = `termux-sms-send -n ${escaparShell(destino)} ${escaparShell(mensaje)}`;

  return new Promise((resolve) => {
    const cliente = new Client();
    let salida = "";
    let error = "";

    cliente
      .on("ready", () => {
        cliente.exec(comando, (err, stream) => {
          if (err) {
            cliente.end();
            resolve({ exito: false, simulado: false, detalle: err.message });
            return;
          }
          stream
            .on("close", () => {
              cliente.end();
              if (error) resolve({ exito: false, simulado: false, detalle: error.trim() });
              else resolve({ exito: true, simulado: false, detalle: "Enviado por Termux" });
            })
            .on("data", (data: Buffer) => {
              salida += data.toString();
            })
            .stderr.on("data", (data: Buffer) => {
              error += data.toString();
            });
        });
      })
      .on("error", (err) => {
        resolve({
          exito: false,
          simulado: false,
          detalle: `No se pudo conectar por SSH al celular: ${err.message}`,
        });
      })
      .connect({
        host,
        port: Number(process.env["TERMUX_PORT"] ?? 8022),
        username,
        password,
        readyTimeout: 10_000,
      });
    void salida;
  });
}

function credencialesGatewayConfiguradas(): boolean {
  return Boolean(process.env["SMSGATE_USER"] && process.env["SMSGATE_PASSWORD"]);
}

async function enviarSmsGateway(destino: string, mensaje: string): Promise<ResultadoSms> {
  const usuario = process.env["SMSGATE_USER"];
  const password = process.env["SMSGATE_PASSWORD"];
  const auth = Buffer.from(`${usuario}:${password}`).toString("base64");

  try {
    const resp = await fetch("https://api.sms-gate.app/3rdparty/v1/messages", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ textMessage: { text: mensaje }, phoneNumbers: [destino] }),
    });
    if (resp.ok) {
      const data = (await resp.json()) as { id?: string; state?: string };
      return {
        exito: true,
        simulado: false,
        detalle: `Aceptado por el celular (${data.state ?? "enviado"})`,
        ...(data.id ? { idExterno: data.id } : {}),
      };
    }
    if (resp.status === 401) {
      return { exito: false, simulado: false, detalle: "Usuario/contraseña incorrectos (SMSGATE_USER/SMSGATE_PASSWORD)." };
    }
    if (resp.status >= 500) {
      return { exito: false, simulado: false, detalle: "El celular parece desconectado o la app no está corriendo." };
    }
    return { exito: false, simulado: false, detalle: `HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}` };
  } catch (error) {
    return { exito: false, simulado: false, detalle: error instanceof Error ? error.message : String(error) };
  }
}

export function credencialesSmsConfiguradas(): boolean {
  return credencialesTermuxConfiguradas() || credencialesGatewayConfiguradas();
}

export async function enviarSmsReal(numeroDestino: string, mensaje: string): Promise<ResultadoSms> {
  if (!numeroDestino || numeroDestino === "—") {
    return { exito: false, simulado: false, detalle: "Sin teléfono registrado." };
  }
  const destino = normalizarTelefono(numeroDestino);

  if (credencialesTermuxConfiguradas()) return enviarSmsTermux(destino, mensaje);
  if (credencialesGatewayConfiguradas()) return enviarSmsGateway(destino, mensaje);

  return {
    exito: true,
    simulado: true,
    detalle: `SMS simulado a ${destino}: "${mensaje}". Faltan TERMUX_HOST/USER/PASSWORD o SMSGATE_USER/PASSWORD en .env.`,
  };
}
