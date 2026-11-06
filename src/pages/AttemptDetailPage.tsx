import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";
import { EvaluationResult } from "@/components/EvaluationResult";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

type Question = { id: string; module: number; question: string; options: string[]; correctIndex: number; justification: string; chosen: number; correct: boolean };
type Detail = { score: number; total: number; submittedAt: Date | null; questions: Question[] };

function Results({ detail, version, passingPercent, currentResult }: { detail: Detail; version: string; passingPercent?: number; currentResult?: inferRouterOutputs<AppRouter>["learning"]["detail"] }) {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const questions = detail.questions.filter((q) => filter === "all" || (filter === "correct" ? q.correct : !q.correct));
  const correctCount = detail.questions.filter((q) => q.correct).length;
  const incorrectCount = detail.questions.length - correctCount;
  const moduleCount = new Set(detail.questions.map((q) => q.module)).size;
  const passed = passingPercent !== undefined && detail.score * 100 >= detail.total * passingPercent;
  return (
    <div className="space-y-6">
      <Link className="underline" to="/mi-aprendizaje">← Mi aprendizaje</Link>
      <h1 className="font-serif text-3xl">Resultado de la evaluación</h1>
      {currentResult && <EvaluationResult result={currentResult} compact onRetry={() => navigate("/evaluacion")} />}
      <section className="rounded-lg border bg-secondary p-5 space-y-3">
        <p className="text-sm">{version} · {detail.submittedAt ? new Date(detail.submittedAt).toLocaleString("es-MX") : "Fecha no disponible"}</p>
        <p className="text-3xl font-semibold">{detail.score}/{detail.total} <span className="text-lg">aciertos · {Math.round(detail.score * 100 / detail.total)} %</span></p>
        <p className="font-semibold">{passingPercent === undefined ? "Umbral histórico no disponible" : `${passed ? "Aprobada" : "No aprobada"} · Umbral: ${passingPercent} %`}</p>
        <p>{passingPercent === undefined ? "Este resultado histórico se conserva sin inferir su regla de aprobación." : passed ? "Aprobaste esta evaluación. Consulta en Mi aprendizaje los requisitos del reconocimiento." : "Revisa las respuestas señaladas y vuelve a intentarlo cuando estés preparado."}</p>
        <div className="flex flex-wrap gap-4">
          <a className="underline" href="#detalle-respuestas">Revisar respuestas</a>
          <Link className="underline" to={passed || passingPercent === undefined ? "/mi-aprendizaje" : "/evaluacion"}>{passed || passingPercent === undefined ? "Mi aprendizaje" : "Intentar de nuevo"}</Link>
        </div>
      </section>
      <section aria-label="Resumen del intento" className="grid gap-3 sm:grid-cols-3">
        <p className="rounded border p-4">Correctas: <strong>{correctCount}</strong></p>
        <p className="rounded border p-4">Para repasar: <strong>{incorrectCount}</strong></p>
        <p className="rounded border p-4">Módulos con preguntas: <strong>{moduleCount}</strong></p>
      </section>
      <section id="detalle-respuestas" className="space-y-4">
        <h2 className="font-serif text-2xl">Detalle de respuestas</h2>
        <label htmlFor="question-filter">Mostrar preguntas </label>
        <select id="question-filter" className="border p-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas ({detail.questions.length})</option><option value="correct">Correctas ({correctCount})</option><option value="incorrect">Para repasar ({incorrectCount})</option>
        </select>
        <p aria-live="polite">{questions.length} preguntas mostradas.</p>
        {questions.length === 0 && <p>No hay preguntas en este filtro. <button className="underline" onClick={() => setFilter("all")}>Ver todas</button></p>}
        <ol className="space-y-4">{questions.map((q) => (
          <li key={q.id} className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-semibold">Pregunta {detail.questions.indexOf(q) + 1} · Módulo {q.module} · {q.correct ? "Correcta" : "Para repasar"}</p>
            <p className="font-medium">{q.question}</p>
            <ul className="space-y-2">{q.options.map((option, index) => (
              <li key={index} className="rounded border p-2">
                {option}{index === q.chosen && <strong> · Tu respuesta</strong>}{index === q.correctIndex && <strong> · Respuesta correcta</strong>}
              </li>
            ))}</ul>
            <div className="bg-secondary p-3"><strong>Por qué: </strong>{q.justification}</div>
            <Link className="underline" to={`/modulo/${q.module}`}>Repasar módulo vigente</Link>
          </li>
        ))}</ol>
      </section>
      <p className="text-sm">Una pregunta por módulo no demuestra el dominio completo del tema. El contenido vigente puede diferir de versiones históricas.</p>
      <Link className="underline" to="/mi-aprendizaje">Volver a mi aprendizaje</Link>
    </div>
  );
}

export default function AttemptDetailPage({ legacy = false }: { legacy?: boolean }) {
  const { id } = useParams();
  const attemptId = Number(id);
  const { isAuthenticated, isLoading } = useAuth();
  const enabled = isAuthenticated && Number.isInteger(attemptId) && attemptId > 0;
  const current = trpc.learning.detail.useQuery({ id: attemptId }, { enabled: enabled && !legacy, retry: false });
  const old = trpc.learning.legacyDetail.useQuery({ id: attemptId }, { enabled: enabled && legacy, retry: false });
  if (isLoading) return <p>Cargando…</p>;
  if (!isAuthenticated) return <p>Inicia sesión para ver el detalle. <Link className="underline" to="/login">Iniciar sesión</Link></p>;
  if (!enabled) return <p>Identificador de intento inválido.</p>;
  const query = legacy ? old : current;
  if (query.isLoading) return <p>Cargando detalle…</p>;
  if (query.isError) return <div role="alert"><p>No se pudo cargar el detalle: {query.error.message}</p><button className="underline" onClick={() => void query.refetch()}>Reintentar</button> · <Link className="underline" to="/mi-aprendizaje">Volver a mi aprendizaje</Link></div>;
  if (!query.data) return <div><p>Detalle histórico no disponible con certeza. La puntuación original sigue en el historial.</p><Link className="underline" to="/mi-aprendizaje">Volver al historial</Link></div>;
  return <Results detail={query.data} version={legacy ? "Evaluación histórica; versión de curso no verificable" : `Versión ${(current.data)?.courseVersion}`} passingPercent={legacy ? undefined : current.data?.passingPercent} currentResult={legacy ? undefined : current.data} />;
}
