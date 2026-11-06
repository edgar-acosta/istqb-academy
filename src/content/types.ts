// Tipos del contenido de la guía de capacitación

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "def"; term: string; text: string; source?: string }
  | { type: "note"; title?: string; text: string }
  | { type: "warning"; title?: string; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      caption?: string;
    }
  | { type: "code"; lang: string; code: string };

export interface TrainingModule {
  id: number;
  title: string;
  minutes: number;
  intro: string;
  objectives: string[];
  blocks: Block[];
  example: { title: string; body: string };
  activity: { title: string; scenario: string; questions: string[] };
  keyPoints: [string, string, string];
  sources: string[];
}
