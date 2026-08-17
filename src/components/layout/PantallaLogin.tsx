import { useState, type FormEvent } from "react";
import { HeartPulse, Lock, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Rol } from "@/state/EstadoClinico";

const CLAVE_DEMO = "12345";

const OPCIONES_ROL: { valor: Rol; etiqueta: string; Icono: typeof Stethoscope }[] = [
  { valor: "medico", etiqueta: "INSN-MÉDICO", Icono: Stethoscope },
  { valor: "enfermera", etiqueta: "INSN-ENFERMERÍA", Icono: HeartPulse },
];

export function PantallaLogin({ onIngresar }: { onIngresar: (rol: Rol) => void }) {
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (!rolSeleccionado) {
      setError("Elige INSN-MÉDICO o INSN-ENFERMERÍA para continuar.");
      return;
    }
    if (clave !== CLAVE_DEMO) {
      setError("Clave incorrecta. En esta versión demo, la clave es 12345.");
      return;
    }
    setError(null);
    onIngresar(rolSeleccionado);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <p className="micro-etiqueta text-muted-foreground">INSN San Borja</p>
          <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
            Ficha de Continuidad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Hematología pediátrica</p>
          <span className="mt-3 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            Versión demo
          </span>
        </CardHeader>

        <CardContent>
          <form onSubmit={manejarEnvio} className="flex flex-col gap-4" noValidate>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold text-foreground">Ingresar como</legend>
              <div className="grid grid-cols-2 gap-2">
                {OPCIONES_ROL.map(({ valor, etiqueta, Icono }) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setRolSeleccionado(valor)}
                    aria-pressed={rolSeleccionado === valor}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-2 py-3 text-center text-xs font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      rolSeleccionado === valor
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-accent",
                    )}
                  >
                    <Icono aria-hidden="true" className="size-5" />
                    {etiqueta}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
              Clave de acceso
              <span className="relative">
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={clave}
                  onChange={(evento) => setClave(evento.target.value)}
                  placeholder="Clave"
                  className="pl-9"
                />
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Clave de la versión demo:{" "}
                <span className="font-semibold text-foreground">12345</span>
              </span>
            </label>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-1">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
