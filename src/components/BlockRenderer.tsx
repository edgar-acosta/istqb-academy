import type { Block } from "@/content/types";
import { Info, AlertTriangle, BookOpen } from "lucide-react";

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-[15px] md:text-base">{block.text}</p>;

    case "h3":
      return (
        <h3 className="text-lg md:text-xl font-semibold mt-8 mb-3 border-b border-border pb-2">
          {block.text}
        </h3>
      );

    case "def":
      return (
        <div className="border border-border bg-card px-4 py-3 my-4">
          <p className="font-semibold text-sm md:text-[15px] flex items-baseline gap-2">
            <BookOpen className="h-4 w-4 inline shrink-0 translate-y-0.5 text-[hsl(var(--tint-note-border))]" aria-hidden />
            {block.term}
          </p>
          <p className="text-sm md:text-[15px] mt-1.5 leading-7">{block.text}</p>
          {block.source && (
            <p className="text-xs text-muted-foreground mt-2">
              Fuente: {block.source}
            </p>
          )}
        </div>
      );

    case "note":
      return (
        <aside
          className="my-5 border-l-2 px-4 py-3 text-sm md:text-[15px] leading-7"
          style={{
            backgroundColor: "hsl(var(--tint-note))",
            borderColor: "hsl(var(--tint-note-border))",
          }}
        >
          <p className="flex items-center gap-2 font-semibold mb-1">
            <Info className="h-4 w-4" aria-hidden />
            {block.title ?? "Nota"}
          </p>
          <p>{block.text}</p>
        </aside>
      );

    case "warning":
      return (
        <aside
          className="my-5 border-l-2 px-4 py-3 text-sm md:text-[15px] leading-7"
          style={{
            backgroundColor: "hsl(var(--tint-warning))",
            borderColor: "hsl(var(--tint-warning-border))",
          }}
        >
          <p className="flex items-center gap-2 font-semibold mb-1">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            {block.title ?? "Atención"}
          </p>
          <p>{block.text}</p>
        </aside>
      );

    case "list":
      return block.ordered ? (
        <ol className="list-decimal pl-6 space-y-2 text-[15px] md:text-base">
          {block.items.map((item, i) => (
            <li key={i} className="leading-7">
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc pl-6 space-y-2 text-[15px] md:text-base marker:text-[hsl(var(--accent))]">
          {block.items.map((item, i) => (
            <li key={i} className="leading-7">
              {item}
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <figure className="my-6">
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm md:text-[15px] border-collapse">
              <thead>
                <tr className="bg-secondary">
                  {block.headers.map((h, i) => (
                    <th key={i} className="text-left px-3 py-2.5 border-b border-border font-semibold align-top">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="odd:bg-background even:bg-secondary/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2.5 align-top leading-6 border-b border-border/60">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="text-xs text-muted-foreground mt-2">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "code":
      return (
        <pre className="my-5 overflow-x-auto border border-border bg-[hsl(170_30%_10%)] text-[hsl(42_25%_88%)] p-4 text-[13px] leading-6">
          <code>{block.code}</code>
        </pre>
      );

    default:
      return null;
  }
}
