import { DOCUMENT, MODULES } from "@/content";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Target, Users, FileText, CheckCircle2 } from "lucide-react";

export default function Cover() {
  return (
    <div className="space-y-10">
      <div className="border border-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Guía de capacitación corporativa</span>
          <span className="tabular-nums">Versión {DOCUMENT.version}</span>
        </div>
        <div className="px-5 py-10 md:px-8 md:py-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--accent))] font-semibold mb-4">
            Documento de capacitación
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            {DOCUMENT.title}
          </h1>
          <p className="mt-4 font-serif text-xl md:text-2xl text-muted-foreground">
            {DOCUMENT.subtitle}
          </p>
          <p className="mt-6 max-w-xl text-[15px] md:text-base leading-7 text-muted-foreground">
            {DOCUMENT.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/contenido">
                Comenzar la guía
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/evaluacion">Ir a la evaluación</Link>
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 border-t border-border text-sm">
          <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-border">
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Área responsable</dt>
            <dd className="mt-1 leading-snug">{DOCUMENT.area}</dd>
          </div>
          <div className="px-5 py-4 border-b sm:border-b-0 sm:border-r border-border">
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha de emisión</dt>
            <dd className="mt-1 leading-snug">{DOCUMENT.date}</dd>
          </div>
          <div className="px-5 py-4">
            <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Extensión</dt>
            <dd className="mt-1 leading-snug">
              {MODULES.length} módulos · Evaluación de 10 preguntas · Glosario
            </dd>
          </div>
        </dl>
      </div>

      <section aria-labelledby="objetivos">
        <h2 id="objetivos" className="font-serif text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          Objetivos de aprendizaje
        </h2>
        <p className="text-[15px] md:text-base leading-7 mb-4">
          Al terminar la guía, QA y Desarrollo deben poder:
        </p>
        <ol className="space-y-3">
          {DOCUMENT.learningObjectives.map((obj, i) => (
            <li key={i} className="flex gap-3 text-[15px] md:text-base leading-7">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-secondary text-xs font-semibold tabular-nums mt-0.5">
                {i + 1}
              </span>
              <span>{obj}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="publico" className="border border-border p-5 md:p-6">
        <h2 id="publico" className="font-serif text-xl font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          A quién va dirigida
        </h2>
        <ul className="space-y-2 text-[15px] md:text-base leading-7 list-disc pl-5 marker:text-[hsl(var(--accent))]">
          <li>
            <strong>QA Engineers:</strong> con experiencia práctica en pruebas, sin dominio formal
            de la terminología ISTQB.
          </li>
          <li>
            <strong>Developers:</strong> que escriben código y pruebas unitarias, sin dominio
            de los niveles, tipos y técnicas del estándar ni del enfoque Shift-Left.
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground leading-6">
          No se asume conocimiento previo de ninguno de los dos temas. Cada término técnico se
          define la primera vez que aparece.
        </p>
      </section>

      <section aria-labelledby="estructura">
        <h2 id="estructura" className="font-serif text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden />
          Cómo está organizada
        </h2>
        <div className="space-y-0 border border-border">
          {[
            ["Módulos 1–3", "Fundamentos: el valor del lenguaje común, el ISTQB y los siete principios."],
            ["Módulos 4–6", "El marco de trabajo: proceso de pruebas, niveles y tipos."],
            ["Módulos 7–8", "El oficio: técnicas de diseño y gestión de defectos."],
            ["Módulos 9–10", "La transformación: Shift-Left en concepto y en la práctica diaria."],
            ["Evaluación y glosario", "10 preguntas de opción múltiple con respuesta justificada, y glosario ordenado alfabéticamente con fuentes."],
          ].map(([range, desc], i, arr) => (
            <Link
              key={range}
              to="/contenido"
              className={`flex gap-4 px-5 py-4 hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i < arr.length - 1 ? "border-b border-border" : ""}`}
            >
              <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))] pt-0.5">
                {range}
              </span>
              <span className="text-[15px] leading-7">{desc}</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground leading-6">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          Marca cada módulo como completado al terminarlo; tu progreso se guarda en tu cuenta y
          sobrevive a las recargas y a otros dispositivos.
        </p>
      </section>
    </div>
  );
}
