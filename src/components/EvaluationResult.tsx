import { useRef, useState } from "react";
import { Link } from "react-router";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";
import { getModule, MODULES } from "@/content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";

type Result = inferRouterOutputs<AppRouter>["learning"]["submit"];

export function EvaluationResult({ result, onRetry, compact = false }: { result: Result; onRetry: () => void; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [issuedFolio, setIssuedFolio] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reopenRef = useRef<HTMLButtonElement>(null);
  const passed = result.score * 100 >= result.total * result.passingPercent;
  const reviewIds = [...new Set(result.questions.filter((q) => !q.correct).map((q) => q.module))];
  const utils = trpc.useUtils();
  const overview = trpc.learning.overview.useQuery(undefined, {
    enabled: passed && open,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
  const issue = trpc.learning.issue.useMutation();
  const currentOverview = overview.isFetchedAfterMount && !overview.isFetching && !overview.isError ? overview.data : undefined;
  const recognition = currentOverview?.courseVersion === result.courseVersion ? currentOverview.recognition : null;
  const folio = issuedFolio ?? recognition?.folio;
  const completedModuleIds = currentOverview?.courseVersion === result.courseVersion ? currentOverview.completedModuleIds : [];
  const missing = currentOverview?.courseVersion === result.courseVersion
    ? MODULES.filter((module) => !completedModuleIds.includes(module.id))
    : [];

  async function download(folioToDownload: string) {
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch(`/api/recognitions/${encodeURIComponent(folioToDownload)}/pdf`, { credentials: "same-origin" });
      if (!response.ok || !response.headers.get("content-type")?.toLowerCase().startsWith("application/pdf")) {
        throw new Error(`No se pudo obtener el PDF (respuesta ${response.status}).`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reconocimiento-${folioToDownload}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "No se pudo descargar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  async function emit() {
    if (!confirmed) return;
    try {
      const created = await issue.mutateAsync({ name });
      setIssuedFolio(created.folio);
      setShowForm(false);
      void utils.learning.overview.invalidate();
      await download(created.folio);
    } catch {
      // The mutation error is displayed in the form.
    }
  }

  return (
    <div className="space-y-4">
      {!compact && <><h1 className="text-3xl font-serif">Evaluación enviada</h1><p>Tu resultado quedó guardado: {result.score}/{result.total} aciertos.</p></>}
      <div className="flex flex-wrap gap-3">
        <Button ref={reopenRef} onClick={() => setOpen(true)}>Ver resultado</Button>
        {!compact && <><Link className="underline self-center" to={`/mi-aprendizaje/evaluaciones/${result.id}`}>Ver detalle del intento</Link><Link className="underline self-center" to="/mi-aprendizaje">Mi aprendizaje</Link></>}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" showCloseButton={false}
          onCloseAutoFocus={(event) => { event.preventDefault(); reopenRef.current?.focus(); }}>
          <DialogHeader>
            <DialogTitle>Resultado de tu evaluación</DialogTitle>
            <DialogDescription>Versión {result.courseVersion} · Umbral de aprobación: {result.passingPercent} %</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-secondary p-4 space-y-2">
            <p className="text-3xl font-semibold">{result.score}/{result.total} <span className="text-lg">aciertos · {Math.round(result.score * 100 / result.total)} %</span></p>
            <p className="font-semibold">{passed ? "¡Aprobaste la evaluación!" : "No alcanzaste el mínimo requerido en esta ocasión."}</p>
          </div>
          {!passed && (
            <div className="space-y-2">
              <p>Te sugerimos repasar los temas de las preguntas incorrectas:</p>
              <ul className="list-disc pl-5">
                {reviewIds.map((id) => {
                  const module = getModule(id);
                  return <li key={id}>{module ? <Link className="underline" to={`/modulo/${id}`}>Módulo {id}: {module.title}</Link> : `Módulo ${id}: contenido no disponible`}</li>;
                })}
              </ul>
              <p className="text-sm">Una respuesta incorrecta señala un tema para revisar, no define tu dominio del módulo.</p>
              <Button variant="outline" onClick={onRetry}>Intentar de nuevo</Button>
            </div>
          )}
          {passed && (
            <div className="space-y-3" aria-live="polite">
              {(overview.isFetching || !overview.isFetchedAfterMount) && !overview.isError && !issuedFolio && <p>Comprobando los requisitos del reconocimiento…</p>}
              {overview.isError && !issuedFolio && <p role="alert">No se pudo comprobar el reconocimiento. <button className="underline" onClick={() => void overview.refetch()}>Reintentar</button></p>}
              {currentOverview && currentOverview.courseVersion !== result.courseVersion && !issuedFolio && (
                <p>No se pudo comprobar la elegibilidad para esta versión. Consulta «Mi aprendizaje».</p>
              )}
              {folio && (
                <div className="space-y-2">
                  <p>Tu reconocimiento interno está disponible.</p>
                  <Button disabled={downloading} onClick={() => void download(folio)}>{downloading ? "Preparando PDF…" : "Descargar reconocimiento PDF"}</Button>
                </div>
              )}
              {!folio && currentOverview?.courseVersion === result.courseVersion && (
                currentOverview.eligible ? (
                  showForm ? (
                    <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void emit(); }}>
                      <label className="block" htmlFor="result-recognition-name">Nombre que aparecerá en el PDF</label>
                      <input id="result-recognition-name" className="w-full border p-2" value={name} onChange={(event) => { setName(event.target.value); setConfirmed(false); }} maxLength={100} required />
                      <p className="text-sm">Vista previa: {name || "Tu nombre"} · ISTQB and Shiftleft Academy. Tu nombre se guardará en el reconocimiento; la corrección estará disponible en una fase posterior.</p>
                      <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Confirmo que el nombre es correcto.</label>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={!confirmed || issue.isPending}>{issue.isPending ? "Emitiendo…" : "Confirmar y descargar"}</Button>
                        <Button type="button" variant="outline" disabled={issue.isPending} onClick={() => setShowForm(false)}>Cancelar</Button>
                      </div>
                      {issue.isError && <p role="alert" className="text-destructive">No se pudo emitir el reconocimiento: {issue.error.message}</p>}
                    </form>
                  ) : <Button onClick={() => { issue.reset(); setShowForm(true); }}>Obtener y descargar mi reconocimiento</Button>
                ) : (
                  <div className="space-y-2">
                    <p>Aprobaste la evaluación; aún faltan requisitos para obtener tu reconocimiento.</p>
                    {missing.length > 0 && <><p>Módulos pendientes:</p><ul className="list-disc pl-5">{missing.map((module) => <li key={module.id}><Link className="underline" to={`/modulo/${module.id}`}>Módulo {module.id}: {module.title}</Link></li>)}</ul></>}
                    <p>Después de completarlos podrás obtenerlo desde «Mi aprendizaje», sin repetir la evaluación.</p>
                  </div>
                )
              )}
              {downloadError && <p role="alert" className="text-destructive">{downloadError} Puedes reintentar la descarga.</p>}
              <p className="text-sm">El reconocimiento es interno; no es una certificación ni un aval oficial de ISTQB.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t pt-4">
            <Link className="underline" to={`/mi-aprendizaje/evaluaciones/${result.id}`}>Ver detalle y explicaciones</Link>
            <Link className="underline" to="/mi-aprendizaje">Mi aprendizaje</Link>
            <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
