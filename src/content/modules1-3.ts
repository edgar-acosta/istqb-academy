import type { TrainingModule } from "./types";

export const modules1to3: TrainingModule[] = [
  {
    id: 1,
    title: "El costo de no entendernos: por qué un lenguaje común",
    minutes: 25,
    intro:
      "QA y Desarrollo persiguen el mismo objetivo —entregar software que funcione y genere valor—, pero con frecuencia lo hacen hablando idiomas distintos. Este módulo cuantifica el problema y presenta el argumento central de la guía: la terminología compartida no es burocracia, es infraestructura de comunicación.",
    objectives: [
      "Reconocer situaciones cotidianas donde la ambigüedad terminológica genera retrabajo.",
      "Explicar qué se gana y qué se pierde cuando QA y Desarrollo usan vocabulario distinto.",
      "Distinguir teoría, práctica y convención de la industria al hablar de pruebas.",
    ],
    blocks: [
      {
        type: "p",
        text: "Piensa en la última conversación que escuchaste (o tuviste) como esta: QA reporta «la prueba no pasa», desarrollo responde «en mi máquina funciona», y veinte minutos después resulta que la «prueba» de QA era un caso de sistema ejecutado contra un entorno con datos distintos al del desarrollador. Nadie mintió; todos usaban las mismas palabras para cosas diferentes.",
      },
      {
        type: "h3",
        text: "Escenarios típicos de malentendido",
      },
      {
        type: "list",
        items: [
          "«Cobertura»: para QA suele significar cobertura de requisitos o de casos de prueba planeados; para Desarrollo, cobertura de código (líneas o ramas ejecutadas). Un «80 % de cobertura» puede describir realidades incomparables.",
          "«No pasa»: puede significar que el caso de prueba reveló un defecto del producto, o que la propia prueba está mal diseñada o mal automatizada. Sin criterios, la discusión degenera en opiniones.",
          "«Unitaria»: para muchos desarrolladores es cualquier prueba escrita con JUnit o similar, aunque ejecute tres clases y una base de datos; para QA es un nivel específico con objetivos definidos.",
          "«Listo para probar»: sin criterios de entrada, significa cosas distintas en cada equipo y cada sprint.",
        ],
      },
      {
        type: "h3",
        text: "Qué es la teoría, la práctica y la convención",
      },
      {
        type: "p",
        text: "A lo largo de la guía distinguiremos tres capas. La teoría es lo que el cuerpo de conocimiento establece con definiciones formales (en nuestro caso, el syllabus ISTQB y el glosario oficial). La práctica es lo que los equipos hacen de verdad en sus flujos de trabajo ágiles. La convención de la industria son usos extendidos que ni la teoría ni una práctica concreta garantizan, pero que circulan en foros, herramientas y conversaciones de pasillo. Cuando un término se use en un sentido convencional distinto al formal, lo señalaremos en un recuadro «Nota».",
      },
      {
        type: "def",
        term: "Lenguaje común (en esta guía)",
        text: "Conjunto de términos formales, con definición acordada y fuente identificable, que QA y Desarrollo usan al planear, ejecutar y reportar pruebas, de modo que una afirmación signifique lo mismo para ambas áreas.",
        source: "Definición operativa de esta guía (no proviene del glosario ISTQB).",
      },
      {
        type: "warning",
        title: "Atención",
        text: "Adoptar terminología común no busca señalar culpables ni «ganar» discusiones. El propósito es colaborativo: reducir el costo de coordinación y hacer que los defectos se discutan con datos y criterios, no con adjetivos. Si en tu equipo la conversación terminológica se vuelve acusatoria, el ejercicio ha fracasado aunque el vocabulario sea perfecto.",
      },
      {
        type: "note",
        title: "Nota",
        text: "Las fuentes cargadas para esta guía contienen el programa y los objetivos del documento, pero no incluyen corpus adicional de definiciones. Las definiciones formales de los módulos 2 a 8 provienen del syllabus ISTQB CTFL v4.0.1 y del glosario ISTQB v4.0 (ver Referencias); cuando un dato no pudo confirmarse en fuentes oficiales, se indica explícitamente.",
      },
    ],
    example: {
      title: "Ejemplo práctico — una lectura desactualizada",
      body: "QA reporta que N-101 «no actualiza». Desarrollo observa que el API responde correctamente. Al precisar el problema, identifican una falla observable: el mapa muestra como vigente una lectura cuya hora de evento tiene más de cinco minutos de antigüedad. La respuesta del API y la vigencia del dato son aspectos distintos. El equipo registra la hora del evento, la hora de observación y el resultado esperado, e investiga después el defecto que causó la falla.",
    },
    activity: {
      title: "Actividad — mapa de malentendidos del equipo",
      scenario:
        "Reúne a QA y Desarrollo. Cada persona define «vehículo en línea», «última posición», «alerta activa» y «cobertura» sin consultar a las demás.",
      questions: [
        "¿En qué términos coincidieron las definiciones y en cuáles divergieron?",
        "¿Qué consecuencia podría tener una divergencia para el operador de una flota? Describe un ejemplo.",
        "¿Qué fuente oficial usarían para dirimir cada divergencia: glosario ISTQB, syllabus, acuerdo de equipo documentado?",
        "Elabora un glosario de cuatro términos con definición operativa, responsable y fuente formal donde exista; distingue los acuerdos propios del vocabulario ISTQB.",
      ],
    },
    keyPoints: [
      "La ambigüedad terminológica entre QA y Desarrollo tiene costo real: retrabajo, defectos mal clasificados y discusiones improductivas.",
      "Un lenguaje común distingue teoría (definiciones formales con fuente), práctica (lo que el equipo hace) y convención de la industria.",
      "El objetivo de la guía es colaborativo: crear puentes, no señalar culpables.",
    ],
    sources: [
      "ISTQB®, Certified Tester Foundation Level (CTFL) Syllabus v4.0.1, 2024.",
      "Programa de esta guía (fuente cargada): estructura y objetivos de aprendizaje.",
    ],
  },
  {
    id: 2,
    title: "ISTQB: qué es, de dónde viene y para qué sirve",
    minutes: 30,
    intro:
      "El International Software Testing Qualifications Board (ISTQB) es el organismo que mantiene el esquema de certificación de testers más extendido del mundo. Entender su origen, su propósito y su estructura de certificaciones permite usarlo como referente común sin convertirlo en dogma.",
    objectives: [
      "Describir el origen y el propósito del ISTQB como organismo de estándares de competencia.",
      "Explicar la estructura del esquema de certificaciones (Foundation, Advanced, Expert y especialidades).",
      "Ubicar qué parte de la terminología de esta guía proviene del CTFL v4.0.1.",
    ],
    blocks: [
      {
        type: "def",
        term: "ISTQB (International Software Testing Qualifications Board)",
        text: "Organismo sin ánimo de lucro fundado en 2002 en Edimburgo que reúne a boards nacionales y regionales de certificación de pruebas de software. Mantiene el esquema «Certified Tester», emite los syllabi, el glosario y los exámenes, y delega la aplicación en los boards miembro.",
        source: "istqb.org; historial público del organismo.",
      },
      {
        type: "def",
        term: "Syllabus",
        text: "Documento oficial que define el alcance, los objetivos de aprendizaje y el vocabulario de una certificación. Para Foundation Level, el documento vigente es la revisión 4.0.1 del syllabus CTFL v4.0 (actualización de erratas publicada en septiembre de 2024).",
        source: "ISTQB CTFL Syllabus v4.0.1, 2024.",
      },
      {
        type: "h3",
        text: "Propósito del esquema de certificación",
      },
      {
        type: "p",
        text: "El propósito declarado del esquema Certified Tester es doble: por un lado, establecer un nivel común y verificable de conocimiento en pruebas de software; por otro, ofrecer una ruta de desarrollo profesional. Su business outcome más citado —y el que nos interesa en esta guía— es promover la comunicación eficiente y efectiva mediante un vocabulario común para las pruebas de software.",
      },
      {
        type: "h3",
        text: "Estructura del esquema de certificaciones",
      },
      {
        type: "table",
        caption: "Niveles del esquema Certified Tester (Core Stream)",
        headers: ["Nivel", "Certificaciones principales", "Enfoque"],
        rows: [
          [
            "Foundation (CTFL)",
            "Certified Tester Foundation Level v4.0",
            "Conceptos fundamentales, vocabulario, técnicas básicas de diseño y gestión. Es el prerrequisito de los demás niveles y el referente de esta guía.",
          ],
          [
            "Advanced",
            "Test Analyst, Technical Test Analyst, Test Manager",
            "Profundización por rol: análisis y diseño de pruebas (TA), pruebas técnicas y basadas en código (TTA), gestión de pruebas (TM).",
          ],
          [
            "Expert",
            "Test Management, Improving the Test Process",
            " Competencia avanzada para mejorar procesos de prueba organizacionales.",
          ],
          [
            "Especialidades (streams)",
            "Agile Tester, AI Testing, Mobile, seguridad, automación, entre otras",
            "Extensiones que aplican el núcleo Foundation a dominios o contextos concretos.",
          ],
        ],
      },
      {
        type: "note",
        title: "Nota — alcance de esta guía",
        text: "Esta guía usa el nivel Foundation (CTFL v4.0.1) como referente terminológico para QA y Desarrollo. No pretende preparar para el examen de certificación ni sustituir la lectura del syllabus, cuyo texto completo no forma parte de las fuentes cargadas. Verifica versiones vigentes en istqb.org antes de citarlas formalmente.",
      },
      {
        type: "note",
        title: "Nota — ISTQB como referente, no como ley",
        text: "En la industria conviven otras referencias (ISO/IEC/IEEE 29119, libros clásicos como Myers, prácticas ágiles). Esta guía adopta ISTQB porque su glosario es público, mantenido y multilingüe; cuando la práctica común difiera del glosario formal, lo señalaremos en recuadros como este.",
      },
      {
        type: "h3",
        text: "Cómo usar esta guía junto con el material ISTQB",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Usa los módulos 3 a 8 como tu base terminológica diaria: allí están las definiciones formales con su fuente.",
          "Consulta el glosario de esta guía (ordenado alfabéticamente) antes de discutir un término en un ticket o una retrospectiva.",
          "Si necesitas profundizar o certificarte, sigue la ruta de Referencias al final del documento.",
        ],
      },
    ],
    example: {
      title: "Ejemplo práctico — decidir con criterios compartidos",
      body: "Al elegir cómo probar la integración con un proveedor de telemetría, QA y Desarrollo acuerdan el objeto, el nivel, los objetivos y los riesgos antes de comparar herramientas. Una herramienta no determina por sí sola el nivel de prueba: este depende del alcance y de las dependencias realmente incluidas. El equipo documenta sus términos y acuerdos junto con las referencias del syllabus.",
    },
    activity: {
      title: "Actividad — auditoría de vocabulario en tus herramientas",
      scenario:
        "Revisa diez tickets anonimizados o simulados sobre mapa y alertas de telemetría. Anota términos ISTQB y convenciones propias del producto.",
      questions: [
        "¿Cuántos de esos términos podrías definir citando una fuente formal?",
        "¿Algún ticket usa un término ISTQB en un sentido distinto al formal? ¿Qué confusión podría generar?",
        "Registra en una tabla cada término, uso observado, definición acordada, fuente y posible confusión. ¿Qué campos faltan en los reportes?",
      ],
    },
    keyPoints: [
      "ISTQB es un organismo sin ánimo de lucro cuyo esquema Certified Tester define un vocabulario común verificable para las pruebas de software.",
      "El esquema se organiza en Foundation (prerrequisito), Advanced, Expert y streams especializados; esta guía toma el CTFL v4.0.1 como referente.",
      "ISTQB se usa aquí como referente terminológico práctico, no como dogma ni como preparación de examen.",
    ],
    sources: [
      "ISTQB®, Certified Tester Foundation Level (CTFL) Syllabus v4.0.1, 2024.",
      "istqb.org — esquema de certificaciones y releases oficiales (CTFL v4.0, 9 de mayo de 2023; revisión de syllabus 4.0.1, 15 de septiembre de 2024).",
    ],
  },
  {
    id: 3,
    title: "Los siete principios fundamentales de las pruebas",
    minutes: 35,
    intro:
      "El CTFL v4.0 articula siete principios que describen cómo funcionan las pruebas en cualquier contexto. No son reglas opcionales: son restricciones físicas y económicas del ejercicio de probar. Comprenderlos evita expectativas irreales y decisiones ingenuas de planificación.",
    objectives: [
      "Enunciar los siete principios de las pruebas del CTFL v4.0.",
      "Aplicar cada principio a una situación concreta del flujo de trabajo del equipo.",
      "Explicar por qué la prueba exhaustiva es imposible y qué implica para la priorización.",
    ],
    blocks: [
      {
        type: "h3",
        text: "Los siete principios",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Las pruebas muestran la presencia de defectos, no su ausencia. Probar reduce la probabilidad de defectos no descubiertos; nunca demuestra que no existan.",
          "La prueba exhaustiva es imposible (salvo casos triviales). Probar todo, con todos los datos y en todos los estados, no es alcanzable; se debe usar priorización y análisis de riesgo.",
          "La prueba temprana ahorra trabajo. Los defectos de requisitos que sobreviven hasta producción son los más caros de corregir; las actividades estáticas y el análisis temprano los capturan antes (base del Shift-Left, módulo 9).",
          "La agrupación de defectos. Un número pequeño de módulos concentra la mayoría de los defectos; los esfuerzos de prueba deben focalizarse allí (principio de Pareto aplicado).",
          "La paradoja del pesticida. Si repetimos siempre las mismas pruebas, dejan de encontrar defectos nuevos: los datos y los enfoques deben revisarse y variarse periódicamente.",
          "Las pruebas dependen del contexto. Una plataforma de telemetría multiflota plantea riesgos distintos a otros dominios; las técnicas, niveles y criterios se eligen según el contexto.",
          "La ausencia de defectos es una falacia. Un sistema libre de defectos que no cumple las necesidades del usuario es un fracaso; los requisitos equivocados probados a la perfección siguen siendo equivocados.",
        ],
      },
      {
        type: "note",
        title: "Nota",
        text: "En la industria es común citar estos principios como «reglas del testing», pero su estatus es el de principios: describen cómo se comporta la actividad de probar, no mandatos normativos. El syllabus los usa para explicar decisiones de planificación, no para auditar cumplimiento.",
      },
      {
        type: "def",
        term: "Prueba exhaustiva",
        text: "Prueba que cubre todas las combinaciones de entradas y estados precondición de un objeto de prueba. El principio 2 establece que solo es factible en casos triviales.",
        source: "ISTQB Glossary v4.0; CTFL v4.0.1, principio 2.",
      },
      {
        type: "warning",
        title: "Atención",
        text: "«Cobertura del 100 %» no significa «prueba exhaustiva». Una cobertura alta de líneas o requisitos puede coexistir con combinaciones de datos y estados sin explorar. Ante la frase «ya lo probamos todo», pregunta: ¿todo qué, medido cómo, contra qué riesgo?",
      },
      {
        type: "h3",
        text: "Consecuencias prácticas para QA y Desarrollo",
      },
      {
        type: "table",
        caption: "Del principio a la práctica",
        headers: ["Principio", "Pregunta colaborativa que propone"],
        rows: [
          [
            "Presencia, no ausencia",
            "¿Qué riesgos estamos reduciendo con esta prueba y cuáles quedan abiertos?",
          ],
          [
            "Imposibilidad de exhaustividad",
            "¿Qué combinaciones dejar fuera y por qué? ¿Qué dice el análisis de riesgo?",
          ],
          [
            "Prueba temprana",
            "¿Qué podemos revisar antes de escribir código: requisito, diseño, contrato de API?",
          ],
          [
            "Agrupación de defectos",
            "¿Dónde se concentraron los defectos del último release y cómo enfocamos ahí?",
          ],
          [
            "Paradoja del pesticida",
            "¿Cuándo fue la última vez que actualizamos datos y casos de prueba?",
          ],
          [
            "Dependencia del contexto",
            "¿Qué cambia en nuestra estrategia por la vigencia de lecturas, las alertas y el aislamiento entre flotas?",
          ],
          [
            "Falacia de la ausencia de defectos",
            "¿Estamos probando contra los criterios de aceptación correctos, no solo contra el código?",
          ],
        ],
      },
    ],
    example: {
      title: "Ejemplo práctico — cobertura de telemetría",
      body: "Una cobertura elevada del código que procesa lecturas no demuestra que se hayan probado eventos tardíos, fuera de orden, cambios de flota o pérdidas de conexión. QA y Desarrollo priorizan estas combinaciones por riesgo y revisan los criterios de aceptación; reconocen que incluso una cobertura alta no demuestra la ausencia de defectos.",
    },
    activity: {
      title: "Actividad — principios en acción",
      scenario:
        "En un trimestre ficticio, el 70 % de los defectos reportados se concentró en el procesamiento de eventos y el mapa; la regresión usa siempre lecturas recientes y ordenadas. Esta cifra no es una medición real.",
      questions: [
        "¿Qué principios están ilustrados en esta situación? Nómbralos con su formulación formal.",
        "¿Qué acciones concretas propondrías para cada principio identificado?",
        "Elabora una matriz con riesgos, escenarios nuevos, justificación y riesgos residuales.",
        "¿Cómo comunicarías la propuesta a desarrollo sin que suene a reproche? Redacta el mensaje usando el vocabulario común.",
      ],
    },
    keyPoints: [
      "Los siete principios describen restricciones reales de la actividad de probar: la prueba exhaustiva es imposible y solo se demuestra la presencia de defectos.",
      "Cada principio traduce en una pregunta colaborativa que mejora la planificación conjunta de QA y Desarrollo.",
      "La paradoja del pesticida y la agrupación de defectos exigen mantener vivos los casos de prueba y focalizar el esfuerzo donde el historial lo justifica.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, cap. 1.3 (Testing Principles), 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
    ],
  },
];
