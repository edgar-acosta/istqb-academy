import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { EvaluationResult } from "@/components/EvaluationResult";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";

type Draft = {
  id: number;
  revision: number;
  courseVersion: string;
  questions: { id: string; module: number; question: string; options: string[] }[];
  answers: Record<string, number>;
};

export default function QuizPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [submitted, setSubmitted] = useState<inferRouterOutputs<AppRouter>["learning"]["submit"] | null>(null);
  const utils = trpc.useUtils();
  const save = trpc.learning.save.useMutation({ onSuccess: setDraft });
  const start = trpc.learning.start.useMutation({ onSuccess: (value) => { setDraft(value); save.reset(); submit.reset(); } });
  const submit = trpc.learning.submit.useMutation({
    onSuccess: (result) => {
      setSubmitted(result);
      setDraft(null);
      void utils.learning.overview.invalidate();
      void utils.learning.attempts.invalidate();
    },
  });
  const abandon = trpc.learning.abandon.useMutation({
    onSuccess: () => { setDraft(null); start.reset(); save.reset(); submit.reset(); void utils.learning.overview.invalidate(); },
  });

  if (isLoading) return <p>Cargando…</p>;
  if (!isAuthenticated) return <p>Inicia sesión para continuar. <Link className="underline" to="/login">Iniciar sesión</Link></p>;
  if (submitted !== null) return <EvaluationResult result={submitted} onRetry={() => { setSubmitted(null); start.reset(); save.reset(); submit.reset(); }} />;
  const answered = draft ? Object.keys(draft.answers).length : 0;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif">Evaluación de conocimiento</h1>
      <p>Diez preguntas, una por módulo. Las respuestas se guardan en tu cuenta y puedes reanudar el intento. No hay límite de tiempo.</p>
      <p className="border border-border bg-secondary p-4 text-sm">
        Caso ficticio: N-101 pertenece a Norte y S-201 a Sur. Cada usuario consulta solo su flota autorizada.
        Una lectura se considera desactualizada cuando su hora de evento supera cinco minutos de antigüedad.
      </p>
      {!draft ? (
        <div className="space-y-3">
          <Button onClick={() => start.mutate()} disabled={start.isPending}>Iniciar o reanudar evaluación</Button>
          {start.isError && <p role="alert" className="text-destructive">{start.error.message}</p>}
        </div>
      ) : (
        <>
          <p aria-live="polite">Respondidas y guardadas: {answered}/{draft.questions.length}. {save.isPending ? "Guardando…" : ""}</p>
          {save.isError && (
            <div role="alert" className="text-destructive">
              No se guardó la respuesta: {save.error.message}{" "}
              <button type="button" className="underline" onClick={() => start.mutate()}>Recargar estado guardado</button>
            </div>
          )}
          <ol className="space-y-5">
            {draft.questions.map((q, index) => (
              <li key={q.id} className="border border-border">
                <fieldset disabled={save.isPending || submit.isPending || save.isError}>
                  <legend className="w-full bg-secondary p-4 font-medium">{index + 1}. {q.question} <span className="text-xs">(módulo {q.module})</span></legend>
                  <div className="space-y-2 p-4">
                    {q.options.map((option, choice) => (
                      <label key={option} className="flex items-start gap-3 border p-3 cursor-pointer">
                        <input type="radio" name={q.id} checked={draft.answers[q.id] === choice}
                          onChange={() => save.mutate({ id: draft.id, revision: draft.revision, questionId: q.id, choice })}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <Button disabled={answered !== draft.questions.length || save.isPending || save.isError || submit.isPending}
            onClick={() => { if (window.confirm("¿Enviar la evaluación? No podrás modificar este intento después.")) submit.mutate({ id: draft.id, revision: draft.revision }); }}>
            {submit.isPending ? "Enviando…" : "Enviar evaluación"}
          </Button>
          {submit.isError && <p role="alert" className="text-destructive">No se pudo confirmar el envío: {submit.error.message} <button type="button" className="underline" onClick={() => submit.mutate({ id: draft.id, revision: draft.revision })}>Comprobar el envío</button> o <Link className="underline" to="/mi-aprendizaje">consultar mi historial</Link>.</p>}
          <div>
            <Button variant="outline" disabled={save.isPending || submit.isPending || abandon.isPending}
              onClick={() => { if (window.confirm("¿Abandonar este borrador? Las respuestas guardadas ya no podrán reanudarse.")) abandon.mutate({ id: draft.id, revision: draft.revision }); }}>
              Abandonar borrador
            </Button>
            {abandon.isError && <p role="alert" className="text-destructive">{abandon.error.message} <button type="button" className="underline" onClick={() => start.mutate()}>Recargar estado</button></p>}
          </div>
        </>
      )}
      <p><Link className="underline" to="/mi-aprendizaje">Ir a mi aprendizaje</Link></p>
    </div>
  );
}
