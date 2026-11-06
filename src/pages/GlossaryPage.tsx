import { useMemo, useState } from "react";
import { GLOSSARY } from "@/content/glossary";
import { Input } from "@/components/ui/input";
import { Info, Search } from "lucide-react";

export default function GlossaryPage() {
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (e) =>
        e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--accent))] font-semibold">
          Glosario
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Glosario de términos
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground leading-7 max-w-2xl">
          Términos ordenados alfabéticamente, con su fuente. Cuando el uso común de la
          industria difiere del glosario formal ISTQB, un recuadro «Nota» lo señala
          explícitamente.
        </p>
        <div className="relative mt-5 max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar término o definición…"
            className="pl-9 h-11"
            aria-label="Buscar en el glosario"
          />
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="border border-dashed border-border px-5 py-10 text-center">
          <p className="text-muted-foreground">
            No hay términos que coincidan con «{query}». Intenta con otra palabra.
          </p>
        </div>
      ) : (
        <dl className="divide-y divide-border border border-border">
          {entries.map((entry) => (
            <div key={entry.term} className="px-5 py-4">
              <dt className="font-serif text-lg font-semibold">{entry.term}</dt>
              <dd className="mt-1.5 text-[15px] leading-7">{entry.definition}</dd>
              <dd className="mt-2 text-xs text-muted-foreground">
                Fuente: {entry.source}
              </dd>
              {entry.note && (
                <dd
                  className="mt-3 border-l-2 px-3.5 py-2.5 text-sm leading-6"
                  style={{
                    backgroundColor: "hsl(var(--tint-note))",
                    borderColor: "hsl(var(--tint-note-border))",
                  }}
                >
                  <p className="flex items-center gap-2 font-semibold mb-1">
                    <Info className="h-4 w-4" aria-hidden />
                    Nota
                  </p>
                  {entry.note}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
