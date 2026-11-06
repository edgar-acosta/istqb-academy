# Propuesta de adaptación: ISTQB y Shift-Left para telemetría de tractocamiones

**Estado:** propuesta para revisión; no se han modificado los módulos ni la evaluación.

## 1. Objetivo y alcance

Adaptar los ejemplos, ejercicios, actividades y evaluación de la guía a una plataforma web hipotética de monitoreo de tractocamiones para múltiples flotas. Se mantienen los objetivos de aprendizaje, la terminología de pruebas, los diez módulos y el enfoque colaborativo entre QA, desarrollo y negocio.

La plataforma, las reglas y los datos de este documento son **supuestos didácticos**, no una descripción verificada de un producto existente ni obligaciones legales o de seguridad operacional. Los umbrales, tiempos y criterios de aceptación deben ser confirmados por producto y operaciones antes de aplicarse a un sistema real.

## 2. Diagnóstico del contenido actual

| Módulo | Tema actual | Contenido que requiere contextualización |
|---|---|---|
| 1 | Lenguaje común entre QA y desarrollo | Ejemplo de inicio de sesión y actividad de términos ambiguos. |
| 2 | ISTQB y vocabulario compartido | Decisión sobre herramientas y reglas de un API de pedidos; auditoría de tickets. |
| 3 | Siete principios de prueba | Cobertura y defectos en pagos; concentración de defectos en pedidos. |
| 4 | Proceso y trazabilidad de pruebas | Historia y autorización del API de pedidos; ejercicio sobre proceso real. |
| 5 | Niveles de prueba | Reembolso y pasarela de pago; clasificación de pruebas de checkout y ERP. |
| 6 | Tipos de prueba | Recuperación de contraseña, ventas y carrito; confirmación, regresión y humo. |
| 7 | Técnicas de diseño | Edad, descuentos, estados de pedidos, pagos y reglas de contraseña en ejemplos y bloques de código. |
| 8 | Gestión de defectos | Matriz de severidad y prioridad, reporte de pago y triaje de defectos comerciales. |
| 9 | Fundamento de Shift-Left | Cancelación de pedido y analogía del techo; análisis de defectos tardíos. |
| 10 | Prácticas Shift-Left | Historia de billetera digital, ejemplos de pipeline y actividad de mejora. |

Los ejemplos no están limitados a las secciones «Ejemplo» y «Actividad»: también aparecen en párrafos, listas, tablas y bloques de código. Se deben revisar todos esos elementos sin eliminar las definiciones, advertencias o fuentes relevantes.

La evaluación actual contiene diez preguntas de opción múltiple; cubre los módulos 1, 3, 4, 5, 6, 7, 8, 9 y 10, pero **no incluye una pregunta del módulo 2** y contiene dos sobre el módulo 5. Se propone una pregunta por módulo. Actualmente el umbral mostrado es 7/10; se propone conservarlo.

## 3. Caso transversal propuesto

### Actores y componentes hipotéticos

- **Operador de flota:** consulta únicamente los tractocamiones y eventos de sus flotas autorizadas.
- **Administrador de flota:** administra permisos y reglas permitidas para su flota, según la especificación que se acuerde.
- **Supervisor de operaciones:** revisa posiciones, estado de conexión y alertas.
- **Equipo de producto, QA y desarrollo:** acuerda requisitos, diseña pruebas y evalúa riesgos.
- **Sistema externo de telemetría:** transmite lecturas de dispositivos; el ejemplo no presupone un proveedor, protocolo ni tecnología concretos.
- **Plataforma web:** recibe lecturas, muestra la última posición conocida y permite consultar eventos y alertas por flota.

### Datos ficticios comunes

| Dato | Valor de ejemplo |
|---|---|
| Flotas | Norte y Sur, con usuarios y vehículos distintos. |
| Vehículos | N-101 pertenece a Norte; S-201 pertenece a Sur. |
| Lectura | Identificador de evento, vehículo, marca de tiempo, posición y velocidad. |
| Hora de eventos | UTC en los datos de prueba; presentación local sujeta a configuración explícita. |
| Actualización | Para el ejercicio, una lectura se considera vigente hasta 5 minutos después de su hora; al superar ese tiempo se muestra como desactualizada. |
| Velocidad | Para el ejercicio de límites, la configuración acepta velocidades enteras de 30 a 120 km/h, inclusive. |
| Alerta | Para el ejercicio, velocidad estrictamente mayor que el umbral configurado produce una alerta si la regla está activa y la lectura es válida. |
| Aislamiento | Un usuario de Norte no puede consultar datos de Sur, ni siquiera modificando un identificador en una solicitud. |

