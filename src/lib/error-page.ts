export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="es-PE">
  <head>
    <meta charset="utf-8" />
    <title>No se pudo cargar esta pantalla</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 16px/1.5 system-ui, -apple-system, sans-serif; background: #f7f9fa; color: #14232e; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #40525e; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { min-height: 2.75rem; padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #1f5566; color: #fff; }
      .secondary { background: #fff; color: #14232e; border-color: #c3ced4; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>No se pudo cargar esta pantalla</h1>
      <p>Ocurrió un problema al mostrar la información. Puedes reintentar o volver al inicio.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Reintentar</button>
        <a class="secondary" href="/">Volver al inicio</a>
      </div>
      <p style="margin-top:1.5rem;font-size:0.875rem;">Prototipo demostrativo · Datos sintéticos · Sin información real de pacientes</p>
    </div>
  </body>
</html>`;
}
