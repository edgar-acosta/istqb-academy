import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { getModule, MODULES } from "@/content";
import { BlockRenderer } from "@/components/BlockRenderer";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Lightbulb,
  ListChecks,
  LogIn,
  BookMarked,
  Target,
} from "lucide-react";

export default function ModulePage() {
  const { id } = useParams<{ id: string }>();
  const moduleId = Number(id);
  const module = getModule(moduleId);

  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const progressQuery = trpc.training.progress.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const completedIds = useMemo(
    () => new Set((progressQuery.data ?? []).map((p) => p.moduleId)),
    [progressQuery.data]
  );
  const isCompleted = completedIds.has(moduleId);

  const setCompleted = trpc.training.setModuleCompleted.useMutation({
    onSuccess: () => utils.training.progress.invalidate(),
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [moduleId]);

  if (!module) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold">Módulo no encontrado</h1>
        <p className="text-muted-foreground">
          El módulo solicitado no existe.{" "}
          <Link to="/contenido" className="underline underline-offset-4">
            Volver al índice
          </Link>
          .
        </p>
      </div>
    );
  }

  const prev = module.id > 1 ? getModule(module.id - 1) : undefined;
  const next = module.id < MODULES.length ? getModule(module.id + 1) : undefined;

  return (
    <article className="space-y-10">
      <header className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--accent))] font-semibold">
          Módulo {String(module.id).padStart(2, "0")} · {module.minutes} min de lectura
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
          {module.title}
        </h1>
        <p className="mt-4 text-[15px] md:text-base leading-7 text-muted-foreground">
          {module.intro}
        </p>
      </header>

      <aside className="border border-border bg-secondary p-5 text-sm leading-6">
        <strong>Caso didáctico ficticio:</strong> la flota Norte tiene el tractocamión N-101 y la
        flota Sur tiene S-201. Cada usuario solo puede consultar su flota autorizada. En estos
        ejercicios, una lectura se muestra desactualizada cuando su hora de evento supera cinco
        minutos de antigüedad; no se considera una ubicación actual. Se usan horas de evento UTC;
        la hora local de presentación depende de la configuración acordada. Lecturas tardías,
        duplicadas o fuera de orden requieren reglas adicionales. Los datos, tiempos y reglas
        son ilustrativos y deben acordarse para una plataforma real. Usa solo datos sintéticos
        y no provoques acciones en vehículos ni servicios reales.
      </aside>

      <section aria-labelledby="objetivos-modulo" className="border border-border p-5">
        <h2 id="objetivos-modulo" className="font-serif text-lg font-semibold flex items-center gap-2 mb-3">
          <Target className="h-4.5 w-4.5 text-[hsl(var(--accent))]" aria-hidden />
          Objetivos de aprendizaje del módulo
        </h2>
        <ul className="space-y-2">
          {module.objectives.map((obj, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-7">
              <span className="mt-[11px] h-1.5 w-1.5 shrink-0 bg-[hsl(var(--accent))]" aria-hidden />
              {obj}
            </li>
          ))}
        </ul>
      </section>

      <div className="guide-prose space-y-4">
        {module.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>

      <section aria-labelledby="ejemplo" className="border border-border">
        <h2
          id="ejemplo"
          className="flex items-center gap-2 border-b border-border bg-secondary px-5 py-3 font-serif text-lg font-semibold"
        >
          <Lightbulb className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          {module.example.title}
        </h2>
        <p className="px-5 py-4 text-[15px] md:text-base leading-7">{module.example.body}</p>
      </section>

      <section aria-labelledby="actividad" className="border border-border">
        <h2
          id="actividad"
          className="flex items-center gap-2 border-b border-border bg-secondary px-5 py-3 font-serif text-lg font-semibold"
        >
          <ClipboardList className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          {module.activity.title}
        </h2>
        <div className="px-5 py-4">
          <p className="text-[15px] md:text-base leading-7">{module.activity.scenario}</p>
          <p className="mt-4 mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Preguntas de reflexión
          </p>
          <ol className="space-y-3">
            {module.activity.questions.map((q, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-7">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-background text-xs font-semibold tabular-nums mt-0.5">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="resumen" className="border border-border">
        <h2
          id="resumen"
          className="flex items-center gap-2 border-b border-border bg-secondary px-5 py-3 font-serif text-lg font-semibold"
        >
          <ListChecks className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          Resumen — tres puntos clave
        </h2>
        <ol className="divide-y divide-border">
          {module.keyPoints.map((kp, i) => (
            <li key={i} className="flex gap-4 px-5 py-3.5 text-[15px] leading-7">
              <span className="font-serif text-xl font-semibold text-[hsl(var(--accent))] tabular-nums w-6 shrink-0">
                {i + 1}
              </span>
              {kp}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="fuentes-modulo" className="text-sm">
        <h2 id="fuentes-modulo" className="flex items-center gap-2 font-semibold mb-2">
          <BookMarked className="h-4 w-4 text-[hsl(var(--accent))]" aria-hidden />
          Fuentes citadas en este módulo
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-6">
          {module.sources.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <div className="border-t border-border pt-6 flex flex-col gap-4">
        {isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() =>
                setCompleted.mutate({ moduleId: module.id, completed: !isCompleted })
              }
              disabled={setCompleted.isPending || progressQuery.isLoading || progressQuery.isError}
              variant={isCompleted ? "outline" : "default"}
              className="gap-2"
            >
              <Check className="h-4 w-4" aria-hidden />
              {isCompleted ? "Completado (clic para desmarcar)" : "Marcar módulo como completado"}
            </Button>
            {setCompleted.isError && <p role="alert" className="text-destructive">No se pudo guardar el progreso: {setCompleted.error.message}</p>}
            {progressQuery.isError && <p role="alert" className="text-destructive">No se pudo consultar el progreso. <button className="underline" onClick={() => void progressQuery.refetch()}>Reintentar</button></p>}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 border border-dashed border-border px-4 py-3">
            <p className="text-sm text-muted-foreground leading-6 flex-1 min-w-48">
              Inicia sesión para guardar tu progreso en la guía.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" aria-hidden />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        )}

        <nav aria-label="Navegación entre módulos" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prev ? (
            <Link
              to={`/modulo/${prev.id}`}
              className="group flex items-center gap-3 border border-border px-4 py-3 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Anterior · {String(prev.id).padStart(2, "0")}
                </span>
                <span className="block text-sm font-medium leading-snug line-clamp-2">
                  {prev.title}
                </span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/modulo/${next.id}`}
              className="group flex items-center justify-end gap-3 border border-border px-4 py-3 text-right hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Siguiente · {String(next.id).padStart(2, "0")}
                </span>
                <span className="block text-sm font-medium leading-snug line-clamp-2">
                  {next.title}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
            </Link>
          ) : (
            <Link
              to="/evaluacion"
              className="group flex items-center justify-end gap-3 border border-border bg-secondary px-4 py-3 text-right hover:bg-secondary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wider text-[hsl(var(--accent))]">
                  Ir a la evaluación final
                </span>
                <span className="block text-sm font-medium leading-snug">
                  10 preguntas con respuesta justificada
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" aria-hidden />
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
