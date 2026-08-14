import { useState } from "react";
import type { Paciente } from "@/data/tipos";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DialogoRegistrarAtencion({ paciente }: { paciente: Paciente }) {
  const { medicoActualId, registrarAtencion } = useEstadoClinico();
  const [abierto, setAbierto] = useState(false);
  const [queSeHizo, setQueSeHizo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fechaProximaCita, setFechaProximaCita] = useState(paciente.fechaProximaCita);

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    registrarAtencion({
      pacienteId: paciente.id,
      medicoId: medicoActualId,
      queSeHizo,
      observaciones,
      fechaProximaCita,
    });
    setQueSeHizo("");
    setObservaciones("");
    setAbierto(false);
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button size="lg" className="min-h-11 text-base font-semibold">
          Registrar atención
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar atención</DialogTitle>
          <DialogDescription>
            Registro breve de la consulta de {paciente.nombre}. Solo actualiza este prototipo en memoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="que-se-hizo">Qué se hizo</Label>
            <Input
              id="que-se-hizo"
              required
              value={queSeHizo}
              onChange={(evento) => setQueSeHizo(evento.target.value)}
              placeholder="Ej.: Se difirió ciclo 4 por neutropenia"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              rows={3}
              value={observaciones}
              onChange={(evento) => setObservaciones(evento.target.value)}
              placeholder="Notas relevantes para el siguiente médico"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="proxima-cita">Fecha de próxima cita</Label>
            <Input
              id="proxima-cita"
              type="date"
              required
              value={fechaProximaCita}
              onChange={(evento) => setFechaProximaCita(evento.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar registro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