Las reglas de este cuadro son exclusivamente didácticas. Los ejemplos deben expresar claramente si usan la hora del evento o la de recepción. No se debe inferir que un vehículo está detenido, fuera de servicio o en una ubicación actual cuando únicamente existe una última lectura desactualizada. Los resultados ante lecturas duplicadas, tardías o fuera de orden, así como la deduplicación y notificación, requieren una regla acordada: se presentan como preguntas de análisis, no como hechos.

### Riesgos para priorizar

1. Acceso o exposición cruzada entre flotas.
2. Posición antigua presentada como actual y decisiones tomadas con información desactualizada.
3. Alertas omitidas o incorrectas por reglas, datos o estado del dispositivo.
4. Lecturas duplicadas, tardías, fuera de orden o con zona horaria incorrecta.
5. Rendimiento y disponibilidad ante cargas representativas, a validar contra objetivos acordados.
6. Datos inválidos o incompletos y errores de integración con el proveedor.

Usar datos sintéticos, identificadores ficticios y evidencias sin información sensible. Las pruebas no deben provocar acciones reales sobre vehículos, conductores ni servicios de producción.

## 4. Adaptación detallada por módulo

### Módulo 1. Lenguaje común

**Conservar:** objetivos de comunicación, distinción entre teoría, práctica y convenciones, y tono colaborativo.

**Ejemplo propuesto:** QA reporta que N-101 «no actualiza». Desarrollo observa una respuesta correcta del API. El equipo precisa que el API responde, pero la última lectura tiene más de cinco minutos y se muestra como vigente: la respuesta HTTP y la vigencia del dato son aspectos diferentes. Se documentan el tiempo de evento, el tiempo de observación y el resultado esperado.

**Actividad:** cada participante define «vehículo en línea», «última posición», «alerta activa» y «cobertura». Comparar definiciones, identificar una ambigüedad y registrar una definición operativa con responsables y fuente.

**Evidencia esperada:** glosario de cuatro términos y un ejemplo de consecuencia de una definición ambigua.

### Módulo 2. ISTQB como referente

**Conservar:** origen, propósito y alcance de ISTQB; aclarar que la guía no reemplaza el syllabus ni prepara por sí sola para la certificación.

**Ejemplo propuesto:** al elegir cómo probar la integración de telemetría, QA y desarrollo distinguen el nivel de prueba, el objetivo, los riesgos y la cobertura antes de comparar herramientas. La elección se basa en los contratos y necesidades del equipo, no en asumir que una herramienta determina por sí sola el nivel.

**Actividad:** revisar diez tickets reales anonimizados o simulados sobre mapa y alertas; distinguir términos de ISTQB de convenciones propias del producto, detectar dos usos ambiguos y acordar definiciones.

**Evidencia esperada:** tabla con término, uso observado, definición acordada, fuente y posible confusión.

### Módulo 3. Los siete principios

**Conservar:** los siete principios y el énfasis en cobertura basada en riesgo.

**Ejemplo propuesto:** una cobertura elevada de código del procesador de eventos no demuestra que se hayan probado lecturas fuera de orden, cambios de flota o pérdidas de conexión. Priorizar estos escenarios según riesgo, sin concluir que el software está libre de defectos.

**Actividad:** en un trimestre ficticio, 70 % de los defectos reportados se concentró en el procesamiento de eventos y el mapa; la regresión usa siempre lecturas recientes y ordenadas. Identificar agrupación de defectos y repetición de pruebas, proponer datos nuevos y explicar los riesgos no cubiertos.

**Evidencia esperada:** matriz de riesgos con escenarios, justificación, pruebas propuestas y riesgos residuales. El 70 % es un dato de ejercicio, no una medición real.

### Módulo 4. Proceso y trazabilidad

