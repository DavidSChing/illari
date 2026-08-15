import { useState } from "react";
import { Anchor, MoreVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEstadoClinico } from "@/state/EstadoClinico";

interface Props {
  pacienteId: string;
  nombre: string;
  indiceBloque: number;
  horasDeBloques: string[];
  fijado: boolean;
}

/** Menú de ajustes manuales de un paciente dentro de un bloque. */
export function MenuAjustePaciente({
  pacienteId,
  nombre,
  indiceBloque,
  horasDeBloques,
  fijado,
}: Props) {
  const { moverABloque, fijarEnBloque, liberarPaciente, excluirPaciente } = useEstadoClinico();
  const [abrirMover, setAbrirMover] = useState(false);
  const [abrirExcluir, setAbrirExcluir] = useState(false);
  const [motivo, setMotivo] = useState("");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Ajustes de ${nombre}`}
            className="flex size-12 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          >
            <MoreVertical aria-hidden="true" className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-base">{nombre}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="min-h-12 text-base" onSelect={() => setAbrirMover(true)}>
            Mover a otro bloque
          </DropdownMenuItem>
          {fijado ? (
            <DropdownMenuItem
              className="min-h-12 text-base"
              onSelect={() => liberarPaciente(pacienteId)}
            >
              <Anchor aria-hidden="true" className="size-4" />
              Quitar fijado
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="min-h-12 text-base"
              onSelect={() => fijarEnBloque(pacienteId, indiceBloque)}
            >
              <Anchor aria-hidden="true" className="size-4" />
              Fijar en este bloque
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="min-h-12 text-base" onSelect={() => setAbrirExcluir(true)}>
            Excluir de la programación
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={abrirMover} onOpenChange={setAbrirMover}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover a otro bloque</DialogTitle>
            <DialogDescription className="text-base">
              {nombre} quedará fijado en el bloque elegido y no se moverá al recalcular.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2">
            {horasDeBloques.map((hora, indice) => (
              <li key={hora}>
                <Button
                  type="button"
                  variant={indice === indiceBloque ? "secondary" : "outline"}
                  className="min-h-12 w-full justify-between text-base"
                  onClick={() => {
                    moverABloque(pacienteId, indice);
                    setAbrirMover(false);
                  }}
                >
                  <span>Bloque {indice + 1}</span>
                  <span className="tabular-nums font-bold">{hora}</span>
                </Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={abrirExcluir} onOpenChange={setAbrirExcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir de la programación</DialogTitle>
            <DialogDescription className="text-base">
              {nombre} pasará a la lista "Fuera de la programación". Puede devolverlo cuando el
              equipo lo decida.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`motivo-${pacienteId}`} className="text-base">
              Motivo
            </Label>
            <Textarea
              id={`motivo-${pacienteId}`}
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              rows={3}
              className="text-base"
              placeholder="Ej. reprograma por fiebre; el médico evaluará mañana"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-12 text-base"
              onClick={() => setAbrirExcluir(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="min-h-12 text-base"
              onClick={() => {
                excluirPaciente(pacienteId, motivo.trim());
                setAbrirExcluir(false);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
