import { DOCUMENT } from "@/content";
import { BookOpen, ExternalLink, FileWarning } from "lucide-react";

const REFERENCES = [
  {
    label: "ISTQB®, Certified Tester Foundation Level (CTFL) Syllabus v4.0.1, 2024.",
    detail:
      "Documento base de la terminología de esta guía. El examen se denomina CTFL v4.0; la revisión 4.0.1 (erratas, 15 de septiembre de 2024) es el documento de estudio vigente.",
    url: "https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/",
  },
  {
    label: "ISTQB® Glossary of Testing Terms v4.0.",
    detail:
      "Glosario oficial multilingüe; fuente de las definiciones formales citadas en los módulos y en el glosario de esta guía.",
    url: "https://glossary.istqb.org/",
  },
  {
    label: "ISO/IEC/IEEE 29119 — Software testing (familia de normas).",
    detail:
      "Referencia de definiciones de error, defecto y falla coherente con el CTFL v4.0, y fuente de plantillas de reporte de incidente (29119-3).",
  },
  {
    label: "Beck, K. — Test-Driven Development: By Example (Addison-Wesley, 2002).",
    detail: "Referencia práctica del ciclo rojo–verde–refactor citado en el módulo 10.",
  },
  {
    label: "Myers, G. J. — The Art of Software Testing (Wiley).",
    detail: "Clásico de referencia sobre los principios económicos de las pruebas.",
  },
];

const RESOURCES = [
  {
    label: "Portal oficial de certificaciones ISTQB",
    url: "https://istqb.org/certifications/",
  },
  {
    label: "Glosario ISTQB en línea (búsqueda multilingüe)",
    url: "https://glossary.istqb.org/",
  },
  {
    label: "Documentos oficiales CTFL v4.0 (syllabus y exámenes de ejemplo)",
    url: "https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/",
  },
];

export default function ReferencesPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--accent))] font-semibold">
          Referencias
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Referencias y recursos para profundizar
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground leading-7 max-w-2xl">
          Fuentes citadas a lo largo de la guía y rutas sugeridas para seguir aprendiendo.
        </p>
      </header>

      <section
        className="border-l-2 px-4 py-3 text-sm leading-6"
        style={{
          backgroundColor: "hsl(var(--tint-warning))",
          borderColor: "hsl(var(--tint-warning-border))",
        }}
        aria-label="Aviso sobre fuentes"
      >
        <p className="flex items-center gap-2 font-semibold mb-1">
          <FileWarning className="h-4 w-4" aria-hidden />
          Precisión sobre las fuentes de esta guía
        </p>
        <p>
          Las fuentes cargadas con el encargo contenían el programa, la estructura y los objetivos
          del documento, pero no el texto del syllabus ISTQB ni de otros corpus. El contenido
          conceptual se elaboró sobre la terminología del CTFL v4.0.1 y del glosario ISTQB v4.0,
          citados como referencia. Donde un dato (por ejemplo, cifras de costo por fase) no pudo
          confirmarse en fuentes oficiales, se indicó en el módulo correspondiente en lugar de
          inventarse.
        </p>
      </section>

      <section aria-labelledby="fuentes">
        <h2 id="fuentes" className="font-serif text-xl font-semibold mb-3">
          Referencias bibliográficas
        </h2>
        <ul className="divide-y divide-border border border-border">
          {REFERENCES.map((ref) => (
            <li key={ref.label} className="px-5 py-4">
              <p className="text-[15px] font-medium leading-7">{ref.label}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-6">{ref.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="syllabus-usado">
        <h2 id="syllabus-usado" className="font-serif text-xl font-semibold mb-3">
          Versión del syllabus utilizada
        </h2>
        <div className="border border-border px-5 py-4">
          <p className="text-[15px] leading-7">
            Esta guía usa como referente terminológico el{" "}
            <strong>ISTQB® Certified Tester Foundation Level (CTFL) Syllabus v4.0, revisión
            4.0.1 (2024)</strong>, y el <strong>ISTQB® Glossary of Testing Terms v4.0</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-6">
            Datos del examen CTFL v4.0, para quien desee certificarse después: 40 preguntas de
            opción múltiple, 60 minutos (75 con extensión por idioma no nativo), 26/40 puntos para
            aprobar (65 %). Sin prerrequisitos; es el requisito de entrada para las demás
            certificaciones del esquema.
          </p>
        </div>
      </section>

      <section aria-labelledby="profundizar">
        <h2 id="profundizar" className="font-serif text-xl font-semibold mb-3">
          Recursos para profundizar
        </h2>
        <ul className="divide-y divide-border border border-border">
          {RESOURCES.map((r) => (
            <li key={r.label}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-5 py-3.5 text-[15px] hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" aria-hidden />
                <span className="flex-1 leading-6">{r.label}</span>
                <ExternalLink
                  className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground leading-6">
          Documento: {DOCUMENT.title} — {DOCUMENT.subtitle}. Versión {DOCUMENT.version},{" "}
          {DOCUMENT.date}. {DOCUMENT.area}.
        </p>
      </section>
    </div>
  );
}
