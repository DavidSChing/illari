import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Paciente } from "@/data/tipos";
import { useEstadoClinico } from "@/state/EstadoClinico";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CAMPOS_CITA,
  filaCitaComoTexto,
  lecturaSemaforo,
  type CampoCitaConfig,
} from "@/config/camposCita";
import { ZonaExcelCita } from "@/components/ficha/ZonaExcelCita";
import { leerCamposDeCita, type LecturaCampos } from "@/lib/excel/lecturaCampos";

function hoyIso(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(a!, m! - 1, d! + dias);
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const PUNTO: Record<string, string> = {
  rojo: "bg-clinico-rojo",
  ambar: "bg-clinico-ambar",
  verde: "bg-clinico-verde",
};

/** Valores sugeridos por la plataforma, derivados del perfil del paciente. */
function valoresSugeridos(paciente: Paciente): Record<string, string> {
  const hoy = hoyIso();
  const sugeridos: Record<string, string> = {};
  CAMPOS_CITA.forEach((campo) => {
    if (campo.tipo === "fecha") {
      sugeridos[campo.id] = paciente.fechaProximaCita || sumarDias(hoy, 21);
      return;
    }
    if (campo.tipo === "textoCorto") {
      const siguiente = (paciente.cicloActual ?? 0) + 1;
      sugeridos[campo.id] = paciente.ciclosTotales
        ? `Ciclo ${siguiente} de ${paciente.ciclosTotales}`
        : `Ciclo ${siguiente}`;
      return;
    }
    sugeridos[campo.id] = "";
  });
  return sugeridos;
}

type EstadoOrigen = "cargado" | "editado";

export function DialogoRegistrarAtencion({ paciente }: { paciente: Paciente }) {
  const { medicoActualId, nombreMedico, registrarAtencion } = useEstadoClinico();
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const sugeridos = useMemo(() => valoresSugeridos(paciente), [paciente]);
  const [valores, setValores] = useState<Record<string, string>>(sugeridos);
  const [guardado, setGuardado] = useState<Record<string, string> | null>(null);
  const [lectura, setLectura] = useState<LecturaCampos | null>(null);
  const [origen, setOrigen] = useState<Record<string, EstadoOrigen>>({});
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  function reiniciar() {
    setValores(valoresSugeridos(paciente));
    setGuardado(null);
    setCopiado(false);
    setLectura(null);
    setOrigen({});
    setErrorArchivo(null);
  }

  function escribir(id: string, valor: string) {
    setValores((previos) => ({ ...previos, [id]: valor }));
    setOrigen((previos) => (previos[id] ? { ...previos, [id]: "editado" } : previos));
  }

  async function cargarArchivo(archivo: File) {
    setErrorArchivo(null);
    try {
      const resultado = await leerCamposDeCita(archivo, hoyIso());
      setLectura(resultado);
      setValores((previos) => ({ ...previos, ...resultado.valores }));
      const marcas: Record<string, EstadoOrigen> = {};
      Object.keys(resultado.valores).forEach((id) => {
        marcas[id] = "cargado";
      });
      setOrigen(marcas);
    } catch {
      setErrorArchivo("No se pudo leer el archivo. Verifique que sea un Excel (.xlsx o .xls).");
    }
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const campoFecha = CAMPOS_CITA.find((campo) => campo.tipo === "fecha");
    const resumen = CAMPOS_CITA.filter((campo) => valores[campo.id]?.trim())
      .map((campo) => `${campo.etiqueta}: ${valores[campo.id]}`)
      .join(" · ");
    registrarAtencion({
      pacienteId: paciente.id,
      medicoId: medicoActualId,
      queSeHizo: resumen || "Atención registrada",
      observaciones: "",
      fechaProximaCita: campoFecha ? (valores[campoFecha.id] ?? "") : "",
    });
    setGuardado({ ...valores });
  }

  async function copiarFila() {
    if (!guardado) return;
    try {
      await navigator.clipboard.writeText(filaCitaComoTexto(guardado));
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  function campoInput(campo: CampoCitaConfig) {
    const id = `campo-${campo.id}`;
    const valor = valores[campo.id] ?? "";
    const lecturaColor = campo.tipo === "numero" ? lecturaSemaforo(campo, valor) : null;
    const marca = origen[campo.id];
    return (
      <div key={campo.id} className="grid gap-1">
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {campo.etiqueta}
          {campo.unidad && <span className="font-medium text-muted-foreground">{campo.unidad}</span>}
          {marca && (
            <span
              title={
                lectura
                  ? `${marca === "cargado" ? "Del archivo" : "Editado"} ${lectura.archivo}, fila ${lectura.fila}`
                  : undefined
              }
              className={`h-2 w-2 rounded-full ${marca === "cargado" ? "bg-primary" : "bg-clinico-ambar"}`}
            />
          )}
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id={id}
            type={campo.tipo === "fecha" ? "date" : campo.tipo === "numero" ? "number" : "text"}
            inputMode={campo.tipo === "numero" ? "numeric" : undefined}
            value={valor}
            onChange={(evento) => escribir(campo.id, evento.target.value)}
            className="h-11 max-w-sm text-base tabular-nums"
          />
          <span className="flex min-h-6 items-center gap-2 text-sm font-semibold text-foreground">
            {lecturaColor && (
              <>
                <span className={`h-2.5 w-2.5 rounded-full ${PUNTO[lecturaColor.nivel]}`} aria-hidden="true" />
                {valor} · {lecturaColor.etiqueta}
              </>
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(valor) => {
        setAbierto(valor);
        if (!valor) reiniciar();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="min-h-14 w-full text-base font-semibold md:min-h-11 md:w-auto">
          Registrar atención
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-4 overflow-y-auto sm:max-w-xl">
        <DialogHeader className="gap-1">
          <DialogTitle>Registrar atención</DialogTitle>
          <DialogDescription>
            {paciente.nombre} · Atiende {nombreMedico(medicoActualId)}
          </DialogDescription>
        </DialogHeader>

        {guardado ? (
          <div className="grid gap-4">
            <p className="border-l-[3px] border-l-clinico-verde bg-muted/40 px-4 py-3 text-base font-semibold text-foreground">
              Atención registrada en esta sesión.
            </p>
            <table className="w-full text-sm">
              <tbody>
                {CAMPOS_CITA.map((campo) => (
                  <tr key={campo.id} className="border-b border-border last:border-0">
                    <th scope="row" className="py-1 text-left font-semibold text-muted-foreground">
                      {campo.etiqueta}
                    </th>
                    <td className="py-1 text-right tabular-nums text-foreground">
                      {guardado[campo.id] || "Sin registro reciente"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {copiado && (
              <p role="status" className="text-sm font-semibold text-foreground">
                Copiado. Péguelo en su Excel: la plataforma no modifica su archivo.
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" className="min-h-11" onClick={copiarFila}>
                {copiado ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                Copiar como fila de Excel
              </Button>
              <Button type="button" className="min-h-11" onClick={() => setAbierto(false)}>
                Listo
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={enviar} className="grid gap-4">
            <ZonaExcelCita onArchivo={cargarArchivo} />

            <div aria-live="polite" className="grid gap-1 empty:hidden">
              {errorArchivo && (
                <p className="border-l-[3px] border-l-clinico-rojo bg-muted/40 px-3 py-1.5 text-sm font-semibold text-foreground">
                  {errorArchivo}
                </p>
              )}
              {lectura && (
                <p className="border-l-[3px] border-l-primary bg-muted/40 px-3 py-1.5 text-sm text-foreground">
                  Se leyó {lectura.archivo} (fila {lectura.fila}). Revise los valores antes de guardar.
                  {lectura.problemas[0] ? ` ${lectura.problemas[0]}` : ""}
                </p>
              )}
            </div>

            <div className="grid gap-3">{CAMPOS_CITA.map(campoInput)}</div>

            <p className="text-xs text-muted-foreground">
              Estos son los {CAMPOS_CITA.length === 3 ? "tres" : CAMPOS_CITA.length} datos que el servicio
              registra hoy. La plataforma deriva el resto.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="min-h-11">
                {lectura ? "Revisar y guardar" : "Guardar registro"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
