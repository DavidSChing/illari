# ILLARI — Capa de continuidad asistencial

**Que ningún niño se pierda entre dos citas.**

[![Demo](https://img.shields.io/badge/demo-illari.lovable.app-0B5A7A?style=for-the-badge)](https://illari.lovable.app/)
[![Licencia](https://img.shields.io/badge/licencia-MIT-1C7293?style=for-the-badge)](LICENSE)
[![Datos](https://img.shields.io/badge/datos-100%25%20sint%C3%A9ticos-4C8C4A?style=for-the-badge)](#datos-y-privacidad)

Solución desarrollada para la **Hackatón Niño San Borja 2026** del Instituto Nacional de Salud del Niño San Borja, en el **Desafío 3 — Ruta Hematológica: continuidad y calidad para cada paciente**.

---

## El problema

> **12,7 %** de los pacientes de hematología y quimioterapia del INSN San Borja abandona el tratamiento *(dato del servicio, 2025)*.
> El promedio nacional es **8,5 %** *(MINSA, reportado por OPS/OMS, 2021)*.

En la Unidad de Hematología Pediátrica cada paciente tiene un médico principal y un médico de soporte. Cuando ninguno de los dos está disponible, la consulta la atiende un **tercer médico de turno** que debe reconstruir manualmente el estado del tratamiento desde hojas de cálculo antes de definir la conducta.

Ocurre en la fase ambulatoria, entre ciclos — donde el propio servicio identifica el mayor riesgo de interrupción del seguimiento. El efecto se acumula: consultas más lentas y con menos contexto, y familias que viajan desde regiones pagando pasaje, alojamiento y una jornada de trabajo que el SIS no cubre, con la sensación de que el viaje no rindió.

A eso se suman tres brechas de organización que el servicio identificó: sin visibilidad de la carga de pacientes por profesional, distribución desigual de esa carga, y demanda de la clínica de día concentrada en pocas franjas horarias.

> El punto de quiebre que estructura esta solución fue identificado en **mentoría con un especialista en hematología pediátrica del INSN San Borja**. No es un supuesto del equipo.

---

## La solución

**ILLARI es una capa de lectura sobre el registro de citas que el servicio ya produce.** No cambia el proceso de nadie: lee el archivo que el equipo ya llena, lo consolida y lo organiza.

El médico registra por cita los mismos datos que registra hoy. A partir de ellos, ILLARI **deriva automáticamente**:

- Ciclo y fase del tratamiento
- Días de retraso frente al calendario del esquema
- Alertas activas
- Carga de pacientes por profesional
- Propuesta de distribución de la jornada ambulatoria

**Ninguno de esos elementos se digita. Se calculan.**

### Por qué es distinta de lo que ya existe

| | Detecta retraso y riesgo de abandono | Organiza la programación de quimioterapia | Traspaso de información entre médicos |
|---|:--:|:--:|:--:|
| **IMPACTO** (MINSA–OPS) | Sí | No | No |
| Otras soluciones de seguimiento | No | No | No |
| **ILLARI** | **Sí** | **Sí** | **Sí** |

Todo lo desplegado hoy actúa **después** de que el paciente falta a la atención. ILLARI opera sobre las condiciones de organización previas que producen esa falta. Son complementarias, no sustitutas.

### Principios de diseño

| Principio | Cómo se implementa |
|---|---|
| **El sistema muestra, el médico decide** | No calcula ni sugiere dosis. No determina si un ciclo procede. Toda sugerencia está rotulada en la interfaz |
| **Solo lectura** | El archivo del servicio nunca se modifica. Sigue siendo la fuente de verdad |
| **Sin inferencias silenciosas** | Ante un valor no interpretable, lo reporta en lugar de deducirlo. Ante registros discrepantes, muestra ambos y los devuelve al equipo |
| **Trazabilidad** | Cada dato indica su archivo y fila de origen |
| **Procesamiento local** | El archivo se lee dentro del navegador. No se transmite a ningún servidor |
| **Adopción reversible** | Si se descontinúa, el registro original permanece intacto |

---

## Módulos

**1 · Ficha de Continuidad**
Pantalla única por paciente: fase y ciclo, alertas activas, laboratorio con semáforo por umbral, última administración, responsables y próximo paso sugerido según el esquema. Si el profesional que consulta no pertenece a la dupla del paciente, la interfaz lo advierte.

**2 · Lectura del registro de citas**
Carga del archivo `.xlsx` que el servicio ya utiliza. Reconoce variantes de nomenclatura de columnas y formatos de fecha heterogéneos.

**3 · Programación sugerida de la clínica de día**
Distribuye la jornada en bloques que ocupan la capacidad disponible. El orden **no expresa gravedad clínica**: expresa prioridad de espera. A igualdad de condiciones, se prioriza a quien enfrenta mayor tiempo de traslado. Toda propuesta es ajustable y cada ajuste queda registrado.

**4 · Carga médica y pacientes con ciclo retrasado**
Distribución de pacientes por profesional y listado de quienes presentan retraso respecto del calendario de su esquema. Información que hoy existe dispersa y que nadie puede consultar de forma agregada.

**5 · Vista para el responsable del paciente**
Interfaz móvil simplificada: próxima cita, preparación, señales de alarma, calendario del tratamiento y confirmación de asistencia. Incluye gestión de contactos y recordatorios por mensaje de texto **una semana, tres días y un día antes** — plazo pensado para que una familia de provincia pueda organizar y costear el viaje.

Diseñada según criterios del [NHS Digital Service Manual](https://service-manual.nhs.uk/design-system) y del [GOV.UK Design System](https://design-system.service.gov.uk/), estándares de accesibilidad de servicios públicos de salud.

---

## Viabilidad

| | |
|---|---|
| **S/ 0** | de inversión en infraestructura, servidores o licencias |
| **0 h** | de capacitación: el personal sigue trabajando igual |
| **0** | datos nuevos que alguien deba registrar |
| **100 %** | reversible: el registro original permanece intacto |

Corre en un navegador. Sin backend, sin base de datos, sin autenticación. Todas las dependencias son de código abierto.

---

## Cómo ejecutarlo

**Requisitos:** Node.js 18 o superior.

```bash
git clone https://github.com/DavidSChing/illari.git
cd illari
npm install
npm run dev
```

Abrir `http://localhost:5173`. Para producción: `npm run build && npm run preview`.

No requiere base de datos, variables de entorno ni servicios externos.

---

## Cómo adaptarlo a otro servicio

Cada servicio registra campos distintos por cita. En ILLARI están centralizados en un único archivo:

```
src/config/camposCita.ts
```

Modificarlo adapta simultáneamente **el formulario de registro, el lector de Excel y la exportación**, sin tocar ningún componente de la interfaz.

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
]
```

`sinonimosExcel` permite que el lector reconozca la nomenclatura que cada servicio ya usa, sin pedirle que renombre nada.

**Este es el mecanismo de escalabilidad:** trasladar la solución a otro servicio con ruta de citas programadas es cambiar configuración, no desarrollar un sistema nuevo.

---

## Componentes reutilizables

Publicados bajo licencia MIT para consulta, uso, adaptación y redistribución:

| Componente | Ubicación | Utilidad fuera de este proyecto |
|---|---|---|
| **Configuración de campos** | `src/config/camposCita.ts` | Adaptar captura y lectura a cualquier registro de citas |
| **Lector tolerante de Excel** | `src/lib/` | Leer hojas con nomenclatura y formatos heterogéneos |
| **Algoritmo de programación** | `src/lib/programacion.ts` | Distribuir citas en bloques por prioridad y capacidad. Función pura, parametrizable |
| **Datos sintéticos** | `src/data/`, `public/` | Probar soluciones similares sin usar datos reales |

---

## Datos y privacidad

Todos los datos incluidos —pacientes, profesionales, esquemas y registros de citas— son **sintéticos, generados por el equipo** para la demostración. Es una decisión de diseño alineada con las consideraciones éticas de las bases de la hackatón.

- No se utilizó información real de pacientes, historias clínicas ni datos identificables.
- Los esquemas de tratamiento son ficticios y están rotulados como tales en la interfaz.
- El repositorio no contiene credenciales ni información institucional restringida.
- La lectura de archivos ocurre en el navegador del usuario; nada se transmite a servidores externos.

---

## Impacto esperado y medición

Indicadores propuestos para el piloto:

| Indicador | Cómo se mide | Línea base |
|---|---|---|
| Tasa de abandono en la unidad | Registro institucional del servicio | **12,7 %** (2025) |
| Tiempo de reconstrucción del estado de un paciente | Medición cronometrada, situación actual vs. con la ficha | A construir |
| Dispersión de carga entre equipos | Diferencia entre el profesional con más y con menos pacientes | A construir |
| Ocupación de la clínica de día por franja | Pacientes atendidos por franja sobre capacidad disponible | A construir |
| Días de retraso acumulado entre ciclos | Fecha prevista según esquema vs. fecha real | A construir |

El servicio no cuenta hoy con estas mediciones sistematizadas. **Construir esa línea base es en sí mismo un producto del piloto.**

---

## Roadmap

**Corto plazo — piloto (90 días).** Implementación en la Unidad de Hematología Pediátrica con el registro real del servicio, previa autorización institucional. Ajuste de los campos a los que efectivamente usa el equipo y construcción de la línea base de indicadores.

**Mediano plazo.** Lectura automática desde carpeta compartida institucional, sin carga manual. Incorporación de Servicio Social al flujo de avisos. Envío efectivo de mensajes por el canal institucional disponible. Persistencia de datos y modelo de estratificación de riesgo de interrupción del seguimiento.

**Largo plazo.** Extensión a otros servicios ambulatorios del instituto e integración progresiva con los sistemas de información existentes, en el marco de la Ley de Gobierno Digital (D.L. 1412).

---

## Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui (MIT) · SheetJS (Apache 2.0)

Sin backend. Sin base de datos. Sin autenticación. Todas las dependencias de código abierto; sus licencias se conservan en `package.json`.

---

## Uso de inteligencia artificial generativa

Declarado formalmente en el Anexo 2 de la hackatón. Se emplearon **Lovable** para la generación de código a partir de especificaciones funcionales redactadas por el equipo, y **Claude (Anthropic)** como apoyo en investigación, estructuración metodológica y redacción.

La definición del problema proviene de la mentoría con un especialista del INSN San Borja. Todo el código fue verificado funcionalmente por el equipo y las cifras se contrastaron con su fuente primaria. No se ingresó información real de pacientes ni datos institucionales restringidos a ninguna herramienta.

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

[MIT](LICENSE) — consulta, uso, adaptación y redistribución, reconociendo la autoría.

---

Desarrollado durante la **Hackatón Niño San Borja 2026**, organizada por el Instituto Nacional de Salud del Niño San Borja con la Secretaría de Gobierno y Transformación Digital de la PCM, la Pontificia Universidad Católica del Perú y la Universidad ESAN.

**Demo:** https://illari.lovable.app/