**Conservar:** actividades de la guía, criterios de entrada y salida, y relación requisito → condición → caso → resultado → defecto.

**Ejemplo propuesto:** historia «como operador de Norte, consulto solamente vehículos autorizados de Norte». Desde el requisito se deriva la condición de aislamiento y un caso donde el operador intenta consultar S-201. El resultado esperado es negar acceso y no entregar datos de Sur; el código HTTP exacto debe acordarse en el contrato. Si falla, se registra el defecto con evidencia anonimizada.

**Actividad:** elaborar para esa historia un plan breve, criterios de entrada y salida, dos condiciones, dos casos y un cierre con riesgos pendientes.

**Evidencia esperada:** matriz trazable con identificadores de historia, condición, caso, resultado y defecto. Los criterios de salida son propuestas a negociar, no compromisos existentes.

### Módulo 5. Niveles de prueba

**Conservar:** cinco niveles, sus objetivos y el enfoque de responsabilidad compartida.

**Ejemplo propuesto:** para una alerta de velocidad: componente comprueba el cálculo del umbral; integración de componentes comprueba que la lectura llega al evaluador; sistema verifica el flujo visible de lectura a alerta; integración de sistema valida el intercambio con un simulador o entorno de pruebas del proveedor; aceptación comprueba con operaciones que la alerta satisface los criterios acordados.

**Actividad:** clasificar esos cinco casos, explicar el objeto de prueba y sus dependencias, e identificar qué riesgo se pierde si falta un nivel. Aclarar que el nivel depende del alcance real de la prueba, no únicamente de la herramienta utilizada.

**Evidencia esperada:** tabla de nivel, objeto, dependencias, responsable propuesto y evidencia.

### Módulo 6. Tipos de prueba

**Conservar:** distinción entre nivel y tipo, y entre confirmación, regresión y humo.

**Ejemplo propuesto:** tras corregir una alerta de velocidad que no se genera por encima del umbral, se repite el caso fallido como confirmación. Se prueban reglas de otras flotas y otras alertas potencialmente afectadas como regresión selectiva. Una suite de humo verifica acceso, carga básica de flota y recepción de una lectura simulada antes de continuar.

**Actividad:** clasificar: consulta correcta de vehículos autorizados; tiempo de carga del mapa bajo una carga acordada; repetición del caso corregido; regresión de alertas; verificación básica de un despliegue. Indicar tipo, nivel, resultado esperado y responsable.

**Evidencia esperada:** matriz de cinco pruebas. El objetivo de rendimiento y la carga deben definirse antes de juzgar si pasan.

### Módulo 7. Técnicas de diseño

**Conservar:** partición de equivalencia, valores límite, tablas de decisión, transición de estados y distinción entre caja negra y caja blanca. Sustituir también las muestras de edad, descuentos y pedidos dentro de los bloques.

**Ejercicio de límites:** para configurar un umbral entero de 30 a 120 km/h inclusive, probar 29, 30, 120 y 121 con análisis de dos valores; añadir pruebas separadas para formatos no enteros y valores ausentes.

**Tabla de decisión didáctica:**

| Regla activa | Lectura válida | Velocidad > umbral | Resultado esperado |
|---|---|---|---|
| No | Cualquiera | Cualquiera | No generar alerta por esta regla. |
| Sí | No | Cualquiera | No evaluar como exceso; registrar o rechazar el dato según el contrato por acordar. |
| Sí | Sí | No | No generar alerta. |
| Sí | Sí | Sí | Generar alerta para la flota del vehículo. |

**Ejercicio de estados:** para la visualización de vigencia propuesta, modelar «vigente» y «desactualizada»: una lectura pasa a desactualizada cuando su edad supera cinco minutos; una lectura nueva y válida vuelve la visualización a vigente. Tratar relojes desincronizados y lecturas tardías como preguntas abiertas.

**Actividad:** derivar los cuatro valores límite, un caso por regla de decisión y dos transiciones; identificar al menos tres preguntas pendientes sobre timestamps, datos inválidos y cambios de umbral.

**Evidencia esperada:** casos con precondiciones, datos, resultado esperado y técnica utilizada; no se debe inventar el resultado de reglas aún no acordadas.

### Módulo 8. Gestión de defectos

