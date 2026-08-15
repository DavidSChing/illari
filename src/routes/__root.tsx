import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BarraLateral } from "../components/layout/BarraLateral";
import { BarraInferior } from "../components/layout/BarraInferior";
import { BannerPrototipo } from "../components/layout/BannerPrototipo";
import { ProveedorEstadoClinico } from "../state/EstadoClinico";


function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-base text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Volver a la jornada de hoy
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          No se pudo cargar esta pantalla
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Ocurrió un problema al mostrar la información. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-base font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Volver a la jornada de hoy
          </a>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ficha de Continuidad · INSN San Borja" },
      {
        name: "description",
        content:
          "Prototipo demostrativo de ruta asistencial en hematología pediátrica con datos sintéticos.",
      },
      { property: "og:title", content: "Ficha de Continuidad · INSN San Borja" },
      {
        property: "og:description",
        content: "Prototipo demostrativo de ruta asistencial en hematología pediátrica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const rutaFamilia = useRouterState({
    select: (estado) => estado.location.pathname.startsWith("/familia"),
  });

  return (
    <QueryClientProvider client={queryClient}>
     <ProveedorEstadoClinico>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        {!rutaFamilia && <BarraLateral />}
        <div className="flex min-w-0 flex-1 flex-col">
          <BannerPrototipo compacto={rutaFamilia} />
          <main
            className={
              rutaFamilia
                ? "flex-1 px-3 py-2"
                : "flex-1 px-3 pb-24 pt-3 sm:px-4 md:px-6 md:pb-6"
            }
          >
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
        </div>
        {!rutaFamilia && <BarraInferior />}
      </div>
     </ProveedorEstadoClinico>
    </QueryClientProvider>
  );
}


