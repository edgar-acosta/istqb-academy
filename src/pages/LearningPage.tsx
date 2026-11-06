import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function LearningPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const overview = trpc.learning.overview.useQuery(undefined, { enabled: isAuthenticated });
  const [page, setPage] = useState(0);
  const attempts = trpc.learning.attempts.useQuery({ page }, { enabled: isAuthenticated });
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [folio, setFolio] = useState("");
  const [requestedFolio, setRequestedFolio] = useState("");
  const utils = trpc.useUtils();
  const issue = trpc.learning.issue.useMutation({ onSuccess: () => { void utils.learning.overview.invalidate(); } });
  const verify = trpc.learning.verify.useQuery({ folio: requestedFolio }, { enabled: user?.role === "admin" && requestedFolio.length === 40, retry: false });

  if (isLoading) return <p>Cargando…</p>;
  if (!isAuthenticated) return <p>Inicia sesión para consultar tu aprendizaje. <Link className="underline" to="/login">Iniciar sesión</Link></p>;
  if (overview.isLoading || attempts.isLoading) return <p>Cargando aprendizaje…</p>;
  if (overview.isError || attempts.isError || !overview.data || !attempts.data) return <div role="alert">No se pudo cargar tu aprendizaje. <button className="underline" onClick={() => { void overview.refetch(); void attempts.refetch(); }}>Reintentar</button></div>;

  const data = overview.data;
  const recognition = data.recognition;
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Mi aprendizaje</h1>
      <section className="border p-5 space-y-3">
        <h2 className="font-serif text-xl">Progreso · versión {data.courseVersion}</h2>
        <p>{data.completed} de {data.moduleTotal} módulos marcados como completados.</p>
        {data.historicalProgress > 0 && <p className="text-sm">Tienes {data.historicalProgress} marcas históricas sin versión verificable; no cuentan para el reconocimiento vigente.</p>}
        <Link className="underline" to="/contenido">Continuar módulos</Link>
      </section>
      <section className="border p-5 space-y-3">
        <h2 className="font-serif text-xl">Evaluación final</h2>
        <p>{data.draft ? `${data.draft.answered} de ${data.draft.total} respuestas guardadas; aún sin calificar.` : data.passed ? "Tienes una evaluación aprobada para esta versión." : "Aún no tienes una evaluación aprobada para esta versión."}</p>
        <Link className="underline" to="/evaluacion">{data.draft ? "Reanudar evaluación" : "Iniciar evaluación"}</Link>
      </section>
      <section className="border p-5 space-y-3">
        <h2 className="font-serif text-xl">Mi reconocimiento</h2>
        <p>Requisitos: marcar los diez módulos de esta versión y aprobar la evaluación interna con al menos 70 %. El documento no es una certificación ni un aval oficial ISTQB.</p>
        {recognition ? (
          <div className="space-y-2">
            <p>Emitido para {recognition.recipientName}. Folio: {recognition.folio}</p>
            <a className="underline" href={`/api/recognitions/${recognition.folio}/pdf`}>Descargar reconocimiento PDF</a>
          </div>
        ) : !data.eligible ? (
          <p>Pendiente: {data.completed}/{data.moduleTotal} módulos y evaluación {data.passed ? "aprobada" : "sin aprobar"}.</p>
        ) : (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (confirmed) issue.mutate({ name }); }}>
            <label className="block" htmlFor="recognition-name">Nombre que aparecerá en el PDF</label>
            <input id="recognition-name" className="border p-2 w-full" value={name} onChange={(e) => { setName(e.target.value); setConfirmed(false); }} maxLength={100} required />
            <p className="text-sm">Vista previa: {name || "Tu nombre"} · ISTQB and Shiftleft Academy. La corrección y revocación se incorporarán en una fase posterior.</p>
            <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> Confirmo que el nombre es correcto.</label>
            <Button type="submit" disabled={!confirmed || issue.isPending}>{issue.isPending ? "Emitiendo…" : "Emitir reconocimiento"}</Button>
            {issue.isError && <p role="alert" className="text-destructive">{issue.error.message}</p>}
          </form>
        )}
      </section>
      <section className="border p-5 space-y-3">
        <h2 className="font-serif text-xl">Mis intentos</h2>
        {attempts.data.items.length === 0 ? <p>Aún no hay intentos en esta página.</p> : (
          <ul className="space-y-2">{attempts.data.items.map((a) => (
            <li key={`${a.legacy ? "legacy" : "current"}-${a.id}`}>
              {a.date ? new Date(a.date).toLocaleString("es-MX") : "Fecha no disponible"} · {a.score}/{a.total} · {a.legacy ? "Histórico sin versión verificable" : `Versión ${a.courseVersion}`} ·{" "}
              <Link className="underline" to={`/mi-aprendizaje/evaluaciones/${a.legacy ? "historico/" : ""}${a.id}`}>Ver detalle</Link>
            </li>
          ))}</ul>
        )}
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span>Página {page + 1}</span>
          <Button variant="outline" disabled={!attempts.data.hasMore} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
        </div>
      </section>
      {user?.role === "admin" && (
        <section className="border p-5 space-y-3">
          <h2 className="font-serif text-xl">Consulta interna de folio</h2>
          <form onSubmit={(e) => { e.preventDefault(); setRequestedFolio(folio.trim()); }} className="space-y-2">
            <label htmlFor="folio" className="block">Folio</label>
            <input id="folio" className="border p-2 w-full" value={folio} onChange={(e) => setFolio(e.target.value)} minLength={40} maxLength={40} required />
            <Button type="submit">Consultar</Button>
          </form>
          {verify.isFetching && <p>Consultando…</p>}
          {verify.isError && <p role="alert" className="text-destructive">No se pudo consultar el folio: {verify.error.message}</p>}
          {verify.isSuccess && (verify.data ? <p>Emitido: {verify.data.recipientName} · {verify.data.courseTitle} · {new Date(verify.data.issuedAt).toLocaleDateString("es-MX")}</p> : <p>Folio no encontrado.</p>)}
        </section>
      )}
    </div>
  );
}
