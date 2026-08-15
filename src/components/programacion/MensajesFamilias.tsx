import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { MensajePrograma } from "@/lib/salidaProgramacion";

/** Vista previa de los SMS. No envía nada: solo muestra el texto. */
export function MensajesFamilias({ mensajes }: { mensajes: MensajePrograma[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-12 text-base">
          <MessageSquare aria-hidden="true" className="size-5" />
          Ver mensajes a familias
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mensajes a familias</DialogTitle>
          <DialogDescription className="text-base">
            Vista previa. El prototipo no envía mensajes ni confirma citas.
          </DialogDescription>
        </DialogHeader>

        {mensajes.length === 0 ? (
          <p className="text-base text-muted-foreground">
            No hay pacientes programados, por lo tanto no hay mensajes que mostrar.
          </p>
        ) : (
          <ul className="grid gap-3">
            {mensajes.map((mensaje) => (
              <li key={mensaje.pacienteId} className="rounded-md border border-border p-3">
                <p className="flex flex-wrap items-baseline gap-x-3 text-base font-semibold text-foreground">
                  {mensaje.nombre}
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {mensaje.hora}
                  </span>
                </p>
                <p className="mt-1 rounded-sm bg-muted px-3 py-2 text-base text-foreground">
                  {mensaje.texto}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
