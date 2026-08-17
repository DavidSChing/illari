# ILLARI — Capa de continuidad asistencial

**Que ningún niño se pierda entre dos citas.**

Prototipo desarrollado para la **Hackatón Niño San Borja 2026** del Instituto Nacional de Salud del Niño San Borja (INSN San Borja), en el **Desafío 3 — Ruta Hematológica: continuidad y calidad para cada paciente**.

[![Demo](https://img.shields.io/badge/demo-illari.lovable.app-0B5A7A)](https://illari.lovable.app/)
[![Licencia](https://img.shields.io/badge/licencia-MIT-1C7293)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Vite-3178C6)](#stack-y-dependencias)
[![Datos](https://img.shields.io/badge/datos-100%25%20sint%C3%A9ticos-4C8C4A)](#datos-sintéticos)

> **Prototipo demostrativo.** Opera exclusivamente con datos sintéticos. No contiene ni procesa información real de pacientes.

---

## El problema

En la Unidad de Hematología Pediátrica del INSN San Borja cada paciente tiene asignado un médico principal y un médico de soporte. Cuando ninguno de los dos está disponible, la consulta la atiende un **tercer médico de turno** que debe reconstruir manualmente el estado del tratamiento a partir de hojas de cálculo antes de definir la conducta.

Esto ocurre en la fase ambulatoria, entre ciclos, que es donde el propio servicio identifica el mayor riesgo de interrupción del seguimiento. La consecuencia se acumula: consultas más lentas y con menos contexto, y familias que viajan desde regiones —pagando pasaje, alojamiento y una jornada laboral que el SIS no cubre— con la sensación de que el viaje no rindió.

El servicio identificó además tres brechas de organización: falta de visibilidad de la carga de pacientes por profesional, distribución desigual de esa carga, y concentración de la demanda de la clínica de día en pocas franjas horarias.

> El punto de quiebre que estructura esta propuesta fue identificado en mentoría con un especialista en hematología pediátrica del INSN San Borja. No es un supuesto del equipo.

---

## La solución

**ILLARI es una capa de lectura sobre el registro de citas que el servicio ya produce.** No cambia el proceso de nadie: lee el archivo que el equipo ya llena, lo consolida y lo organiza.

El médico registra por cita los mismos datos clave que registra hoy. A partir de ellos, la plataforma **deriva automáticamente**:

- el ciclo y la fase del tratamiento
- los días de retraso frente al calendario del esquema
- las alertas activas
- la carga de pacientes por profesional
- una propuesta de distribución de la jornada ambulatoria

Ninguno de esos elementos se digita. **Se calculan.**

### Principios de diseño

| Principio | Cómo se implementa |
|---|---|
| **El sistema muestra, el médico decide** | No calcula ni sugiere dosis. No determina si un ciclo procede. Toda sugerencia está rotulada como tal en la interfaz |
| **Solo lectura** | El archivo del servicio nunca se modifica ni se sobrescribe. Sigue siendo la fuente de verdad |
| **Sin inferencias silenciosas** | Ante un valor que no puede interpretarse, lo reporta en lugar de deducirlo. Ante registros discrepantes, muestra ambos y los devuelve al equipo |
| **Trazabilidad** | Cada dato mostrado indica su archivo y fila de origen |
| **Procesamiento local** | El archivo se lee dentro del navegador. No se transmite a ningún servidor |
| **Adopción reversible** | Si se descontinúa, el registro original permanece intacto |

---

## Módulos

### 1. Ficha de Continuidad
Pantalla única por paciente: fase y ciclo, alertas activas, últimos valores de laboratorio con semáforo por umbral, última administración, profesionales responsables y próximo paso sugerido según el esquema. Si el profesional que consulta no pertenece a la dupla del paciente, la interfaz lo advierte de forma explícita.

### 2. Lectura del registro de citas
Carga del archivo `.xlsx` que el servicio ya utiliza. Reconoce variantes en los nombres de columna, normaliza formatos de fecha heterogéneos y reporta lo que no puede interpretar.

### 3. Programación sugerida de la clínica de día
Propone una distribución de la jornada en bloques que ocupan la capacidad disponible. El orden de prelación **no expresa gravedad clínica**: expresa prioridad de espera. Se cita más temprano a quien requiere evaluación prioritaria y a quien debe permanecer menos tiempo en sala; a igualdad de condiciones, se prioriza a quien enfrenta mayor tiempo de traslado. Toda propuesta es ajustable y cada ajuste queda registrado.

### 4. Carga médica y pacientes con ciclo retrasado
Distribución de pacientes por profesional y listado de quienes presentan retraso respecto del calendario de su esquema, ordenados por magnitud. Es información que hoy existe dispersa y que nadie puede consultar de forma agregada.

### 5. Vista para el responsable del paciente
Interfaz simplificada, de prioridad móvil: próxima cita, indicaciones de preparación, señales de alarma, calendario del tratamiento, y la posibilidad de confirmar asistencia o comunicar que no podrá asistir. Incluye gestión de números de contacto y previsualización del mensaje de texto de recordatorio.

Su diseño sigue criterios del [NHS Digital Service Manual](https://service-manual.nhs.uk/design-system) y del [GOV.UK Design System](https://design-system.service.gov.uk/), estándares de accesibilidad de servicios públicos de salud.

---

## Cómo ejecutarlo

**Requisitos:** Node.js 18 o superior.

```bash
git clone https://github.com/DavidSChing/illari.git
cd illari
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

No requiere base de datos, variables de entorno, autenticación ni servicios externos.

---

## Cómo adaptarlo a otro servicio

Cada servicio registra campos distintos por cita. En ILLARI esos campos están centralizados en un único archivo de configuración:

```
src/config/camposCita.ts
```

Modificar ese archivo adapta simultáneamente **el formulario de registro, el lector del archivo Excel y la exportación de filas**, sin intervenir ningún componente de la interfaz.

```ts
export const CAMPOS_CITA = [
  {
    id: "hemograma",
    etiqueta: "Hemograma — neutrófilos",
    tipo: "numero",
    unidad: "/mm³",
    semaforo: { critico: 500, atencion: 1000 },
    sinonimosExcel: ["NEUTROFILOS", "NEUTRÓFILOS", "HEMOGRAMA", "RAN"]
  },
  // …
]
```

El campo `sinonimosExcel` permite que el lector reconozca las variantes de nomenclatura que ya usa cada servicio, sin pedirle que renombre nada en su archivo.

**Este es el mecanismo de escalabilidad de la solución:** trasladarla a otro servicio con otra ruta de citas es cambiar etiquetas de configuración, no desarrollar un sistema nuevo.

---

## Componentes reutilizables

Publicados bajo licencia MIT para su consulta, uso, adaptación y redistribución:

| Componente | Ubicación | Para qué sirve fuera de este proyecto |
|---|---|---|
| **Configuración de campos** | `src/config/camposCita.ts` | Adaptar la captura y la lectura a cualquier registro de citas |
| **Lector tolerante de Excel** | `src/lib/` | Leer hojas de cálculo con nomenclatura y formatos heterogéneos, reportando lo no interpretable |
| **Algoritmo de programación** | `src/lib/programacion.ts` | Distribuir citas en bloques por prioridad y capacidad. Función pura, independiente de la interfaz y parametrizable |
| **Conjunto de datos sintéticos** | `src/data/`, `public/` | Probar soluciones similares sin usar datos reales |
| **Documentación** | este archivo | Instalación, adaptación y limitaciones |

---

## Datos sintéticos

Todos los datos incluidos —pacientes, profesionales, esquemas de tratamiento, registros de citas— son **ficticios y generados por el equipo** para fines demostrativos.

- No se utilizó información real de pacientes, historias clínicas ni datos identificables.
- Los esquemas de tratamiento son ficticios y están rotulados como tales en la interfaz.
- El repositorio no contiene credenciales, información institucional restringida ni datos personales.
- El archivo de ejemplo para probar la carga está en `public/`.

Esto cumple con las consideraciones éticas y de tratamiento de datos establecidas en las bases de la hackatón.

---

## Stack y dependencias

| Componente | Tecnología |
|---|---|
| Interfaz | React + TypeScript |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui (MIT) |
| Empaquetado | Vite |
| Lectura de Excel | SheetJS (Apache 2.0) |
| Persistencia | Ninguna — estado en memoria durante la sesión |
| Backend | Ninguno |

Todas las dependencias son de código abierto. La solución no depende de software propietario restrictivo, servicios comerciales cerrados ni infraestructura privada no replicable. Las licencias de terceros se conservan en `node_modules` y en `package.json`.

---

## Limitaciones declaradas

Se enumeran de forma explícita porque un prototipo honesto vale más que uno que promete de más:

- **Carácter demostrativo.** No es un sistema listo para operar en entorno real.
- **Sin persistencia.** El estado se mantiene en memoria durante la sesión; al recargar se reinicia.
- **Los mensajes de texto no se envían.** La vista de avisos es una previsualización.
- **No validado con datos reales.** Toda la demostración corre sobre datos sintéticos.
- **No se afirma reducción de la tasa de abandono.** La solución actúa sobre factores documentados —retraso entre ciclos y traslados que no rinden—, pero demostrar un efecto sobre el abandono requiere un piloto con medición.
- **La programación asume duración uniforme de sesión.** En la práctica varía según esquema.
- **La carga del archivo es manual.** En operación real correspondería una lectura automática desde carpeta compartida.
- **No es una historia clínica electrónica** ni pretende serlo: está fuera del alcance del desafío.

---

## Próximos pasos

**Corto plazo (90 días).** Piloto acotado en la Unidad de Hematología Pediátrica con el registro real del servicio, previa autorización institucional. Objetivo principal: construir la línea base de los indicadores, que hoy no está sistematizada.

**Mediano plazo.** Ajuste de los campos a los que efectivamente usa el servicio; incorporación de Servicio Social al flujo de avisos; habilitación del envío efectivo de mensajes por el canal institucional disponible.

**Largo plazo.** Extensión a otros servicios ambulatorios del propio instituto e integración progresiva con los sistemas de información existentes, en el marco de la Ley de Gobierno Digital (D.L. 1412).

### Indicadores propuestos

| Indicador | Cómo se mediría |
|---|---|
| Tiempo de reconstrucción del estado de un paciente por un profesional distinto al asignado | Medición cronometrada, situación actual vs. con la ficha |
| Dispersión de la carga entre equipos | Diferencia entre el profesional con más y con menos pacientes |
| Ocupación de la clínica de día por franja | Pacientes atendidos por franja sobre capacidad disponible |
| Días de retraso acumulado entre ciclos | Fecha prevista según esquema vs. fecha real registrada |

---

## Uso de inteligencia artificial generativa

Este proyecto se desarrolló con apoyo de herramientas de IA generativa, declarado formalmente en el Anexo 2 de la hackatón.

- **Lovable** — generación y modificación de código a partir de especificaciones funcionales redactadas por el equipo.
- **Claude (Anthropic)** — apoyo en investigación documental, estructuración metodológica y redacción.

**La definición del problema no fue generada por IA:** proviene de la mentoría con un especialista del INSN San Borja. Todo el código fue verificado funcionalmente por el equipo y las cifras citadas se contrastaron con su fuente primaria. No se ingresó información real de pacientes ni datos institucionales restringidos a ninguna herramienta.

---

## Equipo

**ILLARI** — Pontificia Universidad Católica del Perú

| Integrante | Aporte |
|---|---|
| David Sung Ching Sato | Coordinación · Sistemas embebidos y procesamiento de señales |
| Renzo Giancarlo Aliaga Sinche | Visión computacional e IA aplicada |
| Zhaid Simon Condori Chocce | Instrumentación biomédica y adquisición de señales |

Con la mentoría de especialistas del INSN San Borja.

---

## Licencia

[MIT](LICENSE) — se permite consulta, uso, adaptación y redistribución, reconociendo la autoría.

---

## Contexto

Desarrollado durante la **Hackatón Niño San Borja 2026**, organizada por el Instituto Nacional de Salud del Niño San Borja en articulación con la Secretaría de Gobierno y Transformación Digital de la PCM, la Pontificia Universidad Católica del Perú y la Universidad ESAN.

**Demo:** https://illari.lovable.app/
