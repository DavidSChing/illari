# ILLARI

PROYECTO: Prototipo demostrativo para la Hackatón del Instituto Nacional de

Salud del Niño San Borja (Perú), desafío de ruta asistencial en hematología

pediátrica.

PROBLEMA: Cada paciente tiene un médico principal y uno de soporte. Cuando

ninguno está disponible, lo atiende un tercer médico de turno que reconstruye

el estado del paciente desde un Excel antes de decidir el siguiente paso del

tratamiento. Eso hace la consulta lenta y con menos contexto, y desgasta a

familias que viajan desde provincia pagando pasaje, alojamiento y comida.

SOLUCIÓN: "Ficha de Continuidad", una sola pantalla que le muestra a cualquier

médico, en menos de 10 segundos, dónde está el paciente y cuál es el siguiente

paso.

PRINCIPIO RECTOR: el sistema MUESTRA, el médico DECIDE. Nunca sustituye el

criterio clínico. Esto debe ser visible en la interfaz.

REGLAS DURAS, aplican siempre:

- Toda la interfaz en español (Perú)

- React + TypeScript + Tailwind + shadcn/ui

- SIN backend, SIN Supabase, SIN autenticación, SIN base de datos

- Datos hardcodeados en src/data/, estado en memoria con React

- NO construir historia clínica electrónica, recetas, facturación, mensajería

  ni recordatorios automáticos

- NO agregar funcionalidades que no se hayan pedido explícitamente

- Accesibilidad obligatoria: contraste alto, tipografía grande, navegación por

  teclado, etiquetas ARIA

- Estética institucional y sobria de salud pública peruana. Nada de gradientes

  llamativos, emojis ni estilo landing page. Densidad de información alta pero

  ordenada: el usuario es un médico apurado

- Todos los datos son sintéticos e inventados. Ninguna información real de

  pacientes

Guarda esto como contexto del proyecto y respétalo en todo lo que construyas de aquí en adelante.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://illari.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/632b5916-5433-4cc2-8fd4-1ca87d614454).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
