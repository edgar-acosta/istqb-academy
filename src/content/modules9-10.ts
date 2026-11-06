import type { TrainingModule } from "./types";

export const modules9to10: TrainingModule[] = [
  {
    id: 9,
    title: "Shift-Left Testing: el concepto y su fundamento",
    minutes: 35,
    intro:
      "Shift-Left no es «que QA trabaje más temprano», ni una moda de herramientas: es el principio de que las actividades de prueba deben adelantarse todo lo posible en el ciclo de vida, porque cada defecto se vuelve más caro conforme viaja hacia producción. Este módulo define el concepto con rigor y lo contrapone al modelo tradicional.",
    objectives: [
      "Definir Shift-Left Testing y su fundamento económico.",
      "Contrastar el modelo tradicional (pruebas al final) con el modelo shift-left.",
      "Usar una analogía transferible para explicar el concepto a perfiles no técnicos.",
    ],
    blocks: [
      {
        type: "def",
        term: "Shift-Left (aproximación shift-left)",
        text: "Enfoque en el que las actividades de prueba se realizan lo antes posible en el ciclo de vida de desarrollo de software, de modo que los defectos se introduzcan y detecten cuanto antes, reduciendo su costo y su propagación.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 2.1.5 (Shift-Left Approach).",
      },
      {
        type: "p",
        text: "El fundamento es el principio 3 de las pruebas (módulo 3): la prueba temprana ahorra trabajo. Añadiendo la evidencia empírica de la industria —el costo de un defecto crece de forma no lineal con la fase en que se detecta—, el shift-left deja de ser preferencia y se convierte en decisión económica: un defecto de requisitos corregido en el documento cuesta horas; el mismo defecto detectado en producción cuesta corrección, datos corruptos, comunicación de crisis y posible pérdida de clientes.",
      },
      {
        type: "note",
        title: "Nota — la curva de costo de defectos",
        text: "La curva «costo por fase de detección» (barata en requisitos, cara en producción) es una generalización ampliamente aceptada en la literatura, pero los múltiplos exactos varían por estudio, dominio y organización. Las fuentes cargadas no incluyen un estudio con cifras; úsala como tendencia, no como tabla de precios, y mide tu propia distribución de costos de defectos si necesitas números defendibles.",
      },
      {
        type: "table",
        caption: "Modelo tradicional vs. shift-left",
        headers: ["Dimensión", "Modelo tradicional (V-model clásico)", "Modelo shift-left"],
        rows: [
          [
            "Cuándo se prueba",
            "Al final de cada fase o del proyecto, cuando el software ya existe",
            "Desde los requisitos: en cada actividad, antes y durante la construcción",
          ],
          [
            "Quién participa",
            "QA como fase posterior al desarrollo",
            "Todo el equipo: QA y Dev desde la definición; negocio en aceptación temprana",
          ],
          [
            "Qué se detecta",
            "Fallas del software construido",
            "Errores y defectos en requisitos, diseño y código, además de fallas",
          ],
          [
            "Productos de trabajo tempranos",
            "Plan de pruebas tardío; casos derivados de requisitos ya congelados",
            "Criterios de aceptación claros, contratos de API, pruebas unitarias y análisis estático desde el inicio",
          ],
          [
            "Costo típico del defecto",
            "Alto (se detecta tarde)",
            "Menor (se intercepta en la fase que lo originó)",
          ],
          [
            "Riesgo característico",
            "Integración traumática; retrabajo masivo al final",
            "Exige disciplina de equipo: más preparación, menos heroísmo final",
          ],
        ],
      },
      {
        type: "h3",
        text: "Una analogía para llevar a la dirección",
      },
      {
        type: "p",
        text: "Como analogía, revisar una alerta de mantenimiento de un tractocamión antes de una ruta puede permitir investigar un problema antes de que interrumpa la operación. Del mismo modo, revisar un requisito de telemetría antes de construirlo puede evitar interpretaciones costosas. La analogía no sustituye los procedimientos reales de mantenimiento ni demuestra un ahorro concreto.",
      },
      {
        type: "warning",
        title: "Atención",
        text: "Shift-left no elimina la prueba de sistema ni la aceptación: adelanta lo que puede adelantarse (revisiones, criterios, pruebas de componente e integración, análisis estático) y deja los niveles end-to-end donde corresponden. Un equipo que «shift-left» todo y nunca prueba el sistema completo ha sustituido un extremo por otro.",
      },
    ],
    example: {
      title: "Ejemplo práctico — el costo de un requisito ambiguo",
      body: "La historia dice «mostrar la posición actual». Antes de desarrollar, QA pregunta qué significa «actual», qué hora se usa y cómo se muestra una lectura antigua. Para el ejercicio, producto acuerda que una lectura con más de cinco minutos desde su hora de evento se muestra desactualizada. Detectar la ambigüedad temprano puede reducir retrabajo; el ahorro real debe medirse y el criterio de un producto real debe acordarse.",
    },
    activity: {
      title: "Actividad — calcula tu costo de llegada tarde",
      scenario:
        "Analiza tres defectos simulados: lectura antigua mostrada como vigente, acceso cruzado entre flotas y alerta duplicada. El comportamiento ante duplicados requiere definición previa.",
      questions: [
        "Para cada caso indica origen hipotético, momento de detección y práctica más temprana que podría detectarlo.",
        "¿Qué evidencia y mediciones necesitarías para estimar el costo real de la detección tardía?",
        "Explica shift-left a una persona de operaciones usando la analogía de mantenimiento, sin afirmar ahorros no medidos.",
      ],
    },
    keyPoints: [
      "Shift-Left es adelantar las actividades de prueba al origen del defecto; su fundamento es económico: tarde cuesta más.",
      "Compara siempre modelo tradicional y shift-left por dimensión (cuándo, quién, qué, costo); no es una religión, es una distribución de esfuerzo.",
      "Shift-left complementa —no sustituye— los niveles end-to-end: la pirámide completa sigue siendo necesaria.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, caps. 2.1.5 y 1.3 (principio de prueba temprana), 2024.",
      "Programa de esta guía (fuente cargada): definición del enfoque y analogía pedida en el módulo 9.",
    ],
  },
  {
    id: 10,
    title: "Shift-Left en la práctica: revisiones, TDD, BDD, análisis estático y CI/CD",
    minutes: 50,
    intro:
      "El concepto solo vale si cambia el lunes. Este módulo traduce el shift-left en cinco prácticas concretas aplicables al flujo ágil actual del equipo: revisión de requisitos, TDD, BDD, análisis estático y pruebas en pipelines de CI/CD. Cierra con la tabla de equivalencias entre el vocabulario de QA y el de Desarrollo.",
    objectives: [
      "Aplicar revisiones de requisitos y criterios de aceptación como primera línea de defensa.",
      "Distinguir TDD, BDD y análisis estático, y ubicar cada uno en el flujo de trabajo.",
      "Diseñar el lugar de las pruebas en un pipeline de CI/CD y usar la tabla de equivalencias QA–Dev.",
    ],
    blocks: [
      {
        type: "def",
        term: "Prueba estática",
        text: "Evaluación de un producto de trabajo sin ejecutarlo: revisiones, inspecciones y análisis estático (linters, análisis de código). Detecta defectos en requisitos, diseño y código antes de cualquier ejecución.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 3.",
      },
      {
        type: "def",
        term: "TDD (Test-Driven Development)",
        text: "Práctica de desarrollo donde las pruebas de componente se escriben antes que el código, en ciclos cortos: rojo (falla) → verde (pasa) → refactor. Convierte el diseño de pruebas en el mecanismo de diseño del código.",
        source: "Práctica de la industria (Beck, TDD by Example); coherente con CTFL v4.0.1 cap. 2.1 (testing como driver del desarrollo).",
      },
      {
        type: "def",
        term: "BDD (Behavior-Driven Development)",
        text: "Práctica colaborativa que usa ejemplos de comportamiento compartidos por negocio, QA y desarrollo. Los escenarios pueden escribirse en Gherkin (Dado/Cuando/Entonces) y convertirse en especificaciones ejecutables cuando se vinculan a automatización.",
        source: "Convenio de la industria; CTFL v4.0.1 lo menciona como enfoque de colaboración (collaboration-based approaches).",
      },
      {
        type: "def",
        term: "Análisis estático",
        text: "Evaluación de código o documentos sin ejecutarlos mediante herramientas (linters, análisis de flujo, comprobación de estándares). Implementa el shift-left a nivel de commit.",
        source: "ISTQB CTFL Syllabus v4.0.1, cap. 3 (Static Testing).",
      },
      {
        type: "h3",
        text: "Las cinco prácticas en el flujo del equipo",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Revisión de requisitos y criterios de aceptación (QA + Dev + producto): la prueba estática más barata y la de mayor alcance. Una historia sin criterios claros no entra al sprint.",
          "TDD en el desarrollo: las pruebas de componente se escriben primero; QA participa revisando qué reglas de negocio merecen entrar al ciclo rojo–verde.",
          "BDD para comportamiento compartido: escenarios Gherkin que negocio valida, QA automatiza y desarrollo implementa; la especificación ejecutable evita el «ese no era el requisito».",
          "Análisis estático en cada commit: linter + reglas de calidad como puerta obligatoria; defectos triviales jamás llegan a revisión humana.",
          "Pruebas en CI/CD: suite de componente e integración en cada push; regresión selectiva en cada merge; humo y pruebas de sistema en ambientes de staging; release con evidencia de criterios de salida.",
        ],
      },
      {
        type: "code",
        lang: "text",
        code: `Pipeline shift-left (ejemplo de referencia, no de dogma)

commit  -> lint + análisis estático -> pruebas de componente (TDD)
merge   -> integración de componentes + contratos -> reporte de cobertura
nightly -> regresión selectiva + pruebas no funcionales ligeras
staging -> humo -> pruebas de sistema -> exploratoria -> aceptación (demo)
release -> verificación de criterios de salida por nivel -> evidencia`,
      },
      {
        type: "code",
        lang: "gherkin",
        code: `Dado que N-101 pertenece a la flota Norte
Y la regla de velocidad está activa con un umbral de 90 km/h
Cuando se recibe una lectura válida de N-101 a 91 km/h
Entonces se genera una alerta de velocidad para la flota Norte`,
      },
      {
        type: "note",
        title: "Escenario didáctico",
        text: "El umbral y la regla son ficticios: para el ejercicio se genera alerta solo al superar el umbral. El texto Gherkin por sí solo no es ejecutable; necesita implementación vinculada a automatización. Añade casos para 90 km/h, regla inactiva y visibilidad entre flotas.",
      },
      {
        type: "h3",
        text: "Tabla de equivalencias QA ↔ Desarrollo (uso diario)",
      },
      {
        type: "table",
        caption: "El mismo concepto en dos dialectos — y los malentendidos frecuentes",
        headers: ["Concepto", "Cómo lo dice QA", "Cómo lo dice Dev", "Malentendido típico"],
        rows: [
          [
            "Cobertura",
            "Cobertura de requisitos / casos de prueba planeados",
            "Cobertura de código (líneas, ramas)",
            "Un «80 % de cobertura» sin adjetivo es incomparable; siempre especifica el tipo de cobertura",
          ],
          [
            "«No pasa»",
            "La prueba revela una falla: comportamiento ≠ esperado",
            "El script/check falla (¿defecto del producto o de la prueba?)",
            "Se discute quién tiene la culpa antes de describir el dato; primero el hecho, luego la causa",
          ],
          [
            "Prueba unitaria",
            "Nivel de componente: unidad aislada",
            "«Cualquier test de JUnit», a veces con base de datos",
            "«Las unitarias pasan» no dice qué se aisló; pregunta por los dobles de prueba",
          ],
          [
            "«Listo para probar»",
            "Criterios de entrada del nivel de sistema cumplidos",
            "«Compila y corre en mi máquina»",
            "Sin acuerdo previo, es una apuesta; defínase como criterios de entrada",
          ],
          [
            "Regresión",
            "Repetir casos existentes tras un cambio",
            "A veces usado como sinónimo de «volver a correr todo»",
            "La regresión es selectiva y guiada por riesgo; no es re-ejecución total por defecto",
          ],
          [
            "Defecto vs. falla",
            "Falla observable (lo que se reporta) vs. defecto (lo que se corrige)",
            "«Bug» para todo",
            "Se habla de corregir el «bug» cuando falta la falla reproducible que lo evidencia",
          ],
          [
            "Aceptación",
            "Nivel de prueba con usuarios/negocio",
            "A veces «pruebas de aceptación» = checklist de la demo",
            "La aceptación formal valida necesidades; el checklist de demo es solo evidencia parcial",
          ],
          [
            "Ambiente de pruebas",
            "Entorno controlado con datos representativos",
            "«Local funciona»",
            "La frase «en mi máquina sí» sin datos de entorno no es comparable",
          ],
        ],
      },
      {
        type: "note",
        title: "Nota — uso de la tabla",
        text: "Esta tabla es un anexo vivo: actualícenla en retrospectiva cada vez que detecten un malentendido nuevo. El acuerdo no es que una columna «gane», sino que cada fila tenga una formulación común aceptada por ambas áreas, citando la fuente formal cuando exista (glosario ISTQB).",
      },
      {
        type: "warning",
        title: "Atención",
        text: "El shift-left mal implementado se convierte en «QA hace todo desde el día cero sin apoyo»: eso es sobrecarga, no transformación. El indicador de éxito es compartido: si QA sigue siendo la única persona que prueba temprano, el equipo no ha shift-left nada; solo ha cambiado el calendario de QA.",
      },
    ],
    example: {
      title: "Ejemplo práctico — una historia, cinco prácticas",
      body: "Historia: alerta de velocidad para una flota. Producto, QA y Desarrollo revisan umbral, igualdad, permisos y datos inválidos. Desarrollo escribe primero pruebas de componente; el equipo valida escenarios BDD; el pipeline ejecuta análisis y pruebas de componente e integración. En un entorno controlado se valida el flujo completo y operaciones participa en aceptación. Se conserva evidencia por nivel y se usan lecturas sintéticas.",
    },
    activity: {
      title: "Actividad — diseña tu shift-left mínimo viable",
      scenario:
        "Diseña un flujo de integración continua para una alerta de velocidad con revisión de requisitos, pruebas de componente e integración, sistema y aceptación en un entorno controlado.",
      questions: [
        "¿Qué prácticas evitan ambigüedades en la historia y cuáles verifican el flujo completo?",
        "Dibuja el pipeline con sus pasos, responsables, criterios de salida y justificación.",
        "Elige dos filas de la tabla de equivalencias y escribe la «versión común» acordada que pondrías en la wiki del equipo.",
        "Define dos métricas con fórmula, fuente, periodo y línea base a medir; por ejemplo, historias revisadas antes del desarrollo y defectos detectados antes de integrar.",
      ],
    },
    keyPoints: [
      "El shift-left se implementa con cinco prácticas concretas: revisión de requisitos, TDD, BDD, análisis estático y pruebas en CI/CD.",
      "TDD ordena el diseño del código; BDD ordena el lenguaje entre negocio, QA y Dev; el pipeline ordena la evidencia por nivel.",
      "La tabla de equivalencias QA–Dev convierte los dialectos en un vocabulario común: revísala y agrégala en retrospectiva.",
    ],
    sources: [
      "ISTQB®, CTFL Syllabus v4.0.1, caps. 2.1, 3 y 4.4 (collaboration-based approaches), 2024.",
      "Beck, K., Test-Driven Development: By Example, 2002 (práctica TDD).",
      "Programa de esta guía (fuente cargada): tabla de equivalencias y malentendidos frecuentes.",
    ],
  },
];
