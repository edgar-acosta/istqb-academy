import type { TrainingModule } from "./types";
import { modules1to3 } from "./modules1-3";
import { modules4to6 } from "./modules4-6";
import { modules7to8 } from "./modules7-8";
import { modules9to10 } from "./modules9-10";

export const MODULES: TrainingModule[] = [
  ...modules1to3,
  ...modules4to6,
  ...modules7to8,
  ...modules9to10,
];

export const DOCUMENT = {
  title: "ISTQB y Shift-Left Testing",
  subtitle: "Un lenguaje común entre QA y Desarrollo para telemetría de flotas",
  version: "2.0",
  area: "Calidad y Desarrollo — Capacitación Corporativa",
  date: "6 de noviembre de 2026",
  description:
    "Guía de capacitación en ISTQB y Shift-Left para QA y Desarrollo, con ejemplos ficticios de una plataforma web de telemetría de tractocamiones para múltiples flotas.",
  learningObjectives: [
    "Usar la misma terminología al planear, discutir y ejecutar pruebas.",
    "Clasificar un defecto, un nivel o un tipo de prueba con criterios comunes.",
    "Aplicar prácticas Shift-Left en el flujo de trabajo actual.",
    "Reportar y discutir resultados de prueba sin ambigüedad.",
  ],
  control: [
    { version: "2.0", fecha: "6 de noviembre de 2026", autor: "Área de Capacitación — QA & Desarrollo", cambios: "Adaptación de ejemplos, actividades y evaluación a telemetría de flotas." },
    { version: "1.0", fecha: "6 de noviembre de 2026", autor: "Área de Capacitación — QA & Desarrollo", cambios: "Emisión inicial de la guía." },
  ],
};

export function getModule(id: number): TrainingModule | undefined {
  return MODULES.find((m) => m.id === id);
}
