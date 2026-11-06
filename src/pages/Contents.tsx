import { DOCUMENT, MODULES } from "@/content";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Check } from "lucide-react";

export default function Contents() {
  const { isAuthenticated } = useAuth();
  const progressQuery = trpc.training.progress.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const completed = new Set((progressQuery.data ?? []).map((p) => p.moduleId));

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--accent))] font-semibold">
          Índice
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Tabla de contenido
        </h1>
        <p className="mt-3 text-[15px] md:text-base text-muted-foreground leading-7 max-w-2xl">
          Estructura completa de la guía. Cada módulo incluye introducción, objetivos de
          aprendizaje, desarrollo conceptual con definiciones formales, ejemplo práctico en un
          plataforma ficticia de telemetría multiflota, actividad de aplicación y resumen de tres puntos clave.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          El progreso de esta versión debe marcarse de nuevo. El progreso anterior se conserva
          como histórico, pero no cuenta para el reconocimiento vigente.
        </p>
      </header>

      <section aria-labelledby="control">
        <h2 id="control" className="font-serif text-xl font-semibold mb-3">
          Control de documento
        </h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm md:text-[15px]">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-3 py-2.5 border-b border-border font-semibold">Versión</th>
                <th className="text-left px-3 py-2.5 border-b border-border font-semibold">Fecha</th>
                <th className="text-left px-3 py-2.5 border-b border-border font-semibold">Autor</th>
                <th className="text-left px-3 py-2.5 border-b border-border font-semibold">Cambios</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENT.control.map((row) => (
                <tr key={row.version}>
                  <td className="px-3 py-2.5 border-b border-border/60 tabular-nums">{row.version}</td>
                  <td className="px-3 py-2.5 border-b border-border/60">{row.fecha}</td>
                  <td className="px-3 py-2.5 border-b border-border/60">{row.autor}</td>
                  <td className="px-3 py-2.5 border-b border-border/60">{row.cambios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="tdd-toc">
        <h2 id="tdd-toc" className="font-serif text-xl font-semibold mb-3">
          Contenido
        </h2>
        <nav aria-label="Tabla de contenido">
          <ol className="border border-border divide-y divide-border">
            {MODULES.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/modulo/${m.id}`}
                  className="group flex gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-serif text-2xl font-semibold tabular-nums text-[hsl(var(--accent))] w-9 shrink-0">
                    {String(m.id).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold leading-snug">{m.title}</span>
                      {completed.has(m.id) && (
                        <Check className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" aria-label="Completado" />
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground leading-6">
                      {m.intro}
                    </span>
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {m.minutes} min · objetivos · ejemplo práctico · actividad · 3 puntos clave
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section aria-labelledby="recursos-toc">
        <h2 id="recursos-toc" className="font-serif text-xl font-semibold mb-3">
          Recursos finales
        </h2>
        <div className="border border-border divide-y divide-border">
          <Link
            to="/evaluacion"
            className="flex gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-serif text-2xl font-semibold tabular-nums text-[hsl(var(--accent))] w-9 shrink-0">E</span>
            <span>
              <span className="font-semibold">Evaluación de conocimiento</span>
              <span className="mt-1 block text-sm text-muted-foreground leading-6">
                10 preguntas de opción múltiple con respuesta justificada. Se califica en el
                servidor y se guarda tu historial de intentos.
              </span>
            </span>
          </Link>
          <Link
            to="/glosario"
            className="flex gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-serif text-2xl font-semibold tabular-nums text-[hsl(var(--accent))] w-9 shrink-0">G</span>
            <span>
              <span className="font-semibold">Glosario de términos</span>
              <span className="mt-1 block text-sm text-muted-foreground leading-6">
                Error, defecto, falla, cobertura, severidad, prioridad y más, ordenados
                alfabéticamente con fuente indicada y notas sobre usos divergentes.
              </span>
            </span>
          </Link>
          <Link
            to="/referencias"
            className="flex gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-serif text-2xl font-semibold tabular-nums text-[hsl(var(--accent))] w-9 shrink-0">R</span>
            <span>
              <span className="font-semibold">Referencias y recursos</span>
              <span className="mt-1 block text-sm text-muted-foreground leading-6">
                Fuentes citadas en la guía, syllabus utilizado y ruta para profundizar.
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
