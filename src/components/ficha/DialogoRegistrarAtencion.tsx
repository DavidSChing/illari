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
import { nivelHemoglobina, nivelNeutrofilos, nivelPlaquetas, type LecturaSemaforo } from "@/data/umbrales";
import {
  chipsEstado,
  columnasExcel,
  etiquetasAdministrado,
  etiquetasConducta,
  etiquetasEstado,
  etiquetasLaboratorio,
  filaComoTexto,
  medicamentosDelEsquema,
  opcionesConducta,
  type Conducta,
  type FilaExcel,
} from "@/data/registroAtencion";

function hoyIso(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(a!, m! - 1, d! + dias);
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const CLASES_SEMAFORO: Record<string, string> = {
  rojo: "border-clinico-rojo bg-clinico-rojo-suave text-clinico-rojo-foreground",
  ambar: "border-clinico-ambar bg-clinico-ambar-suave text-clinico-ambar-foreground",
  verde: "border-clinico-verde bg-clinico-verde-suave text-clinico-verde-foreground",
};

function Semaforo({ lectura }: { lectura: LecturaSemaforo | null }) {
  if (!lectura) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <span
      role="status"
      className={`inline-flex items-center rounded-md border px-2 py-1 text-sm font-semibold ${CLASES_SEMAFORO[lectura.nivel]}`}
    >
      {lectura.etiqueta}
    </span>
  );
}

function chipClase(activo: boolean): string {
  return `min-h-11 rounded-md border px-3 py-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
    activo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
  }`;
}

