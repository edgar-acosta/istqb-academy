// Evaluación final de la guía — 10 preguntas de opción múltiple.
// El backend califica las respuestas; este contrato también se importa en
// el frontend para mostrar las justificaciones, así que la clave no es secreta.

export interface QuizQuestion {
  id: string;
  module: number; // módulo al que refiere la pregunta
  question: string;
  options: string[];
  correctIndex: number;
  justification: string;
}

export const QUIZ_TOTAL = 10;

export { QUIZ_QUESTIONS } from "./quiz-telemetry";

// Se conservan las preguntas originales para interpretar los intentos históricos
// identificados con q1…q10; los intentos nuevos usan identificadores v2.
export const LEGACY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    module: 1,
    question:
      "En una reunión de retrospectiva, QA dice que «encontró 12 errores» cuando en realidad registró 12 fallas observadas durante la ejecución. Según la terminología ISTQB, ¿qué registró QA en realidad?",
    options: [
      "12 defectos en el código",
      "12 fallas: comportamientos observados que difieren de lo esperado",
      "12 errores humanos cometidos por los desarrolladores",
      "12 causas raíz de problemas en el proceso",
    ],
    correctIndex: 1,
    justification:
      "La cadena causal ISTQB es: una persona comete un error (mistake), que introduce un defecto (fault) en el producto de trabajo y que, al ejecutarse, puede producir una falla (failure) observable. Quien ejecuta pruebas observa y registra fallas; la investigación posterior localiza el defecto que las causó. Registrar «errores» confunde la capa humana con la observación.",
  },
  {
    id: "q2",
    module: 4,
    question:
      "Un equipo define: «Las pruebas de sistema pueden terminar cuando el 100 % de los casos planeados se ejecutaron, no hay defectos abiertos de severidad alta y la cobertura de requisitos alcanzó el 95 %». ¿Qué están definiendo?",
    options: [
      "Criterios de entrada (entry criteria)",
      "Criterios de salida (exit criteria)",
      "La base de pruebas (test basis)",
      "Condiciones de prueba (test conditions)",
    ],
    correctIndex: 1,
    justification:
      "Los criterios de salida definen qué debe lograrse para declarar terminada una actividad o nivel de prueba; los de entrada son los precondiciones para comenzarla. El enunciado describe condiciones de finalización (ejecución completa, defectos resueltos, cobertura alcanzada), por tanto son criterios de salida del nivel de sistema.",
  },
  {
    id: "q3",
    module: 5,
    question:
      "Un desarrollador ejecuta pruebas sobre una clase aislada usando dobles de prueba (mocks) para las dependencias externas. ¿Qué nivel de prueba está realizando y quién es el responsable típico?",
    options: [
      "Prueba de integración de componentes; QA técnico",
      "Prueba de aceptación; usuario de negocio",
      "Prueba de componente (unitaria); el propio desarrollador",
      "Prueba de sistema; QA funcional",
    ],
    correctIndex: 2,
    justification:
      "La prueba de componente (llamada unitaria en la práctica ágil) verifica unidades de código de forma aislada, con frecuencia apoyándose en dobles de prueba para sustituir dependencias. En el enfoque de todo el equipo, el responsable natural es quien escribe el código: el desarrollador.",
  },
  {
    id: "q4",
    module: 6,
    question:
      "Tras corregir un defecto en el cálculo de impuestos del módulo de pagos, el equipo vuelve a ejecutar el caso de prueba que lo detectó y confirma que ahora pasa. ¿Cómo se denomina esta actividad en ISTQB?",
    options: [
      "Prueba de regresión",
      "Prueba de humo (smoke)",
      "Prueba de confirmación (retest)",
      "Prueba exploratoria",
    ],
    correctIndex: 2,
    justification:
      "La prueba de confirmación (retest o confirmation testing) vuelve a ejecutar un caso que falló para verificar que el defecto fue corregido. La regresión, en cambio, busca efectos colaterales en funcionalidad que antes funcionaba; es complementaria, no sustituta.",
  },
  {
    id: "q5",
    module: 7,
    question:
      "Un campo «cantidad» acepta valores enteros entre 1 y 100 inclusive. Usando análisis de valores límite de 2 valores, ¿qué conjunto de datos de prueba es el adecuado?",
    options: [
      "0, 1, 2, 99, 100, 101",
      "0, 1, 50, 100, 101",
      "1, 100",
      "0, 1, 100, 101",
    ],
    correctIndex: 3,
    justification:
      "En BVA de 2 valores se prueban los dos puntos en cada frontera, uno dentro y otro fuera del dominio válido: 0 y 1 en el límite inferior; 100 y 101 en el superior. El valor nominal (50) no forma parte de la regla de 2 valores, y agregar 2 y 99 corresponde a variantes extendidas, no al criterio base de 2 valores.",
  },
  {
    id: "q6",
    module: 8,
    question:
      "Un defecto impide que el 1 % de usuarios vea su historial de pedidos, pero tiene un arreglo temporal sencillo y apenas se reporta. Otro defecto corrompe el cálculo de IVA en el 100 % de las facturas, sin arreglo temporal. ¿Qué afirmación sobre severidad y prioridad es correcta?",
    options: [
      "Ambos defectos tendrán la misma prioridad porque ambos afectan a usuarios",
      "El del IVA es más severo y más prioritario; severidad mide el impacto y prioridad la urgencia de corrección",
      "El del historial es más prioritario porque afecta la experiencia de usuario, que siempre prima sobre cálculos internos",
      "Severidad y prioridad son sinónimos y se asignan una sola vez por el desarrollador",
    ],
    correctIndex: 1,
    justification:
      "Severidad y prioridad son atributos independientes: la severidad califica el grado de impacto del defecto sobre los interesados o requisitos; la prioridad indica la urgencia con que debe corregirse. El defecto del IVA afecta a todos los clientes y no tiene mitigación, por lo que es alto en ambas dimensiones.",
  },
  {
    id: "q7",
    module: 9,
    question:
      "¿Cuál es el fundamento económico del Shift-Left Testing?",
    options: [
      "Las herramientas de automatización son más baratas al inicio del proyecto",
      "Los defectos se vuelven progresivamente más costosos de corregir cuanto más tarde se detectan en el ciclo de vida",
      "Los desarrolladores cobran menos horas que QA",
      "Los requisitos cambian menos al final del proyecto",
    ],
    correctIndex: 1,
    justification:
      "La idea central del shift-left es que el costo de corregir un defecto crece conforme avanza su detección por el ciclo de vida: un defecto de requisitos corregido en el documento cuesta horas; el mismo defecto detectado en producción cuesta correcciones, retrabajos y posible impacto en clientes. Anticipar las actividades de prueba reduce ese costo.",
  },
  {
    id: "q8",
    module: 10,
    question:
      "En BDD (Behavior-Driven Development), ¿qué papel juegan los escenarios escritos en lenguaje Gherkin («Dado… Cuando… Entonces…»)?",
    options: [
      "Documentan el código de los desarrolladores en lenguaje natural",
      "Sustituyen a las pruebas unitarias porque son equivalentes",
      "Sirven de especificación ejecutable compartida entre negocio, QA y desarrollo",
      "Son una técnica de prueba de caja negra para valores límite",
    ],
    correctIndex: 2,
    justification:
      "En BDD, los escenarios en Gherkin describen el comportamiento esperado del sistema en un formato legible para todas las partes y vinculado a pruebas automatizadas ejecutables. Funcionan como especificación viva compartida: negocio la valida, QA la usa como base de pruebas y desarrollo la implementa.",
  },
  {
    id: "q9",
    module: 3,
    question:
      "«La prueba exhaustiva es imposible, salvo para casos triviales». ¿Qué principio ISTQB se ilustra y cuál es su consecuencia práctica?",
    options: [
      "Agrupación de defectos: todos los defectos se concentran en pocos módulos",
      "Paradoja del pesticida: repetir las mismas pruebas deja de encontrar defectos",
      "Las pruebas dependen del contexto y no se puede generalizar",
      "Pruebas muestran la presencia de defectos, no su ausencia; se requiere priorización basada en riesgo",
    ],
    correctIndex: 3,
    justification:
      "El principio asociado es que las pruebas muestran la presencia de defectos, no su ausencia, combinado con la imposibilidad de la prueba exhaustiva (todo el sistema no puede probarse en todos sus estados e inputs). La consecuencia práctica es priorizar: diseñar pruebas que cubran los riesgos más relevantes en lugar de buscar cobertura total.",
  },
  {
    id: "q10",
    module: 5,
    question:
      "¿Cuál afirmación sobre los niveles de prueba es correcta según ISTQB?",
    options: [
      "Son secuenciales y estrictos: jamás se solapan entre sí",
      "Cada nivel tiene objetivos, bases de pruebas y responsables distintos, y pueden solaparse según el ciclo de vida",
      "La prueba de sistema siempre la ejecuta el cliente final",
      "La prueba de aceptación no necesita criterios de salida porque la decide el usuario",
    ],
    correctIndex: 1,
    justification:
      "ISTQB define cinco niveles (componente, integración de componentes, sistema, integración de sistema y aceptación), cada uno con objetivos, objetos de prueba y responsables característicos. Los niveles pueden ejecutarse en orden, solapados, en iteraciones o de forma continua según el modelo de ciclo de vida adoptado; no son una secuencia rígida.",
  },
];
