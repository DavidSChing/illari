import { useState } from "react";
import { MoreVertical, Plus, Send } from "lucide-react";

import type { Paciente } from "@/data/tipos";
import {
  ETIQUETAS_SUGERIDAS,
  formatearNumero,
  numeroValido,
  type NumeroSms,
} from "@/data/numerosSms";
import { mensajeRecordatorio } from "@/lib/familia";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const BOTON =
  "flex h-14 w-full items-center justify-center gap-2 rounded-md px-3 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const AVISOS = ["1 semana antes", "3 días antes", "1 día antes"] as const;

export function NumerosSms({ paciente }: { paciente: Paciente }) {
  const {
    numerosSms,
    agregarNumeroSms,
    editarNumeroSms,
    alternarNumeroSms,
    eliminarNumeroSms,
    horaPropuesta,
    enviarSms,
    enviandoSms,
    smsEnviados,
  } = useEstadoClinico();
  const numeros = numerosSms(paciente.id);
  const [enviandoA, setEnviandoA] = useState<string | null>(null);

  function ultimoEnvio(numero: string) {
    return smsEnviados.find((s) => s.pacienteId === paciente.id && s.numero === numero);
  }
  const [editando, setEditando] = useState<NumeroSms | "nuevo" | null>(null);
  const [porEliminar, setPorEliminar] = useState<NumeroSms | null>(null);
  const [etiqueta, setEtiqueta] = useState("");
  const [numero, setNumero] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mensaje = mensajeRecordatorio(paciente, horaPropuesta(paciente.id) ?? undefined);

  function abrirFormulario(destino: NumeroSms | "nuevo") {
    setEditando(destino);
    setEtiqueta(destino === "nuevo" ? "" : destino.etiqueta);
    setNumero(destino === "nuevo" ? "" : destino.numero);
    setError(null);
  }

  function guardar() {
    const limpio = numero.replace(/\D/g, "");
    if (!numeroValido(limpio)) {
      setError("El número debe tener 9 dígitos y empezar con 9.");
      return;
    }
    const nombre = etiqueta.trim().slice(0, 40) || "Familiar";
    if (editando === "nuevo") agregarNumeroSms(paciente.id, nombre, limpio);
    else if (editando) editarNumeroSms(paciente.id, editando.id, nombre, limpio);
    setEditando(null);
  }

  return (
    <div className="grid gap-4">
      {/* 1. Cuándo se avisa */}
      <section aria-labelledby="titulo-cuando-avisa">
        <h3 id="titulo-cuando-avisa" className="text-[0.9375rem] font-bold uppercase tracking-wide text-foreground">
          Cuándo se avisa
        </h3>
        <ol className="mt-2 grid grid-cols-3 items-start gap-1" aria-label="Momentos de aviso">
          {AVISOS.map((aviso) => (
            <li key={aviso} className="relative pt-3 text-center">
              <span aria-hidden="true" className="absolute left-0 right-0 top-[5px] h-px bg-border" />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-primary"
              />
              <span className="block text-[0.9375rem] font-semibold text-foreground">{aviso}</span>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted-foreground">Se envía a todos los números activos.</p>
      </section>

      {/* 2. Lista de números */}
      <ul className="grid divide-y divide-border border-y border-border">
        {numeros.length === 0 && (
          <li className="py-4 text-lg text-muted-foreground">Aún no hay números registrados.</li>
        )}
        {numeros.map((item) => {
          const envio = ultimoEnvio(item.numero);
          return (
          <li key={item.id} className="flex min-h-14 flex-wrap items-center gap-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-foreground">{item.etiqueta}</p>
              <p className="text-[1.0625rem] tabular-nums text-foreground">
                {formatearNumero(item.numero)}
              </p>
              {envio && (
                <p className="text-sm text-muted-foreground">
                  {envio.estado === "real" ? "Enviado" : envio.estado === "simulado" ? "Simulado" : "Falló"} ·{" "}
                  {new Date(envio.fecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={enviandoSms}
              onClick={() => {
                setEnviandoA(item.id);
                enviarSms(paciente.id, item.numero);
              }}
              className="min-h-10 shrink-0"
            >
              <Send aria-hidden="true" className={`size-4 ${enviandoSms && enviandoA === item.id ? "animate-pulse" : ""}`} />
              Enviar
            </Button>
            <Switch
              checked={item.activo}
              onCheckedChange={() => alternarNumeroSms(paciente.id, item.id)}
              aria-label={`Avisos a ${item.etiqueta}: ${item.activo ? "activados" : "desactivados"}`}
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Opciones del número de ${item.etiqueta}`}
                className="flex size-12 shrink-0 items-center justify-center rounded-md text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <MoreVertical aria-hidden="true" className="size-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="min-h-12 text-base" onSelect={() => abrirFormulario(item)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="min-h-12 text-base" onSelect={() => setPorEliminar(item)}>
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
          );
        })}
      </ul>

      {/* 3. Agregar número */}
      <button
        type="button"
        onClick={() => abrirFormulario("nuevo")}
        className={`${BOTON} border-2 border-foreground bg-card text-foreground`}
      >
        <Plus aria-hidden="true" className="size-6 shrink-0" />
        Agregar número
      </button>

      {/* 5. Vista previa del mensaje */}
      <section aria-labelledby="titulo-vista-previa">
        <h3 id="titulo-vista-previa" className="text-[0.9375rem] font-bold uppercase tracking-wide text-foreground">
          Así se vería el mensaje
        </h3>
        <div className="mt-2 flex items-start gap-3 rounded-md border border-border bg-muted p-3">
          <p className="min-w-0 flex-1 text-base leading-snug text-foreground">{mensaje}</p>
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {mensaje.length}/160
          </span>
        </div>
      </section>

      {/* Hoja: agregar o editar */}
      <Sheet open={editando !== null} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-6 pt-5">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-bold text-foreground">
              {editando === "nuevo" ? "Agregar número" : "Editar número"}
            </SheetTitle>
          </SheetHeader>
          <div className="mx-auto mt-3 grid w-full max-w-[480px] gap-4">
            <div>
              <label htmlFor="etiqueta-numero" className="text-lg font-bold text-foreground">
                ¿De quién es este número?
              </label>
              <input
                id="etiqueta-numero"
                type="text"
                value={etiqueta}
                maxLength={40}
                onChange={(evento) => setEtiqueta(evento.target.value)}
                className="mt-1 h-14 w-full rounded-md border-2 border-input bg-card px-3 text-lg text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {ETIQUETAS_SUGERIDAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => setEtiqueta(sugerencia)}
                    className="min-h-12 rounded-md border border-border bg-card px-3 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="celular-numero" className="text-lg font-bold text-foreground">
                Número de celular
              </label>
              <input
                id="celular-numero"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                value={formatearNumero(numero)}
                aria-invalid={error !== null}
                aria-describedby={error ? "error-numero" : undefined}
                onChange={(evento) => {
                  setNumero(evento.target.value.replace(/\D/g, "").slice(0, 9));
                  setError(null);
                }}
                className="mt-1 h-14 w-full rounded-md border-2 border-input bg-card px-3 text-xl tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <div aria-live="polite">
                {error && (
                  <p
                    id="error-numero"
                    className="mt-1 border-l-[3px] border-l-clinico-rojo pl-2 text-base font-bold text-foreground"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>

            <button type="button" onClick={guardar} className={`${BOTON} bg-primary text-primary-foreground`}>
              Guardar
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hoja: confirmar eliminación */}
      <Sheet open={porEliminar !== null} onOpenChange={(abierto) => !abierto && setPorEliminar(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-6 pt-5">
          <SheetHeader>
            <SheetTitle className="text-left text-2xl font-bold text-foreground">
              ¿Eliminar el número de {porEliminar?.etiqueta}?
            </SheetTitle>
          </SheetHeader>
          <div className="mx-auto mt-3 grid w-full max-w-[480px] gap-3">
            <p className="text-lg text-foreground">Dejará de recibir los avisos.</p>
            <button
              type="button"
              onClick={() => {
                if (porEliminar) eliminarNumeroSms(paciente.id, porEliminar.id);
                setPorEliminar(null);
              }}
              className={`${BOTON} bg-clinico-rojo text-primary-foreground`}
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setPorEliminar(null)}
              className={`${BOTON} border-2 border-foreground bg-card text-foreground`}
            >
              Cancelar
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