export function DialogoRegistrarAtencion({ paciente }: { paciente: Paciente }) {
  const { medicoActualId, nombreMedico, registrarAtencion } = useEstadoClinico();
  const [abierto, setAbierto] = useState(false);
  const [guardado, setGuardado] = useState<FilaExcel | null>(null);
  const [copiado, setCopiado] = useState(false);

  const hoy = hoyIso();
  const medicamentos = useMemo(() => medicamentosDelEsquema(paciente.protocolo), [paciente.protocolo]);

  const [neutrofilos, setNeutrofilos] = useState("");
  const [plaquetas, setPlaquetas] = useState("");
  const [hemoglobina, setHemoglobina] = useState("");
  const [fechaLaboratorio, setFechaLaboratorio] = useState(hoy);
  const [estado, setEstado] = useState<string[]>([]);
  const [observaciones, setObservaciones] = useState("");
  const [dosis, setDosis] = useState<Record<string, string>>({});
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [otroMedicamento, setOtroMedicamento] = useState("");
  const [otraDosis, setOtraDosis] = useState("");
  const [conducta, setConducta] = useState<Conducta>("Continuar esquema");
  const [fechaProximaCita, setFechaProximaCita] = useState(
    sumarDias(hoy, opcionesConducta[0]!.diasIntervalo),
  );

  const numero = (texto: string) => (texto.trim() === "" ? null : Number(texto));
  const lecturaNeutrofilos = numero(neutrofilos) === null ? null : nivelNeutrofilos(Number(neutrofilos));
  const lecturaPlaquetas = numero(plaquetas) === null ? null : nivelPlaquetas(Number(plaquetas));
  const lecturaHemoglobina = numero(hemoglobina) === null ? null : nivelHemoglobina(Number(hemoglobina));

  function alternar(lista: string[], valor: string): string[] {
    return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor];
  }

  function elegirConducta(valor: Conducta) {
    setConducta(valor);
    const opcion = opcionesConducta.find((item) => item.valor === valor);
    if (opcion) setFechaProximaCita(sumarDias(hoy, opcion.diasIntervalo));
  }

  function reiniciar() {
    setNeutrofilos("");
    setPlaquetas("");
    setHemoglobina("");
    setFechaLaboratorio(hoy);
    setEstado([]);
    setObservaciones("");
    setDosis({});
    setSeleccionados([]);
    setOtroMedicamento("");
    setOtraDosis("");
    setConducta("Continuar esquema");
    setFechaProximaCita(sumarDias(hoy, opcionesConducta[0]!.diasIntervalo));
    setGuardado(null);
    setCopiado(false);
  }

  function textoAdministrado(): string {
    const lista = seleccionados.map((medicamento) =>
      dosis[medicamento]?.trim() ? `${medicamento} ${dosis[medicamento]!.trim()}` : medicamento,
    );
    if (otroMedicamento.trim()) {
      lista.push(otraDosis.trim() ? `${otroMedicamento.trim()} ${otraDosis.trim()}` : otroMedicamento.trim());
    }
    return lista.join("; ");
  }

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const administrado = textoAdministrado();
    const fila: FilaExcel = {
      fecha: hoy,
      hc: paciente.hc ?? paciente.id,
      paciente: paciente.nombre,
      medico: nombreMedico(medicoActualId),
      neutrofilos,
      plaquetas,
      hemoglobina,
      fechaLaboratorio,
      estado: estado.join(", "),
      observaciones,
      administrado,
      conducta,
      proximaCita: fechaProximaCita,
    };
    registrarAtencion({
      pacienteId: paciente.id,
      medicoId: medicoActualId,
      queSeHizo: administrado ? `${conducta}. Administrado: ${administrado}` : conducta,
      observaciones: [estado.join(", "), observaciones].filter(Boolean).join(" · "),
      fechaProximaCita,
    });
    setGuardado(fila);
  }

  async function copiarFila() {
    if (!guardado) return;
    try {
      await navigator.clipboard.writeText(filaComoTexto(guardado));
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
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
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar atención</DialogTitle>
          <DialogDescription>
            {paciente.nombre} · Atiende {nombreMedico(medicoActualId)}. La plataforma solo registra lo que
            usted escribe: no calcula ni sugiere dosis.
          </DialogDescription>
        </DialogHeader>

        {guardado ? (
          <div className="grid gap-4">
            <p className="rounded-md border border-clinico-verde bg-clinico-verde-suave px-4 py-3 text-lg font-semibold text-clinico-verde-foreground">
              Atención registrada en esta sesión.
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {columnasExcel.map((columna) => (
                    <tr key={columna.campo} className="border-b border-border last:border-0">
                      <th scope="row" className="px-2 py-1 text-left font-semibold text-muted-foreground">
                        {columna.titulo}
                      </th>
                      <td className="px-2 py-1 text-foreground">{guardado[columna.campo] || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {copiado && (
              <p role="status" className="text-base font-semibold text-foreground">
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
            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {etiquetasLaboratorio.titulo}
              </legend>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1">
                  <Label htmlFor="neutrofilos">{etiquetasLaboratorio.neutrofilos}</Label>
                  <Input
                    id="neutrofilos"
                    type="number"
                    inputMode="numeric"
                    value={neutrofilos}
                    onChange={(evento) => setNeutrofilos(evento.target.value)}
                  />
                  <Semaforo lectura={lecturaNeutrofilos} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="plaquetas">{etiquetasLaboratorio.plaquetas}</Label>
                  <Input
                    id="plaquetas"
                    type="number"
                    inputMode="numeric"
                    value={plaquetas}
                    onChange={(evento) => setPlaquetas(evento.target.value)}
                  />
                  <Semaforo lectura={lecturaPlaquetas} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="hemoglobina">{etiquetasLaboratorio.hemoglobina}</Label>
                  <Input
                    id="hemoglobina"
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={hemoglobina}
                    onChange={(evento) => setHemoglobina(evento.target.value)}
                  />
                  <Semaforo lectura={lecturaHemoglobina} />
                </div>
              </div>
              <div className="grid gap-1 sm:max-w-xs">
                <Label htmlFor="fecha-laboratorio">{etiquetasLaboratorio.fecha}</Label>
                <Input
                  id="fecha-laboratorio"
                  type="date"
                  value={fechaLaboratorio}
                  onChange={(evento) => setFechaLaboratorio(evento.target.value)}
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {etiquetasEstado.titulo}
              </legend>
              <div className="flex flex-wrap gap-2">
                {chipsEstado.map((chip) => {
                  const activo = estado.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      aria-pressed={activo}
                      className={chipClase(activo)}
                      onClick={() => setEstado((previo) => alternar(previo, chip))}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="observaciones">{etiquetasEstado.textoLibre}</Label>
                <Input
                  id="observaciones"
                  value={observaciones}
                  onChange={(evento) => setObservaciones(evento.target.value)}
                />
              </div>
            </fieldset>

            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {etiquetasAdministrado.titulo}
              </legend>
              <div className="grid gap-2">
                {medicamentos.map((medicamento) => {
                  const activo = seleccionados.includes(medicamento);
                  return (
                    <div key={medicamento} className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-pressed={activo}
                        className={`${chipClase(activo)} min-w-44 text-left`}
                        onClick={() => setSeleccionados((previo) => alternar(previo, medicamento))}
                      >
                        {medicamento}
                      </button>
                      <Input
                        aria-label={`Dosis de ${medicamento}, ${etiquetasAdministrado.dosis}`}
                        placeholder="Dosis"
                        className="h-11 w-44"
                        value={dosis[medicamento] ?? ""}
                        onChange={(evento) =>
                          setDosis((previo) => ({ ...previo, [medicamento]: evento.target.value }))
                        }
                      />
                    </div>
                  );
                })}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    aria-label={etiquetasAdministrado.otro}
                    placeholder={etiquetasAdministrado.otro}
                    className="h-11 min-w-44 flex-1"
                    value={otroMedicamento}
                    onChange={(evento) => setOtroMedicamento(evento.target.value)}
                  />
                  <Input
                    aria-label={`Dosis de otro medicamento, ${etiquetasAdministrado.dosis}`}
                    placeholder="Dosis"
                    className="h-11 w-44"
                    value={otraDosis}
                    onChange={(evento) => setOtraDosis(evento.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="grid gap-2 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {etiquetasConducta.titulo}
              </legend>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  {opcionesConducta.map((opcion) => (
                    <button
                      key={opcion.valor}
                      type="button"
                      aria-pressed={conducta === opcion.valor}
                      className={`${chipClase(conducta === opcion.valor)} min-h-14 text-lg`}
                      onClick={() => elegirConducta(opcion.valor)}
                    >
                      {opcion.valor}
                    </button>
                  ))}
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="proxima-cita">{etiquetasConducta.proximaCita}</Label>
                  <Input
                    id="proxima-cita"
                    type="date"
                    required
                    className="h-11"
                    value={fechaProximaCita}
                    onChange={(evento) => setFechaProximaCita(evento.target.value)}
                  />
                </div>
              </div>
            </fieldset>

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
                Guardar registro
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
