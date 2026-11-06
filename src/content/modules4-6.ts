import type { TrainingModule } from "./types";

export const modules4to6: TrainingModule[] = [
  {
    id: 4,
    title: "El proceso de pruebas: planificación, análisis, diseño, implementación, ejecución y cierre",
    minutes: 40,
    intro:
      "Probar no es «ejecutar casos»: es un proceso con actividades encadenadas que producen productos de trabajo (testware) trazables entre sí. El CTFL v4.0 organiza el proceso en seis actividades principales. Verlas como un todo permite que QA y Desarrollo sepan qué se decide en cada etapa y qué artefacto esperar.",
    objectives: [
      "Enumerar las seis actividades del proceso de pruebas del CTFL v4.0.",
      "Distinguir entre criterios de entrada y de salida, y aplicarlos por nivel de prueba.",
      "Relacionar cada actividad con sus productos de trabajo (testware) y su trazabilidad.",
    ],
    blocks: [
      {
        type: "h3",
        text: "Las seis actividades del proceso",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Planificación de las pruebas: definir objetivos de prueba y elegir un enfoque que los cumpla. Productos típicos: plan de pruebas, criterios de entrada y salida, presupuesto y cronograma.",
          "Análisis de pruebas: examinar la base de pruebas (requisitos, historias de usuario, diseño) e identificar condiciones de prueba cubriendo lo que se va a verificar. Productos: condiciones de prueba, riesgos priorizados.",
          "Diseño de pruebas: elaborar las condiciones en casos de prueba y otros productos de diseño (datos, entornos, procedimientos). Productos: casos de prueba con valores de entrada y resultados esperados.",
          "Implementación de pruebas: organizar y priorizar los casos, preparar su ejecución (scripts, datos, configuración del entorno). Productos: suites de prueba ordenadas y automatizables.",
          "Ejecución de pruebas: correr los casos, registrar resultados y comparar lo obtenido con lo esperado. Productos: resultados de prueba, informes de defectos, evidencia de cobertura.",
          "Cierre de pruebas: consolidar aprendizajes, archivar testware y comunicar conclusiones a las partes interesadas. Productos: informe de cierre, métricas, lecciones aprendidas.",
        ],
      },
      {
        type: "def",
        term: "Base de pruebas (test basis)",
        text: "El conjunto de documentos o informaciones sobre los que se basan las pruebas: requisitos, historias de usuario, diseños, código, contratos. Su calidad limita la calidad de las pruebas derivadas.",
        source: "ISTQB Glossary v4.0; CTFL v4.0.1, cap. 1.",
      },
      {
        type: "def",
        term: "Criterios de entrada (entry criteria)",
        text: "Precondiciones para emprender una actividad o nivel de prueba. Si no se cumplen, la actividad será más difícil, lenta, costosa y riesgosa. Ejemplos: recursos disponibles, base de pruebas entregada, nivel de calidad inicial.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 5.1.3.",
      },
      {
        type: "def",
        term: "Criterios de salida (exit criteria)",
        text: "Condiciones que deben lograrse para declarar terminada una actividad o nivel de prueba. Ejemplos: cobertura de requisitos alcanzada, número de defectos sin resolver, casos ejecutados, pruebas de regresión automatizadas.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 5.1.3.",
      },
      {
        type: "note",
        title: "Nota — «definición de terminado» (DoD) ágil",
        text: "En equipos ágiles, los criterios de salida se materializan a menudo en la Definition of Done de la historia o en acuerdos de equipo («nivel de aceptación terminado»). No es terminología ISTQB formal, pero es la práctica habitual de implementar los criterios de salida por nivel; conviene documentar la equivalencia para que todos la entiendan igual.",
      },
      {
        type: "table",
        caption: "Actividades, productos y responsables colaborativos",
        headers: ["Actividad", "Producto de trabajo (testware)", "Quién suele liderar en un equipo ágil"],
        rows: [
          ["Planificación", "Plan de pruebas, criterios de entrada/salida", "QA (con aporte de Dev y producto)"],
          ["Análisis", "Condiciones de prueba, riesgos", "QA y producto (Dev en contratos de API)"],
          ["Diseño", "Casos de prueba, datos, resultados esperados", "QA funcional; Dev en pruebas de componente"],
          ["Implementación", "Suites ordenadas, scripts automatizados", "Dev + QA de automatización"],
          ["Ejecución", "Resultados, reportes de defectos", "Según el nivel: Dev (componente), QA (sistema)"],
          ["Cierre", "Informe de cierre, lecciones aprendidas", "QA (retro del equipo)"],
        ],
      },
      {
        type: "warning",
        title: "Atención",
        text: "En el día a día, las actividades se solapan y se repiten por iteración; el proceso no es una cascada. Lo que no debe perderse nunca es la trazabilidad: cada caso de prueba debe remitir a la condición y al requisito que cubre, y cada defecto, al caso que lo evidenció.",
      },
    ],
    example: {
      title: "Ejemplo práctico — aislamiento entre flotas",
      body: "Historia: «Como operador de Norte consulto solo los vehículos autorizados de Norte». Del requisito se deriva la condición de aislamiento: al solicitar S-201, el acceso se deniega sin entregar datos de Sur. El código HTTP exacto debe acordarse en el contrato. QA diseña el caso, Desarrollo lo automatiza y, si falla, se registra el defecto con evidencia anonimizada. El cierre relaciona historia, condición, caso, resultado y defecto; los criterios de salida se acuerdan antes de ejecutar.",
    },
    activity: {
      title: "Actividad — tu proceso real contra el estándar",
      scenario:
        "Para la historia de aislamiento entre Norte y Sur, prepara un plan breve y recorre las seis actividades de prueba.",
      questions: [
        "¿Qué criterios de entrada y salida propondrías y quién debe acordarlos?",
        "Identifica dos condiciones y diseña dos casos con datos sintéticos y resultados esperados.",
        "Construye una matriz con historia → condición → caso → resultado → defecto y redacta un cierre con riesgos pendientes.",
      ],
    },
    keyPoints: [
      "El proceso de pruebas tiene seis actividades —planificación, análisis, diseño, implementación, ejecución y cierre— y cada una produce testware trazable.",
      "Los criterios de entrada y salida deben acordarse por nivel de prueba antes de ejecutar; en ágil suelen vivir en la Definition of Done.",
      "La trazabilidad (requisito → caso → resultado → defecto) es el mecanismo que hace los reportes inequívocos.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, caps. 1.4 y 5.1.3, 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
    ],
  },
  {
    id: 5,
    title: "Niveles de prueba: quién prueba qué, cuándo y por qué",
    minutes: 40,
    intro:
      "Los niveles de prueba son la respuesta formal a una pregunta eterna del malentendido QA–Dev: «¿ya está probado o no?». Cada nivel tiene objetivos, objetos de prueba, bases y responsables distintos. Dominar esta clasificación permite que «probado» deje de ser una opinión.",
    objectives: [
      "Diferenciar los cinco niveles de prueba del CTFL v4.0 y sus objetivos.",
      "Asignar responsables típicos por nivel y explicar el enfoque de todo el equipo.",
      "Usar la tabla comparativa de niveles para clasificar una actividad de prueba concreta.",
    ],
    blocks: [
      {
        type: "h3",
        text: "Los cinco niveles",
      },
      {
        type: "p",
        text: "El CTFL v4.0 define cinco niveles de prueba. Dos de ellos —integración de sistema— suelen olvidarse en la conversación cotidiana, que suele reducirse a «unitarias y sistema»; conocerlos evita que se pregunten niveles que el equipo ya cubre sin nombrar.",
      },
      {
        type: "table",
        caption: "Niveles de prueba según CTFL v4.0.1",
        headers: ["Nivel", "Objeto de prueba", "Objetivos típicos", "Responsable típico (equipo ágil)", "Momento"],
        rows: [
          [
            "Componente (unitaria)",
            "Unidad de código: función, clase, método",
            "Verificar el comportamiento aislado; apoyar el diseño (TDD)",
            "Desarrollador",
            "Dentro del desarrollo de cada historia",
          ],
          [
            "Integración de componentes",
            "Interfaces y colaboración entre unidades (módulos, microservicios)",
            "Detectar defectos de interfaz, contrato y flujo de datos",
            "Desarrollador (con apoyo de QA técnico)",
            "A medida que se integra la funcionalidad",
          ],
          [
            "Sistema",
            "El sistema completo, end-to-end",
            "Verificar requisitos funcionales y no funcionales contra su especificación",
            "QA (pruebas funcionales y exploratorias)",
            "Al final del sprint / antes del release",
          ],
          [
            "Integración de sistema",
            "Interacción del sistema con sistemas externos, como un proveedor de telemetría",
            "Verificar contratos, protocolos y flujos intersistemas",
            "QA técnico y DevOps (con QA funcional)",
            "En pipelines de integración continua y ambientes de staging",
          ],
          [
            "Aceptación",
            "El sistema desde la perspectiva del negocio y del usuario",
            "Validar que el sistema satisface necesidades; dar confianza para liberar",
            "Producto / usuarios clave (apoyados por QA)",
            "Antes de liberar a producción",
          ],
        ],
      },
      {
        type: "note",
        title: "Nota — «unitaria» en la industria",
        text: "La convención de la industria llama «unitaria» a casi cualquier prueba escrita con un framework xUnit, aunque ejecute varias clases, una base de datos o la red. El sentido formal (CTFL) es más estricto: prueba de componente, con la unidad aislada mediante stubs, drivers y mocks. Cuando un desarrollador dice «las unitarias pasan», vale la pena preguntar qué se está aislando realmente.",
      },
      {
        type: "note",
        title: "Nota — alfa y beta",
        text: "La práctica común distingue «pruebas alfa» (internas, controladas) y «beta» (con usuarios reales fuera de la organización). El CTFL las trata como formas de prueba de aceptación. Son convenio de la industria aplicado al nivel formal; úsalas con ese matiz.",
      },
      {
        type: "def",
        term: "Enfoque de todo el equipo (whole team approach)",
        text: "Principio por el cual cualquier miembro del equipo puede desempeñar cualquier tarea, y la calidad —incluidas las pruebas— es responsabilidad compartida. No elimina especialidades: define que los límites de responsabilidad son negociables y transparentes.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 1.5.2.",
      },
      {
        type: "warning",
        title: "Atención",
        text: "Los niveles no son una cascada obligatoria: en iteraciones y en DevOps pueden solaparse, ejecutarse en distinto orden o de forma continua en pipelines. Lo que sí deben tener todos es: objetivos claros, criterios de entrada y salida, y trazabilidad.",
      },
    ],
    example: {
      title: "Ejemplo práctico — alerta de velocidad por nivel",
      body: "Para una alerta de velocidad: (1) una prueba de componente valida el cálculo aislado del umbral; (2) integración de componentes comprueba que la lectura llega al evaluador; (3) sistema verifica el flujo visible desde la lectura hasta la alerta; (4) integración de sistema verifica el intercambio con un simulador o entorno de pruebas del proveedor; (5) operaciones valida en aceptación que se cumplen los criterios acordados. Cada nivel aporta evidencia diferente.",
    },
    activity: {
      title: "Actividad — clasifica estas pruebas",
      scenario:
        "Clasifica los cinco casos del ejemplo de alerta: función aislada, colaboración entre componentes, flujo visible completo, intercambio con proveedor y validación de operaciones.",
      questions: [
        "Asigna a cada actividad su nivel según CTFL. ¿Alguna es ambigua? ¿Por qué?",
        "Registra el objeto de prueba, las dependencias, el responsable propuesto y la evidencia de cada caso.",
        "¿Qué riesgo queda abierto si falta uno de los niveles? ¿Por qué la herramienta por sí sola no determina el nivel?",
      ],
    },
    keyPoints: [
      "El CTFL define cinco niveles: componente, integración de componentes, sistema, integración de sistema y aceptación; cada uno con objetivos, objetos y responsables propios.",
      "En el enfoque de todo el equipo los límites de responsabilidad son transparentes y negociables, no murallas entre áreas.",
      "«Unitaria» en la industria suele ser más amplio que «prueba de componente» en el estándar: verifica qué se aísla realmente.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, cap. 2.2 (Test Levels and Test Types), 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
    ],
  },
  {
    id: 6,
    title: "Tipos de prueba: funcional, no funcional, regresión, humo y confirmación",
    minutes: 35,
    intro:
      "Si los niveles responden «dónde» y «quién», los tipos de prueba responden «qué se evalúa» y «con qué propósito». La confusión más dañina entre áreas es la de regresión con confirmación y la de «tipo» con «nivel»: este módulo las separa con precisión.",
    objectives: [
      "Distinguir tipo de prueba y nivel de prueba como clasificaciones independientes.",
      "Definir funcional, no funcional, regresión, humo y confirmación con sus fuentes.",
      "Decidir qué tipo aplica ante una solicitud vaga del estilo «hay que probar esto».",
    ],
    blocks: [
      {
        type: "def",
        term: "Prueba funcional",
        text: "Evalúa las funciones que el sistema debe desempeñar, basándose en la base de pruebas funcional (requisitos, historias). Responde: ¿hace lo que debe hacer?",
        source: "ISTQB Glossary v4.0; CTFL v4.0.1, cap. 2.2.",
      },
      {
        type: "def",
        term: "Prueba no funcional",
        text: "Evalúa atributos de calidad distintos de la función: rendimiento, seguridad, compatibilidad, usabilidad, fiabilidad. Responde: ¿lo hace bien, en las condiciones exigidas?",
        source: "ISTQB Glossary v4.0; CTFL v4.0.1, cap. 2.2.",
      },
      {
        type: "def",
        term: "Prueba de regresión",
        text: "Repetición selectiva de pruebas tras cambios, para detectar defectos en funcionalidad que antes operaba correctamente: verifica que lo que funcionaba sigue funcionando.",
        source: "ISTQB Glossary v4.0.",
      },
      {
        type: "def",
        term: "Prueba de confirmación (retest)",
        text: "Repetición de una prueba que falló, tras la corrección del defecto que causó la falla, para confirmar que el defecto fue eliminado.",
        source: "ISTQB Glossary v4.0.",
      },
      {
        type: "def",
        term: "Prueba de humo (smoke)",
        text: "Subconjunto de pruebas que cubre la funcionalidad principal para decidir si el objeto de prueba es lo suficientemente estable para proseguir con pruebas más exhaustivas. Convenio de la industria para implementar los criterios de entrada del nivel de sistema.",
        source: "Convenio de la industria; coherente con CTFL v4.0.1 cap. 5.1.3 (criterios de entrada).",
      },
      {
        type: "note",
        title: "Nota — tipo vs. nivel",
        text: "Son clasificaciones independientes que se combinan: una prueba funcional puede ejecutarse en nivel de componente (el dev valida una regla de negocio) o de sistema (QA valida el flujo completo); una regresión puede cubrir varios niveles. La pregunta correcta es doble: «¿qué tipo de información busco?» y «¿en qué nivel?».",
      },
      {
        type: "note",
        title: "Nota — «humo» y «sanity» en la industria",
        text: "Muchos equipos distinguen «smoke» (amplia, sobre build inestable) de «sanity» (focalizada, tras un arreglo, sobre build estable). El glosario ISTQB no formaliza «sanity testing»; la guía recomienda hablar de «prueba de confirmación» cuando se quiere precisión estándar, y dejar «sanity» como convenio interno definido por el equipo.",
      },
      {
        type: "table",
        caption: "Las cinco familias en una conversación",
        headers: ["Alguien dice…", "Pregunta de precisión", "Tipo real probable"],
        rows: [
          ["«Hay que regresionar esto»", "¿Reejecutamos todo o lo afectado por el cambio?", "Regresión (selectiva, guiada por riesgo)"],
          ["«Vuelve a probar el ticket 452»", "¿Confirmar que la corrección eliminó la falla?", "Confirmación (retest)"],
          ["«Corre un smoke antes del release»", "¿Validar estabilidad para entrar a las pruebas de sistema?", "Humo (criterio de entrada)"],
          ["«El mapa tarda demasiado»", "¿Con qué carga y criterio medible?", "No funcional (rendimiento)"],
          ["«Verifica que se genera la alerta»", "¿Contra qué criterio de aceptación?", "Funcional"],
        ],
      },
    ],
    example: {
      title: "Ejemplo práctico — corrección de alerta de velocidad",
      body: "Se corrige una alerta que no se generaba por encima del umbral. QA repite el caso fallido para confirmar la corrección. La regresión selectiva comprueba reglas de otras flotas y otras alertas potencialmente afectadas. Una prueba de humo verifica acceso, carga básica de la flota y recepción de una lectura simulada antes de continuar.",
    },
    activity: {
      title: "Actividad — auditoría del lunes",
      scenario:
        "Clasifica cinco pruebas: consulta de vehículos autorizados; tiempo de carga del mapa bajo una carga acordada; repetición del caso de alerta corregido; regresión de alertas; y verificación básica de un despliegue.",
      questions: [
        "Para cada prueba indica tipo, nivel, resultado esperado y responsable propuesto.",
        "¿Qué carga y criterio de rendimiento deben acordarse antes de decidir si pasa la prueba del mapa?",
        "¿Por qué confirmar la alerta corregida no sustituye la regresión?",
      ],
    },
    keyPoints: [
      "Tipo y nivel son ejes independientes: toda prueba tiene ambos, y nombrarlos evita la ambigüedad de «probar esto».",
      "Regresión y confirmación no son intercambiables: la primera busca efectos colaterales, la segunda verifica una corrección.",
      "Humo es un convenio de la industria que implementa criterios de entrada; conviene definirlo explícitamente en el equipo.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, cap. 2.2, 2024.",
      "ISTQB® Glossary of Testing Terms v4.0.",
    ],
  },
];