**Conservar:** diferencia entre severidad y prioridad, ciclo de vida y reporte reproducible.

**Ejemplo propuesto de reporte:** «[TEL-001] Usuario de Norte recibe datos de S-201 al consultar su identificador». Entorno de pruebas, versión, cuentas y vehículos sintéticos; pasos: iniciar sesión como Norte y solicitar S-201; esperado: acceso denegado sin datos de Sur; actual: respuesta con datos de Sur; evidencia: respuesta anonimizada y referencia al criterio de aislamiento. Severidad y prioridad propuestas: altas por exposición cruzada, sujetas al triaje del equipo.

**Actividad:** clasificar por separado impacto y urgencia para: exposición entre flotas; etiqueta desalineada; mapa lento bajo una carga especificada; alerta ausente. Indicar información adicional necesaria antes de priorizar.

**Evidencia esperada:** cuatro decisiones justificadas y un reporte completo, sin contraseñas, coordenadas reales ni datos de conductores.

### Módulo 9. Fundamento de Shift-Left

**Conservar:** prueba temprana, límites de la generalización económica y necesidad de pruebas de sistema y aceptación.

**Ejemplo propuesto:** una historia dice «mostrar la posición actual». Antes del desarrollo, QA pregunta qué significa «actual», qué tiempo se usa y cómo se muestra una lectura antigua. Producto acuerda el criterio didáctico de cinco minutos; el equipo detecta la ambigüedad antes de implementar. No se asigna un ahorro monetario sin mediciones.

**Actividad:** analizar tres defectos simulados —lectura antigua como actual, acceso cruzado y alerta duplicada— y proponer la revisión o prueba más temprana que podría detectarlos. Precisar que la conducta ante duplicados requiere definición previa.

**Evidencia esperada:** origen hipotético, momento de detección, práctica temprana y evidencia que permitiría medir el costo real.

### Módulo 10. Aplicación de Shift-Left

**Conservar:** revisión de requisitos, TDD, BDD, análisis estático, CI/CD y tabla de lenguaje QA–Dev.

**Ejemplo propuesto:** historia de alerta de velocidad. Producto, QA y desarrollo acuerdan umbral, igualdad, permisos y comportamiento de datos inválidos; desarrollo implementa pruebas de componente primero; el equipo valida escenarios BDD; el pipeline ejecuta análisis y pruebas de componente e integración; en un entorno controlado se valida el flujo completo y operaciones participa en aceptación.

**Escenario BDD de ejemplo:**

```gherkin
Dado que N-101 pertenece a la flota Norte
Y la regla de velocidad está activa con un umbral de 90 km/h
Cuando se recibe una lectura válida de N-101 a 91 km/h
Entonces se genera una alerta de velocidad para la flota Norte
```

Incluir casos complementarios para 90 km/h, regla inactiva y visibilidad entre flotas. El escenario por sí solo no es ejecutable: requiere implementación y automatización vinculadas.

**Actividad:** diseñar un flujo de integración continua con revisiones, componente, integración, pruebas de sistema y aceptación; definir dos métricas con línea base a medir, por ejemplo porcentaje de historias con criterios revisados antes del desarrollo y defectos detectados antes de la integración.

**Evidencia esperada:** diagrama del flujo, responsables, criterios de salida y fórmula, fuente y periodo de cada métrica.

## 5. Evaluación final propuesta

Diez preguntas, una por módulo, cuatro opciones, una respuesta correcta y justificación. Mantener el umbral sugerido de **7/10**. Las reglas de telemetría utilizadas en estas preguntas son las del caso didáctico de la sección 3.

### 1. Lenguaje común

QA observa que el mapa muestra como vigente una lectura de N-101 de hace 12 minutos, aunque la regla didáctica indica cinco minutos. ¿Qué observó directamente?

A. Una falla: comportamiento observado distinto del esperado.  
B. La causa raíz comprobada en el código.  
C. Un error humano identificado con certeza.  
D. Una prueba exhaustiva de todas las lecturas.

**Respuesta: A.** La diferencia observable es una falla; investigar su causa y el defecto que la produce es una actividad posterior.

### 2. Referente ISTQB

QA y desarrollo discuten el significado de «nivel de prueba» para validar la integración con un proveedor. ¿Cuál es el mejor uso de ISTQB?

