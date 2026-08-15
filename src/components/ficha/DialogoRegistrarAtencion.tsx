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
import { ZonaExcelCita } from "@/components/ficha/ZonaExcelCita";
import {
  coincidenciaEn,
  leerExcelDeCita,
  separarLista,
  type LecturaCita,
} from "@/lib/excel/citaPaciente";

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
  rojo: "border-l-[3px] border-l-clinico-rojo bg-muted/40 text-foreground",
  ambar: "border-l-[3px] border-l-clinico-ambar bg-muted/40 text-foreground",
  verde: "border-l-[3px] border-l-clinico-verde bg-muted/40 text-foreground",
};

/** Alto reservado siempre, para que el formulario no salte al escribir. */
function Semaforo({ lectura }: { lectura: LecturaSemaforo | null }) {
  return (
    <span className="flex h-6 items-center">
      {lectura && (
        <span
          role="status"
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${CLASES_SEMAFORO[lectura.nivel]}`}
        >
          {lectura.etiqueta}
        </span>
      )}
    </span>
  );
}

function chipClase(activo: boolean): string {
  return `h-9 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
    activo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
  }`;
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2.5">
      <h3 className="border-b border-border pb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h3>
      {children}
    </section>
  );
}

type EstadoOrigen = "cargado" | "editado";

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
  const [verOtro, setVerOtro] = useState(false);
  const [conducta, setConducta] = useState<Conducta>("Continuar esquema");
  const [fechaProximaCita, setFechaProximaCita] = useState(
    sumarDias(hoy, opcionesConducta[0]!.diasIntervalo),
  );

  // Trazabilidad de la carga desde el archivo del paciente.
  const [lectura, setLectura] = useState<LecturaCita | null>(null);
  const [origen, setOrigen] = useState<Record<string, EstadoOrigen>>({});
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);

  const numero = (texto: string) => (texto.trim() === "" ? null : Number(texto));
  const lecturaNeutrofilos = numero(neutrofilos) === null ? null : nivelNeutrofilos(Number(neutrofilos));
  const lecturaPlaquetas = numero(plaquetas) === null ? null : nivelPlaquetas(Number(plaquetas));
  const lecturaHemoglobina = numero(hemoglobina) === null ? null : nivelHemoglobina(Number(hemoglobina));

  function marcarEdicion(campo: string) {
    setOrigen((previo) => (previo[campo] ? { ...previo, [campo]: "editado" } : previo));
  }

  function Marca({ campo }: { campo: string }) {
    const estadoCampo = origen[campo];
    if (!estadoCampo || !lectura) return null;
    const texto =
      estadoCampo === "editado"
        ? "Editado por el médico"
        : `Cargado desde ${lectura.archivo}, fila ${lectura.fila}`;
    return (
      <span
        title={texto}
        aria-label={texto}
        className={`inline-block size-2 shrink-0 rounded-full ${
          estadoCampo === "editado" ? "bg-clinico-ambar" : "bg-primary"
        }`}
      />
    );
  }

  function alternar(lista: string[], valor: string): string[] {
    return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor];
  }

  function elegirConducta(valor: Conducta) {
    setConducta(valor);
    marcarEdicion("conducta");
    const opcion = opcionesConducta.find((item) => item.valor === valor);
    if (opcion) {
      setFechaProximaCita(sumarDias(hoy, opcion.diasIntervalo));
      marcarEdicion("proximaCita");
    }
  }

  function limpiarCampos() {
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
    setVerOtro(false);
    setConducta("Continuar esquema");
    setFechaProximaCita(sumarDias(hoy, opcionesConducta[0]!.diasIntervalo));
  }

  function reiniciar() {
    limpiarCampos();
    setLectura(null);
    setOrigen({});
    setErrorArchivo(null);
    setGuardado(null);
    setCopiado(false);
  }

  function deshacerCarga() {
    limpiarCampos();
    setLectura(null);
    setOrigen({});
    setErrorArchivo(null);
  }

  async function cargarArchivo(archivo: File) {
    setErrorArchivo(null);
    try {
      const resultado = await leerExcelDeCita(archivo, hoy);
      const marcas: Record<string, EstadoOrigen> = {};
      const valores = resultado.valores;

      if (valores.neutrofilos) {
        setNeutrofilos(valores.neutrofilos);
        marcas["neutrofilos"] = "cargado";
      }
      if (valores.plaquetas) {
        setPlaquetas(valores.plaquetas);
        marcas["plaquetas"] = "cargado";
      }
      if (valores.hemoglobina) {
        setHemoglobina(valores.hemoglobina);
        marcas["hemoglobina"] = "cargado";
      }
      if (valores.fecha) {
        setFechaLaboratorio(valores.fecha);
        marcas["fechaLaboratorio"] = "cargado";
      }
      if (valores.estado) {
        const partes = separarLista(valores.estado);
        const chips = partes
          .map((parte) => coincidenciaEn(chipsEstado, parte))
          .filter((chip): chip is string => chip !== null);
        const libres = partes.filter((parte) => coincidenciaEn(chipsEstado, parte) === null);
        if (chips.length > 0) {
          setEstado(Array.from(new Set(chips)));
          marcas["estado"] = "cargado";
        }
        if (libres.length > 0) {
          setObservaciones(libres.join(", "));
          marcas["observaciones"] = "cargado";
        }
      }
      if (valores.administrado) {
        const partes = separarLista(valores.administrado);
        const dosisArchivo = valores.dosis ? separarLista(valores.dosis) : [];
        const elegidos: string[] = [];
        const nuevasDosis: Record<string, string> = {};
        partes.forEach((parte, indice) => {
          const medicamento = coincidenciaEn(medicamentos, parte);
          const dosisTexto = dosisArchivo[indice] ?? "";
          if (medicamento) {
            elegidos.push(medicamento);
            if (dosisTexto) nuevasDosis[medicamento] = dosisTexto;
          } else {
            setOtroMedicamento(parte);
            setOtraDosis(dosisTexto);
            setVerOtro(true);
            marcas["otroMedicamento"] = "cargado";
          }
        });
        if (elegidos.length > 0) {
          setSeleccionados(elegidos);
          marcas["administrado"] = "cargado";
        }
        if (Object.keys(nuevasDosis).length > 0) {
          setDosis(nuevasDosis);
          marcas["dosis"] = "cargado";
        }
      }
      if (valores.conducta) {
        const opcion = coincidenciaEn(
          opcionesConducta.map((item) => item.valor),
          valores.conducta,
        ) as Conducta | null;
        if (opcion) {
          setConducta(opcion);
          marcas["conducta"] = "cargado";
        }
      }
      if (valores.proximaCita) {
        setFechaProximaCita(valores.proximaCita);
        marcas["proximaCita"] = "cargado";
      }

      setOrigen(marcas);
      setLectura(resultado);
    } catch {
      setErrorArchivo("No se pudo leer el archivo. Debe ser un Excel (.xlsx o .xls).");
    }
  }

  const camposCargados = Object.keys(origen).length;

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

  // Siempre visibles los seleccionados (por ejemplo, los cargados del archivo), hasta 3 filas.
  const visibles = Array.from(new Set([...seleccionados.filter((m) => medicamentos.includes(m)), ...medicamentos])).slice(0, 3);

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
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-hidden sm:max-w-3xl">
        <DialogHeader className="gap-1">
          <DialogTitle>Registrar atención</DialogTitle>
          <DialogDescription>
            {paciente.nombre} · Atiende {nombreMedico(medicoActualId)}. La plataforma solo registra lo que
            usted escribe: no calcula ni sugiere dosis.
          </DialogDescription>
        </DialogHeader>

        {guardado ? (
          <div className="grid gap-4 overflow-y-auto">
            <p className="rounded-md border-l-[3px] border-l-clinico-verde bg-muted/40 px-4 py-3 text-lg font-semibold text-foreground">
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
          <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-5">
                <ZonaExcelCita onArchivo={cargarArchivo} />

                <div aria-live="polite" className="grid gap-1 empty:hidden">
                  {errorArchivo && (
                    <p className="border-l-[3px] border-l-clinico-rojo bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground">
                      {errorArchivo}
                    </p>
                  )}
                  {lectura && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-l-[3px] border-l-primary bg-muted/40 px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">
                          Se completaron {camposCargados}{" "}
                          {camposCargados === 1 ? "campo" : "campos"} desde {lectura.archivo}. Revise antes
                          de guardar.
                        </p>
                        <button
                          type="button"
                          onClick={deshacerCarga}
                          className="h-9 shrink-0 rounded-md border border-border px-3 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          Deshacer carga
                        </button>
                      </div>
                      {lectura.aviso && (
                        <p className="text-xs text-muted-foreground">{lectura.aviso}</p>
                      )}
                      {lectura.problemas.map((problema) => (
                        <p key={problema} className="text-xs text-muted-foreground">
                          {problema}
                        </p>
                      ))}
                    </>
                  )}
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="grid content-start gap-5">
                    <Seccion titulo={etiquetasLaboratorio.titulo}>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-1">
                          <Label htmlFor="neutrofilos" className="flex items-center gap-1 text-xs">
                            {etiquetasLaboratorio.neutrofilos}
                            <Marca campo="neutrofilos" />
                          </Label>
                          <Input
                            id="neutrofilos"
                            type="number"
                            inputMode="numeric"
                            className="h-10"
                            value={neutrofilos}
                            onChange={(evento) => {
                              setNeutrofilos(evento.target.value);
                              marcarEdicion("neutrofilos");
                            }}
                          />
                          <Semaforo lectura={lecturaNeutrofilos} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="plaquetas" className="flex items-center gap-1 text-xs">
                            {etiquetasLaboratorio.plaquetas}
                            <Marca campo="plaquetas" />
                          </Label>
                          <Input
                            id="plaquetas"
                            type="number"
                            inputMode="numeric"
                            className="h-10"
                            value={plaquetas}
                            onChange={(evento) => {
                              setPlaquetas(evento.target.value);
                              marcarEdicion("plaquetas");
                            }}
                          />
                          <Semaforo lectura={lecturaPlaquetas} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor="hemoglobina" className="flex items-center gap-1 text-xs">
                            {etiquetasLaboratorio.hemoglobina}
                            <Marca campo="hemoglobina" />
                          </Label>
                          <Input
                            id="hemoglobina"
                            type="number"
                            step="0.1"
                            inputMode="decimal"
                            className="h-10"
                            value={hemoglobina}
                            onChange={(evento) => {
                              setHemoglobina(evento.target.value);
                              marcarEdicion("hemoglobina");
                            }}
                          />
                          <Semaforo lectura={lecturaHemoglobina} />
                        </div>
                      </div>
                      <div className="grid gap-1 sm:max-w-xs">
                        <Label htmlFor="fecha-laboratorio" className="flex items-center gap-1 text-xs">
                          {etiquetasLaboratorio.fecha}
                          <Marca campo="fechaLaboratorio" />
                        </Label>
                        <Input
                          id="fecha-laboratorio"
                          type="date"
                          className="h-10"
                          value={fechaLaboratorio}
                          onChange={(evento) => {
                            setFechaLaboratorio(evento.target.value);
                            marcarEdicion("fechaLaboratorio");
                          }}
                        />
                      </div>
                    </Seccion>

                    <Seccion titulo={etiquetasEstado.titulo}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Marca campo="estado" />
                        {chipsEstado.map((chip) => {
                          const activo = estado.includes(chip);
                          return (
                            <button
                              key={chip}
                              type="button"
                              aria-pressed={activo}
                              className={chipClase(activo)}
                              onClick={() => {
                                setEstado((previo) => alternar(previo, chip));
                                marcarEdicion("estado");
                              }}
                            >
                              {chip}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="observaciones" className="flex items-center gap-1 text-xs">
                          {etiquetasEstado.textoLibre}
                          <Marca campo="observaciones" />
                        </Label>
                        <Input
                          id="observaciones"
                          className="h-10"
                          value={observaciones}
                          onChange={(evento) => {
                            setObservaciones(evento.target.value);
                            marcarEdicion("observaciones");
                          }}
                        />
                      </div>
                    </Seccion>
                  </div>

                  <div className="grid content-start gap-5">
                    <Seccion titulo={etiquetasAdministrado.titulo}>
                      <div className="grid gap-2.5">
                        {visibles.map((medicamento) => {
                          const activo = seleccionados.includes(medicamento);
                          return (
                            <div key={medicamento} className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-pressed={activo}
                                className={`${chipClase(activo)} min-w-0 flex-1 text-left`}
                                onClick={() => {
                                  setSeleccionados((previo) => alternar(previo, medicamento));
                                  marcarEdicion("administrado");
                                }}
                              >
                                <span className="block truncate">{medicamento}</span>
                              </button>
                              <Input
                                aria-label={`Dosis de ${medicamento}, ${etiquetasAdministrado.dosis}`}
                                placeholder="Dosis"
                                className="h-9 w-32 shrink-0"
                                value={dosis[medicamento] ?? ""}
                                onChange={(evento) => {
                                  setDosis((previo) => ({ ...previo, [medicamento]: evento.target.value }));
                                  marcarEdicion("dosis");
                                }}
                              />
                              <Marca campo="dosis" />
                            </div>
                          );
                        })}

                        {verOtro ? (
                          <div className="flex items-center gap-2">
                            <Input
                              aria-label={etiquetasAdministrado.otro}
                              placeholder={etiquetasAdministrado.otro}
                              className="h-9 min-w-0 flex-1"
                              value={otroMedicamento}
                              onChange={(evento) => {
                                setOtroMedicamento(evento.target.value);
                                marcarEdicion("otroMedicamento");
                              }}
                            />
                            <Input
                              aria-label={`Dosis de otro medicamento, ${etiquetasAdministrado.dosis}`}
                              placeholder="Dosis"
                              className="h-9 w-32 shrink-0"
                              value={otraDosis}
                              onChange={(evento) => {
                                setOtraDosis(evento.target.value);
                                marcarEdicion("otroMedicamento");
                              }}
                            />
                            <Marca campo="otroMedicamento" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerOtro(true)}
                            className="justify-self-start text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            Agregar otro
                          </button>
                        )}
                      </div>
                    </Seccion>

                    <Seccion titulo={etiquetasConducta.titulo}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Marca campo="conducta" />
                        {opcionesConducta.map((opcion) => (
                          <button
                            key={opcion.valor}
                            type="button"
                            aria-pressed={conducta === opcion.valor}
                            className={chipClase(conducta === opcion.valor)}
                            onClick={() => elegirConducta(opcion.valor)}
                          >
                            {opcion.valor}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-1 sm:max-w-xs">
                        <Label htmlFor="proxima-cita" className="flex items-center gap-1 text-xs">
                          {etiquetasConducta.proximaCita}
                          <Marca campo="proximaCita" />
                        </Label>
                        <Input
                          id="proxima-cita"
                          type="date"
                          required
                          className="h-10"
                          value={fechaProximaCita}
                          onChange={(evento) => {
                            setFechaProximaCita(evento.target.value);
                            marcarEdicion("proximaCita");
                          }}
                        />
                      </div>
                    </Seccion>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border pt-3">
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
