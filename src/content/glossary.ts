// Glosario de términos — orden alfabético, con fuente indicada.

export interface GlossaryEntry {
  term: string;
  definition: string;
  source: string;
  note?: string; // recuadro "Nota" cuando la práctica común difiere del glosario ISTQB
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: "Alerta de velocidad (caso didáctico)",
    definition:
      "En el caso ficticio de esta guía, se genera para la flota del vehículo cuando la regla está activa, la lectura es válida y la velocidad supera el umbral configurado.",
    source: "Definición operativa del caso didáctico; no es una definición ISTQB.",
  },
  {
    term: "Caso de prueba (test case)",
    definition:
      "Conjunto de precondiciones, entradas, acciones (donde sea aplicable), resultados esperados y postcondiciones, desarrollado sobre la base de pruebas para determinar si un requisito se ha cumplido.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 1.4.3.",
  },
  {
    term: "Cobertura (coverage)",
    definition:
      "Grado en que un elemento de prueba especificado ha sido cubierto por pruebas, expresado como porcentaje de un tipo de elemento cubierto sobre el total. Requiere siempre especificar el tipo: cobertura de requisitos, de riesgos, de sentencias, de ramas, de estados, etc.",
    source: "ISTQB Glossary v4.0.",
    note: "Práctica común: en QA suele referirse a cobertura de requisitos o casos planeados; en desarrollo, a cobertura de código (líneas/ramas). Un porcentaje sin tipo de cobertura es ambiguo: acuerden siempre el adjetivo.",
  },
  {
    term: "Criterio de salida (exit criterion)",
    definition:
      "Conjunto de condiciones requeridas para poder declarar terminado un proceso o nivel de prueba, con el objetivo de medir si éste se ha ejecutado como estaba previsto.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 5.1.3.",
  },
  {
    term: "Defecto (defect, fault, bug)",
    definition:
      "Imperfección o deficiencia en un producto de trabajo donde éste no cumple sus requisitos o especificaciones. Manifestación en el producto de un error humano anterior.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 1.2.3.",
  },
  {
    term: "Error (error, mistake)",
    definition:
      "Acción humana que produce un resultado incorrecto. Es la capa de la cadena causal persona → error → defecto → falla.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 1.2.3 (coherente con ISO/IEC/IEEE 29119).",
  },
  {
    term: "Falla (failure)",
    definition:
      "Manifestación observable de un defecto durante la ejecución: comportamiento real del componente o sistema que difiere del esperado. Es lo que detecta quien ejecuta pruebas.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 1.2.3.",
    note: "Práctica común: «error» y «bug» se usan indistintamente para todo. En el estándar son capas distintas: reportar fallas (lo observado), investigar hasta el defecto (lo que se corrige), y remontar al error (la causa humana).",
  },
  {
    term: "Lectura desactualizada (caso didáctico)",
    definition:
      "Lectura cuya hora de evento tiene más de cinco minutos de antigüedad en el ejercicio. La última posición conocida no debe confundirse con una ubicación actual.",
    source: "Definición operativa del caso didáctico; no es una definición ISTQB.",
  },
  {
    term: "Nivel de prueba (test level)",
    definition:
      "Instancias específicas del proceso de pruebas agrupadas y gestionadas. El CTFL v4.0 define cinco: componente, integración de componentes, sistema, integración de sistema y aceptación.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 2.2.1.",
  },
  {
    term: "Prioridad (priority)",
    definition:
      "Nivel de (business) importancia asignado a un ítem (por ejemplo, un defecto), que determina el orden de atención. Expresa urgencia de corrección, no impacto.",
    source: "ISTQB Glossary v4.0.",
    note: "Práctica común: se confunde con severidad y se funden en un solo campo «urgencia». En el estándar son independientes: la severidad la propone QA (impacto), la prioridad la decide el negocio (urgencia).",
  },
  {
    term: "Regresión (regression testing)",
    definition:
      "Repetición de una prueba tras un cambio, de forma selectiva, para detectar defectos introducidos en funcionalidad que antes operaba correctamente.",
    source: "ISTQB Glossary v4.0.",
    note: "Práctica común: «regresión» se usa a veces como sinónimo de «volver a correr todo». La regresión rigurosa es selectiva y guiada por el riesgo del cambio; su complemento, la prueba de confirmación (retest), verifica una corrección concreta.",
  },
  {
    term: "Severidad (severity)",
    definition:
      "Grado de impacto que tiene un defecto sobre el desarrollo o la operación de un componente o sistema, o sobre el cumplimiento de requisitos e intereses de las partes interesadas.",
    source: "ISTQB Glossary v4.0.",
  },
  {
    term: "Técnica de prueba (test technique)",
    definition:
      "Procedimiento para crear o seleccionar un modelo basado en una estructura de un sistema o de sus especificaciones, usado después para derivar casos de prueba de forma sistemática (por ejemplo, partición de equivalencia, valores límite, tablas de decisión, transición de estados).",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 4.",
  },
  {
    term: "Tipo de prueba (test type)",
    definition:
      "Grupo de actividades de prueba dirigidas a la evaluación de características específicas de un componente o sistema (por ejemplo, funcional, no funcional, de regresión, de confirmación), independiente del nivel en que se ejecuten.",
    source: "ISTQB Glossary v4.0; CTFL Syllabus v4.0.1, cap. 2.2.2.",
    note: "Práctica común: «tipo» y «nivel» se usan como sinónimos. Son ejes independientes: toda prueba tiene un tipo (qué evalúa) y un nivel (dónde/del qué), y nombrar ambos elimina la ambigüedad.",
  },
];