A. Elegir automáticamente la herramienta que usa desarrollo.  
B. Consultar el syllabus y glosario como referencia y documentar los acuerdos propios del equipo.  
C. Considerar que cualquier uso interno reemplaza la definición formal.  
D. Suponer que usar una herramienta garantiza la certificación.

**Respuesta: B.** ISTQB proporciona un referente terminológico; los acuerdos específicos del equipo deben distinguirse de las definiciones formales.

### 3. Principios

Una suite cubre numerosas combinaciones de velocidad y flota, pero no puede probar todas las secuencias posibles de eventos. ¿Qué principio orienta la decisión?

A. La prueba exhaustiva suele ser imposible; se priorizan combinaciones por riesgo.  
B. La cobertura de código demuestra la ausencia de defectos.  
C. Repetir siempre los mismos casos garantiza encontrar todos los defectos.  
D. Las pruebas son iguales en cualquier contexto.

**Respuesta: A.** Hay que seleccionar pruebas y reconocer el riesgo residual en vez de prometer cobertura exhaustiva.

### 4. Proceso

El equipo acuerda terminar las pruebas de sistema cuando se cubran los criterios de aceptación convenidos y se resuelvan los defectos críticos definidos en el plan. ¿Qué está definiendo?

A. Datos de entrada.  
B. Criterios de salida.  
C. Causas raíz.  
D. Requisitos de infraestructura.

**Respuesta: B.** Los criterios de salida establecen condiciones acordadas para dar por terminada una actividad o nivel de prueba.

### 5. Niveles

Una prueba verifica el cálculo de exceso de velocidad en una función aislada, sustituyendo sus dependencias por dobles. ¿Qué nivel describe mejor?

A. Aceptación.  
B. Integración de sistema con el proveedor externo.  
C. Componente.  
D. Sistema completo.

**Respuesta: C.** Se evalúa una unidad aislada; el alcance y las dependencias, no el nombre de la herramienta, determinan la clasificación.

### 6. Tipos

Se corrige una alerta omitida y se repite el caso que había fallado para comprobar la corrección. ¿Qué tipo de prueba es?

A. Confirmación.  
B. Regresión de todas las funciones.  
C. Prueba de carga.  
D. Aceptación de negocio.

**Respuesta: A.** Confirmación verifica la corrección del defecto; la regresión complementaria busca efectos colaterales.

### 7. Valores límite

El umbral configurable admite enteros de 30 a 120 km/h inclusive. ¿Qué conjunto corresponde a valores límite de dos puntos por frontera?

A. 30 y 120.  
B. 29, 30, 120 y 121.  
C. 29, 30, 31, 119, 120 y 121.  
D. 50 y 90.

**Respuesta: B.** En cada frontera se usa un valor válido y el entero inmediatamente exterior: 29/30 y 120/121.

### 8. Severidad y prioridad

Un operador de Norte puede consultar datos de Sur. ¿Cuál es la clasificación más razonable para proponer al triaje?

A. Severidad baja únicamente porque hay una solución visual.  
B. Severidad y prioridad son siempre idénticas y no necesitan justificación.  
C. Severidad y prioridad altas por exposición cruzada, sujetas a validación según impacto y urgencia.  
D. No es un defecto si la consulta responde rápido.

**Respuesta: C.** El aislamiento comprometido puede tener alto impacto y urgencia; ambas dimensiones se evalúan por separado en el contexto.

### 9. Shift-Left

Antes de programar «mostrar posición actual», QA pregunta cuándo deja de ser vigente una lectura y producto acuerda el criterio. ¿Qué se está haciendo?

A. Sustituir todas las pruebas de sistema.  
B. Revisar tempranamente el requisito para reducir ambigüedad y retrabajo potencial.  
C. Demostrar que el producto no tendrá defectos.  
D. Medir un ahorro económico exacto sin datos.

**Respuesta: B.** La revisión temprana identifica ambigüedades, pero no reemplaza la validación posterior ni garantiza un ahorro cuantificado.

### 10. BDD y colaboración

¿Cuál es el papel de un escenario «Dado/Cuando/Entonces» para una alerta de velocidad?

