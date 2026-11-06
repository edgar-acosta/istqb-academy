import type { TrainingModule } from "./types";

export const modules7to8: TrainingModule[] = [
  {
    id: 7,
    title: "Técnicas de diseño de pruebas: pensar antes de ejecutar",
    minutes: 50,
    intro:
      "Un caso de prueba es una pregunta diseñada para revelar información sobre el riesgo. Las técnicas de caja negra del CTFL —partición de equivalencia, análisis de valores límite, tablas de decisión y pruebas basadas en estados— dan a QA y Desarrollo un método común para derivar casos de la base de pruebas, en lugar de depender de la intuición de cada quien.",
    objectives: [
      "Aplicar partición de equivalencia y análisis de valores límite a reglas con dominios numéricos.",
      "Construir una tabla de decisiones a partir de reglas de negocio con condiciones combinadas.",
      "Modelar comportamiento con diagramas de transición de estados y derivar casos de prueba.",
    ],
    blocks: [
      {
        type: "def",
        term: "Partición de equivalencia",
        text: "Técnica de caja negra que divide el dominio de entrada en clases de equivalencia: datos que el sistema debe tratar igual. Con probar un representante de cada clase se cubre el comportamiento del dominio con el mínimo de casos.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 4.2.1.",
      },
      {
        type: "def",
        term: "Análisis de valores límite",
        text: "Técnica de caja negra basada en que los defectos suelen aparecer en los bordes de los dominios. Con 2 valores por límite se prueba el valor frontera y el inmediato fuera; con 3 valores se añade el inmediato dentro del dominio.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 4.2.2.",
      },
      {
        type: "def",
        term: "Tabla de decisiones",
        text: "Técnica que representa reglas de negocio como combinaciones de condiciones (entradas) y acciones (salidas), garantizando que cada regla válida tenga al menos un caso de prueba. Es de las técnicas más rigurosas para lógica combinatoria.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 4.2.3.",
      },
      {
        type: "def",
        term: "Pruebas basadas en estados (transición de estados)",
        text: "Técnica que modela el objeto de prueba como máquina de estados finitos: estados, eventos, transiciones y acciones. Se derivan casos cubriendo estados y transiciones típicas (toda transición, todos los estados, caminos y secuencias de estados).",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 4.2.4.",
      },
      {
        type: "note",
        title: "Nota — «caja negra» y «caja blanca»",
        text: "Caja negra deriva casos de la especificación sin mirar el código; caja blanca (pruebas de sentencia y de decisión/rama) deriva casos de la estructura interna. En el CTFL v4.0, caja blanca cubre statement y branch testing. En un equipo ágil, la combinación de ambas es la práctica recomendada: caja negra para la lógica de negocio, caja blanca para el código nuevo.",
      },
      {
        type: "h3",
        text: "Partición de equivalencia + valores límite: el dúo de trabajo",
      },
      {
        type: "p",
        text: "La combinación más usada en la industria: primero se dividen las entradas en clases válidas e inválidas (partición), después se atacan los bordes de cada clase con valores límite. Regla práctica del 2 valores: si el dominio válido es [a, b], los datos de prueba son a−1, a, b, b+1.",
      },
      {
        type: "code",
        lang: "text",
        code: `Regla didáctica: el umbral acepta enteros de 30 a 120 km/h, inclusive

Clases de equivalencia:
  Válida:   30 <= umbral <= 120
  Inválidas: umbral < 30; umbral > 120;
             no entero; ausente

BVA de 2 valores: 29, 30, 120, 121
BVA de 3 valores: añade 31 y 119`,
      },
      {
        type: "h3",
        text: "Tabla de decisiones: la lógica combinatoria sin fugas",
      },
      {
        type: "p",
        text: "Cuando una alerta depende de varias condiciones —regla activa, lectura válida y velocidad superior al umbral— la intuición puede dejar combinaciones sin probar. La tabla de decisiones identifica las reglas relevantes y sus acciones esperadas; una regla simplificada puede representar varias combinaciones equivalentes.",
      },
      {
        type: "code",
        lang: "text",
        code: `Regla didáctica: activa | lectura válida | velocidad > umbral
R1: no | cualquiera | cualquiera -> no generar alerta por esta regla
R2: sí | no         | cualquiera -> no evaluar como exceso
R3: sí | sí         | no         -> no generar alerta
R4: sí | sí         | sí         -> generar alerta para la flota del vehículo

El tratamiento de lecturas inválidas debe acordarse en el contrato.`,
      },
      {
        type: "h3",
        text: "Transición de estados: cuando el comportamiento tiene memoria",
      },
      {
        type: "p",
        text: "La visualización de una lectura puede estar vigente o desactualizada. Modelar sus transiciones permite verificar qué sucede al pasar el tiempo o recibir una nueva lectura. Las lecturas tardías y los relojes desincronizados requieren criterios adicionales acordados.",
      },
      {
        type: "code",
        lang: "text",
        code: `VIGENTE --edad del evento supera 5 minutos--> DESACTUALIZADA
DESACTUALIZADA --nueva lectura válida y vigente--> VIGENTE

La edad se calcula desde la hora del evento.
Precisar cómo tratar lecturas tardías y relojes desincronizados.`,
      },
      {
        type: "warning",
        title: "Atención",
        text: "Las técnicas no son relleno de casos ni ceremonia: existen porque la intuición sin método deja combinaciones sin probar (principio 2 del módulo 3: la prueba exhaustiva es imposible, pero la ciega también). Documentar la técnica usada en cada caso de prueba hace el diseño revisable por pares.",
      },
    ],
    example: {
      title: "Ejemplo práctico — umbral de alerta de velocidad",
      body: "En este caso ficticio se configura un umbral entero de 30 a 120 km/h inclusive. Para la regla activa y una lectura válida, se genera alerta solo si la velocidad supera el umbral: con umbral 90, una lectura de 90 no genera alerta y una de 91 sí. QA y Desarrollo derivan particiones, valores límite y la tabla de decisiones; luego acuerdan los casos que aún no tienen comportamiento definido.",
    },
    activity: {
      title: "Actividad — del requisito al caso",
      scenario:
        "Usa las reglas didácticas del umbral y la vigencia de lecturas, con vehículos y flotas ficticios.",
      questions: [
        "Deriva las clases de equivalencia y los cuatro valores límite del umbral. Añade casos de formato inválido y dato ausente.",
        "Escribe un caso por regla de la tabla y dos casos de transición entre vigente y desactualizada, con precondiciones, datos, resultado esperado y técnica.",
        "Plantea preguntas sobre lecturas tardías, timestamps, datos inválidos y cambios de umbral; no inventes resultados que no estén definidos.",
      ],
    },
    keyPoints: [
      "Partición de equivalencia + análisis de valores límite es el dúo base para dominios numéricos y de formato.",
      "La tabla de decisiones garantiza cobertura de la lógica combinatoria de las reglas de negocio; la transición de estados, de los comportamientos con memoria.",
      "Anotar la técnica en cada caso de prueba hace el diseño revisable y elimina la dependencia de la intuición individual.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, cap. 4.2 (Black-box Test Techniques), 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
    ],
  },
  {
    id: 8,
    title: "Gestión de defectos: ciclo de vida, severidad vs. prioridad y reportes que se entienden",
    minutes: 45,
    intro:
      "Un defecto mal reportado es un defecto que tarda el doble en corregirse. Este módulo establece el ciclo de vida formal del defecto, la distinción operativa entre severidad y prioridad, y la anatomía de un reporte que permite a desarrollo reproducir y resolver sin interrogatorios.",
    objectives: [
      "Describir el ciclo de vida de un defecto y los estados estándar.",
      "Asignar severidad y prioridad de forma consistente usando criterios compartidos.",
      "Redactar un reporte de defecto completo según la estructura del estándar.",
    ],
    blocks: [
      {
        type: "def",
        term: "Defecto (defect, fault, bug)",
        text: "Imperfección o deficiencia en un producto de trabajo que puede causar una falla. Es la manifestación en el producto de un error humano anterior.",
        source: "ISTQB Glossary v4.0; CTFL v4.0.1, cap. 1.2.3.",
      },
      {
        type: "def",
        term: "Severidad",
        text: "Grado de impacto del defecto sobre el desarrollo o la operación de un componente o sistema, o sobre el cumplimiento de los requisitos e intereses de las partes interesadas.",
        source: "ISTQB Glossary v4.0.",
      },
      {
        type: "def",
        term: "Prioridad",
        text: "Nivel de importancia (business) asignado a un ítem (defecto), que determina el orden de atención. Expresa urgencia de corrección, no impacto.",
        source: "ISTQB Glossary v4.0.",
      },
      {
        type: "h3",
        text: "El ciclo de vida del defecto",
      },
      {
        type: "code",
        lang: "text",
        code: `NUEVO -> EN ANÁLISIS -> CONFIRMADO -> ASIGNADO
   |           |             |
   |           v             v
   |        DUPLICADO     RECHAZADO (no es defecto / no reproducible)
   |           |             |
   |           +------+------+
   v                  v
ESPERANDO CORRECCIÓN -> CORREGIDO -> EN CONFIRMACIÓN -> CERRADO
                              |             |
                              v             v
                         REABIERTO <-------+  (falla la confirmación)`,
      },
      {
        type: "p",
        text: "Los nombres exactos varían por herramienta (Jira, Azure DevOps, GitLab), pero el flujo lógico es estable: detectar y reportar, triar (¿es defecto? ¿es duplicado? ¿es válido?), corregir, confirmar la corrección y cerrar. La transición crítica para QA–Dev es la de confirmación: solo el mismo caso de prueba que reveló la falla puede cerrarla (prueba de confirmación del módulo 6).",
      },
      {
        type: "table",
        caption: "Severidad y prioridad: cuatro combinaciones posibles",
        headers: ["Combinación", "Significado", "Ejemplo"],
        rows: [
          ["Severidad alta / Prioridad alta", "Impacta fuerte y urge corregir", "Una flota puede consultar datos de otra"],
          ["Severidad alta / Prioridad baja", "Impacta fuerte pero hay mitigación o contexto", "Función de telemetría aún no habilitada, con mitigación acordada"],
          ["Severidad baja / Prioridad alta", "Impacto menor pero urge por negocio", "Etiqueta incorrecta que se debe corregir antes de una demostración"],
          ["Severidad baja / Prioridad baja", "Cosmético, sin presión", "Tooltip desalineado en una pantalla secundaria"],
        ],
      },
      {
        type: "note",
        title: "Nota — quién asigna qué",
        text: "Convención de la industria: QA propone la severidad (mide el impacto observable contra la especificación) y el negocio/producto establece la prioridad (mide la urgencia según valor y riesgo). El desarrollador valida la severidad durante el triaje. Mezclar ambas en un solo campo («urgencia») destruye la información: dos dimensiones se comprimen en una y nadie puede razonar sobre ninguna.",
      },
      {
        type: "h3",
        text: "Anatomía de un reporte efectivo",
      },
      {
        type: "list",
        items: [
          "Identificador único y título con resumen claro de la anomalía (qué se observó, no cómo se siente).",
          "Fecha, autor y rol, organización emisora, identificación del objeto de prueba y del entorno.",
          "Contexto: caso de prueba en ejecución, actividad, datos usados, build o versión.",
          "Pasos para reproducir, numerados y suficientes; logs, capturas, dumps o grabaciones relevantes.",
          "Resultado esperado vs. resultado actual, citando la base de pruebas (requisito o criterio).",
          "Severidad (impacto) y prioridad (urgencia) propuestas, con justificación breve.",
          "Estado inicial y referencias (caso de prueba, historia, defectos relacionados).",
        ],
      },
      {
        type: "warning",
        title: "Atención",
        text: "Un reporte no es un juicio. «El desarrollador no validó el input» es una acusación; «el campo acepta caracteres no numéricos pese al criterio de aceptación AC-3, que exige solo dígitos» es un dato verificable. El tono colaborativo del reporte reduce el tiempo de triaje: nadie se pone a la defensiva con hechos citables.",
      },
    ],
    example: {
      title: "Ejemplo práctico — reporte de acceso entre flotas",
      body: "Reporte ficticio [TEL-001]: «Usuario de Norte recibe datos de S-201 al consultar su identificador». Entorno de pruebas, versión y cuentas sintéticas documentadas. Pasos: (1) iniciar sesión como usuario de Norte; (2) solicitar S-201. Esperado: acceso denegado sin datos de Sur, según el criterio de aislamiento. Actual: la respuesta contiene datos de Sur. Evidencia: respuesta anonimizada. Severidad y prioridad propuestas: altas por exposición cruzada, sujetas al triaje. Nunca adjuntes credenciales ni datos reales.",
    },
    activity: {
      title: "Actividad — el tribunal del triaje",
      scenario:
        "En el triaje llegan cuatro defectos ficticios: exposición entre flotas, una etiqueta desalineada, un mapa lento bajo una carga especificada y una alerta ausente.",
      questions: [
        "Asigna severidad y prioridad a cada uno, y justifica la combinación. ¿Quién debería validar cada dimensión?",
        "¿Qué información adicional necesitas antes de priorizar cada caso?",
        "Redacta un reporte completo para la exposición entre flotas con pasos y evidencia sintética, sin contraseñas ni datos reales.",
      ],
    },
    keyPoints: [
      "Severidad mide impacto, prioridad mide urgencia: son dimensiones independientes y deben asignarse por separado.",
      "El ciclo de vida del defecto termina con una prueba de confirmación, no con el «corregido» del desarrollador.",
      "Un reporte efectivo reproduce, cita su base y propone clasificación: datos verificables, no juicios.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, caps. 1.2.3 y 5.5 (Defect Management), 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
      "ISO/IEC/IEEE 29119-3 (plantillas de reporte de incidente).",
    ],
  },
];