A. Sustituir todas las pruebas de componente y de integración.  
B. Definir automáticamente la infraestructura del proveedor.  
C. Comunicar el comportamiento esperado entre negocio, QA y desarrollo y, si se conecta a automatización, servir como especificación ejecutable.  
D. Garantizar que ninguna alerta pueda fallar.

**Respuesta: C.** Un escenario estructurado facilita la colaboración; su ejecución automática requiere implementación adicional.

## 6. Impacto previsto en la aplicación

- Contenido de módulos: `src/content/modules1-3.ts`, `modules4-6.ts`, `modules7-8.ts` y `modules9-10.ts`. Mantener los identificadores 1 a 10 para no alterar la referencia del progreso.
- Metadatos de la guía: revisar `src/content/index.ts` y textos de índice o portada cuando describan el alcance general. Mantener claramente el enfoque ISTQB y Shift-Left.
- Glosario: revisar `src/content/glossary.ts`; conservar los términos formales y distinguir cualquier término de telemetría como definición operativa del caso, no atribuirlo a ISTQB.
- Evaluación: `contracts/quiz.ts` define preguntas, opciones, respuesta e identificación del módulo; `api/training-router.ts` valida y califica, y `src/pages/QuizPage.tsx` muestra evaluación y retroalimentación. La clave también se importa en el frontend, por lo que la calificación en servidor **no implica que la clave esté oculta al cliente**.
- Formato actual: cada módulo dispone de bloques, un ejemplo y una actividad con preguntas de reflexión. Las evidencias propuestas se pueden redactar dentro de esa actividad; no se supone que exista captura, corrección automática o almacenamiento de sus respuestas.
- Datos históricos: `quiz_attempts` guarda puntuación, total y respuestas como identificadores de pregunta y posiciones de opción, pero no guarda versión ni texto de la evaluación. La interfaz actual muestra un resumen histórico; reutilizar identificadores para preguntas distintas podría hacer que respuestas históricas se interpreten de forma incorrecta en un uso futuro. Conservar resultados y no recalificarlos; definir una estrategia de versión y compatibilidad antes de modificar el cuestionario. El progreso actual solo identifica el módulo y no registra versión del contenido.
- Mantener las fuentes existentes cuando sigan siendo pertinentes y verificar las referencias formales antes de presentar nuevas afirmaciones. No presentar umbrales ilustrativos como requisitos reales.

## 7. Verificación para una implementación posterior

1. Revisar cada módulo completo para que ejemplos, tablas, actividades y bloques de código usen el caso transversal de forma coherente.
2. Comprobar que los diez módulos conservan sus objetivos y conceptos; probar cada ejercicio y su resultado esperado, incluidos igualdad, límites y separación de flotas.
3. Verificar diez preguntas con identificadores únicos, cuatro opciones válidas, una respuesta correcta, justificación y una referencia a cada módulo.
4. Probar envío, validación, calificación y presentación de resultados, incluyendo 6/10 y 7/10, y comprobar que el historial y progreso existentes se preserven conforme a la estrategia de versión acordada.
5. Ejecutar las comprobaciones pertinentes del proyecto (`npm run check`, pruebas y, cuando corresponda, lint/build) y revisar visualmente en móvil y escritorio.
6. Revisar que los datos sean ficticios, que no se afirmen comportamientos no definidos y que la explicación no confunda última posición con ubicación actual.

## 8. Decisiones pendientes antes de ejecutar

1. Confirmar si el caso hipotético representa las funciones y perfiles deseados o proporcionar requisitos reales de la plataforma, con datos anonimizados.
2. Acordar umbrales reales de vigencia y alertas, unidades, zonas horarias, permisos y comportamiento ante datos tardíos, duplicados, inválidos o ausentes.
3. Decidir cómo identificar la nueva versión de la evaluación y preservar la interpretación de intentos anteriores; decidir si el progreso previo continúa marcado o si se desea una política de actualización.
4. Confirmar si basta una evaluación final de diez preguntas con umbral 7/10 o si se requieren evaluaciones por módulo, registro de actividades o rúbricas calificadas: estas últimas implicarían cambios funcionales adicionales.

**Siguiente paso:** revisar y aprobar esta propuesta antes de modificar contenido, código o datos de la aplicación.
