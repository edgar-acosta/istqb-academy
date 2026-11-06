# Propuesta: seguimiento de evaluaciones y reconocimiento de aprendizaje

**Estado:** el seguimiento, el reconocimiento interno, la mejora visual del detalle y el modal de resultado inmediato de las secciones 5.5 y 5.6 están implementados. La verificación pública, la revocación, la sustitución y el banco dinámico continúan pendientes.

## 1. Propósito

Crear una experiencia en la que cada profesional pueda consultar su avance, retomar una evaluación sin terminar, revisar el detalle de sus intentos y, al cumplir los requisitos acordados, descargar un reconocimiento en PDF cuya emisión pueda verificarse.

La solución debe apoyar el aprendizaje, no solo mostrar una calificación. Una evaluación de opción múltiple evidencia resultados en determinadas preguntas; por sí sola no acredita experiencia profesional ni dominio integral.

**Alcance del documento:** diseño funcional, pedagógico y técnico para la academia. La sección 2 describe el diagnóstico original previo a la primera implementación; las secciones 5.5 y 5.6 documentan el rediseño visual y la experiencia inmediata al finalizar. Las capacidades futuras se identifican como pendientes.

## 2. Diagnóstico original antes de la implementación

La aplicación cuenta con diez módulos de ISTQB y Shift-Left contextualizados con un caso ficticio de telemetría de tractocamiones. Cada usuario autenticado puede marcar módulos como completados y realizar una evaluación final fija de diez preguntas, con un umbral sugerido de 7/10.

| Capacidad | Situación observada |
|---|---|
| Progreso de módulos | Se guarda por usuario y módulo; la marca es manual, puede retirarse y no registra la versión del contenido. |
| Evaluación en curso | Las respuestas viven en el estado del navegador durante la página; no existe un borrador persistente. El envío exige responder todas las preguntas. |
| Resultado inmediato | Al enviar se muestran aciertos, respuestas y justificaciones; ese detalle se mantiene en el estado de la página. |
| Historial | Se guardan puntuación, total, respuestas como identificadores e índices, y fecha. La pantalla muestra un resumen de hasta 20 intentos; no ofrece detalle histórico navegable. |
| Versiones | Las preguntas anteriores `q1`–`q10` y las actuales `v2-m1`–`v2-m10` permanecen en el código. Los intentos no tienen un campo explícito de versión ni una copia inmutable de sus preguntas. |
| Práctica por módulo | Las actividades son reflexivas; no se guardan ni califican sus respuestas. |
| Reconocimiento y validación | No hay emisión de PDF, registro de reconocimientos ni página de verificación. |
| Seguridad de la evaluación | La calificación se realiza en el servidor, pero la clave de respuestas del cuestionario actual también está disponible en el frontend. |

**Implicación:** una nueva página de detalle no debe reconstruir un intento antiguo usando indiscriminadamente el cuestionario actual. Asimismo, una marca de módulo completado expresa una acción del usuario, no demuestra por sí misma que estudió el módulo ni qué versión estudió.

## 3. Principios de diseño

1. **Orientación al aprendizaje:** mostrar qué se ha hecho, qué falta y cómo mejorar, evitando etiquetas que exageren los resultados.
2. **Trazabilidad:** conservar la versión, las preguntas y la regla de calificación que corresponden a cada intento terminado.
3. **Claridad:** distinguir progreso del curso, respuestas guardadas, calificación final y requisitos del reconocimiento.
4. **Inclusión y accesibilidad:** navegación por teclado, lectores de pantalla, lenguaje claro, contraste suficiente y diseño adaptable.
5. **Privacidad y seguridad:** cada usuario ve sus propios datos; la verificación externa expone información mínima y solo bajo una política acordada.
6. **Afirmaciones verificables:** el PDF acredita la finalización y evaluación interna según criterios explícitos; no es una certificación oficial de ISTQB.
7. **Compatibilidad futura:** el diseño debe permitir posteriormente un banco dinámico de preguntas sin perder el historial ni cambiar retroactivamente los resultados.

## 4. Definiciones y decisiones recomendadas

Para evitar ambigüedad, «evaluación parcial» puede referirse a conceptos diferentes:

| Concepto | Significado propuesto | ¿Se califica? |
|---|---|---|
| **Intento en curso** | Evaluación final con algunas respuestas guardadas. Se puede reanudar. | No. Mostrar respondidas/total; no mostrar aciertos ni respuestas correctas antes del envío. |
| **Resultado por módulo** | Detalle de las preguntas de un módulo dentro de un intento final enviado. | Sí, como parte del intento completo, no como una evaluación independiente. |
| **Evaluación parcial independiente** | Prueba separada por módulo o bloque. | No incluida en la primera versión propuesta; requiere definir objetivos, banco, reglas de calificación y persistencia. |

Una pregunta por módulo no permite concluir que el usuario domina o no domina ese módulo. Se puede mostrar «acertó 1 de 1 pregunta evaluada», pero no «dominio 100 %». La evaluación por módulos, si se solicita más adelante, necesitará más evidencias y criterios de interpretación.

## 5. Experiencia propuesta para el profesional

### 5.1 Acceso y navegación

Agregar un acceso visible **«Mi aprendizaje»** al menú principal para usuarios autenticados. Desde allí:

- **Resumen:** avance, estado de evaluación y próximo paso.
- **Mis evaluaciones:** intento en curso e historial.
- **Mis reconocimientos:** reconocimientos disponibles y su estado.

La ruta exacta es una propuesta de implementación: `/mi-aprendizaje`, `/mi-aprendizaje/evaluaciones/:id` y `/mi-aprendizaje/reconocimientos`. Con sesión no iniciada, mostrar el acceso a inicio de sesión; el servidor debe aplicar autorización por usuario en cada consulta, independientemente de lo que oculte la interfaz.

### 5.2 Panel «Mi aprendizaje»

```text
MI APRENDIZAJE

Progreso del curso                  Evaluación final
7 de 10 módulos marcados            4 de 10 respuestas guardadas
[ Continuar módulo 8 ]              [ Reanudar evaluación ]

Reconocimiento
Pendiente: completar los requisitos acordados
[ Ver requisitos ]

Mis intentos recientes
Fecha            Estado       Resultado       Acción
...              En curso     Sin calificar   Reanudar
...              Finalizado   6/10            Ver detalle
```

El panel comunica el progreso con texto además de indicadores visuales. También incluye los estados de carga, error con opción de reintentar y ausencia de datos; nunca debe presentar un error de consulta como si no existiera historial.

El avance de módulos se muestra como **«módulos marcados como completados / módulos de la versión aplicable»**. El resultado nunca se llama «porcentaje de conocimiento». El próximo módulo sugerido es el primer módulo no marcado, sin impedir navegar libremente.

### 5.3 Evaluación en curso

- Al iniciar, crear en el servidor un intento con identificador propio, versión y preguntas asignadas. Guardar las respuestas a medida que cambian o mediante un botón «Guardar progreso»; mostrar estado guardando / guardado / error y permitir reintentar.
- Al regresar desde otro dispositivo o después de recargar, recuperar las mismas preguntas, orden y opciones asignadas, además de las respuestas guardadas.
- Mostrar «4 de 10 respondidas» y cuáles faltan. Permitir cambiar respuestas antes de enviar.
- Un intento en curso no tiene puntuación definitiva ni respuestas correctas visibles. Para finalizar, exigir todas las respuestas válidas y confirmación de envío.
- Tras el envío, cerrar el intento para edición y calificar una sola vez en el servidor; permitir reintentar con un nuevo intento.
- Si dos pestañas o dispositivos editan el mismo borrador, detectar conflictos con una versión o revisión del intento; informar al usuario y permitir recuperar el estado más reciente sin sobrescribir silenciosamente.
- Comunicar qué sucede al abandonar, borrar o sustituir un borrador. **Recomendación:** un solo intento final en curso por usuario y versión; iniciar uno nuevo requiere terminar o abandonar el anterior mediante confirmación.

No se propone tiempo límite ni número máximo de intentos en esta fase. Si negocio decide introducirlos, deben informarse antes de iniciar y modelarse explícitamente.

### 5.4 Detalle de un intento finalizado

Cada intento abre una página con:

1. Fecha y hora del envío, versión del curso y cuestionario, estado y resultado en aciertos/total y porcentaje.
2. Regla aplicable a ese intento: umbral, decisión de aprobado/no aprobado y, si corresponde, requisitos del reconocimiento.
3. Por cada pregunta: módulo, enunciado, opciones presentadas, respuesta elegida, respuesta correcta y explicación asociada a la versión que se respondió.
4. Filtro accesible «Todas / Correctas / Para repasar» y enlace al módulo correspondiente, indicando si la versión disponible del módulo cambió.
5. Recomendaciones de repaso basadas en preguntas falladas; no emitir diagnósticos de competencia a partir de una sola pregunta.
6. Acción «Intentar de nuevo» y, si cumple los requisitos, «Ver reconocimiento».

**Ejemplo:** «Resultado 7/10 (70 %). Aprobaste el umbral de esta evaluación. Acertaste 0 de 1 pregunta sobre diseño de pruebas; revisa el módulo 7». Esto no afirma que el usuario carezca de la competencia del módulo.

Para un intento histórico cuyo detalle no pueda reconstruirse con certeza, mostrar únicamente los datos comprobables y «Detalle histórico no disponible». No inventar respuestas, versión ni justificaciones.

### 5.5 Propuesta de mejora visual de resultados

**Estado:** diseño implementado; conserva las reglas de evaluación y reconocimiento.

#### Diagnóstico previo al rediseño

El detalle actual presenta puntuación, porcentaje, decisión cuando hay umbral, fecha, filtro y tarjetas de preguntas. El usuario llega desde «Ver detalle del intento» después del envío o desde el historial de «Mi aprendizaje». La información es útil, pero tiene una jerarquía visual uniforme: el resultado, el estado y la acción siguiente compiten con una lista larga de preguntas. Las tarjetas muestran respuesta elegida, respuesta correcta y explicación, pero no distinguen visualmente todas las opciones. En un intento histórico sin detalle confiable se informa que no está disponible.

La pantalla actual no muestra directamente la elegibilidad del reconocimiento ni lista todas las opciones de cada pregunta. No deben darse por existentes estas capacidades: el rediseño deberá incorporar los datos necesarios o mantener una acción neutral hacia «Mi aprendizaje».

#### Objetivos de experiencia

1. Comunicar en pocos segundos el resultado, el umbral aplicable y el siguiente paso.
2. Separar visualmente el resumen del aprendizaje del detalle de cada respuesta.
3. Orientar al repaso de manera constructiva, sin confundir un acierto con dominio profesional.
4. Mantener el acceso a intentos históricos y conservar el resultado registrado de cada versión.
5. Priorizar una interfaz profesional, clara y adaptable, coherente con la identidad visual existente de la academia.

#### Estructura visual propuesta

```text
← Mi aprendizaje                                         Evaluación final

RESULTADO DE TU EVALUACIÓN                    Versión 2.0 · fecha y hora
┌─────────────────────────────────────────────────────────────────────┐
│  APROBADA                               7 / 10 aciertos · 70 %     │
│  Alcanzaste el umbral de este intento: 70 %.                       │
│  [ Revisar respuestas ]   [ Mi aprendizaje / reconocimiento ]     │
└─────────────────────────────────────────────────────────────────────┘

RESUMEN DEL INTENTO
┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐
│ Correctas: 7   │  │ Para repasar: 3│  │ Módulos con preguntas: 10 │
└────────────────┘  └────────────────┘  └────────────────────────────┘

DETALLE DE RESPUESTAS                    [ Todas ▾ ]
┌─────────────────────────────────────────────────────────────────────┐
│  07   Módulo 7 · Técnicas de diseño             PARA REPASAR       │
│  ¿Qué valores corresponden a los límites del umbral?               │
│  Tu respuesta: ...                                                   │
│  Respuesta correcta: ...                                             │
│  Explicación: ...                                                    │
│  [ Repasar módulo 7 ]                                                │
└─────────────────────────────────────────────────────────────────────┘
```

El esquema es ilustrativo; los números y las etiquetas deben obtenerse del intento real. El conteo de módulos se refiere a módulos representados por preguntas, no a módulos completados.

#### Componentes y comportamiento

| Zona | Tratamiento visual y contenido | Comportamiento |
|---|---|---|
| Navegación | Enlace «Volver a mi aprendizaje» y título visible «Resultado de la evaluación». | Acceso consistente desde envío e historial; la ruta del intento permite volver a consultarlo después. |
| Tarjeta principal | Puntuación `aciertos/total` destacada, porcentaje, estado textual e información secundaria de versión, fecha y umbral. | Usar los valores del intento guardado. Para versiones sin umbral verificable mostrar «Umbral histórico no disponible», sin inferir aprobado. |
| Resumen | Tarjetas compactas de respuestas correctas, incorrectas y módulos representados. | Calcular a partir del detalle disponible; no mostrar cifras inventadas si el detalle histórico no puede reconstruirse. |
| Próximo paso | Botón principal según el estado: «Revisar respuestas», «Repasar módulos» o «Ir a mi aprendizaje». | Un intento aprobado no implica automáticamente derecho al reconocimiento; solo mostrar «Emitir» o «Descargar» si la elegibilidad o emisión se consulta y confirma en el servidor. |
| Filtros | Selector o grupo de controles «Todas / Correctas / Para repasar» con cantidad de resultados. | Al cambiar el filtro, conservar el resultado y el orden original. Si no hay coincidencias, mostrar un mensaje y una acción para ver todas. |
| Pregunta | Tarjeta numerada con módulo, estado «Correcta» o «Para repasar», enunciado y respuestas. | Identificar claramente la opción elegida y la correcta, incluso cuando coinciden. Mostrar opciones completas si están disponibles en la instantánea, sin alterar su orden. |
| Retroalimentación | Bloque separado con «Por qué» y explicación, seguido de «Repasar módulo». | Enlazar al módulo vigente y advertir si el intento corresponde a una versión anterior o no verificable. No prometer que el enlace reproduce el contenido histórico. |

#### Estados y mensajes

| Estado | Mensaje y acción recomendados |
|---|---|
| Aprobado | «Aprobaste esta evaluación». Mostrar umbral y resultado. Enlazar a «Mi aprendizaje» para revisar los requisitos restantes del reconocimiento. |
| No aprobado | «Aún no alcanzas el umbral de este intento». Ofrecer «Repasar respuestas» y «Intentar de nuevo»; este último debe respetar cualquier borrador existente. |
| Aprobado con reconocimiento pendiente | Solo si el servidor confirma la situación: explicar qué requisito falta y enlazar a «Mi aprendizaje». Una marca de módulo es una declaración del usuario, no verificación de lectura. |
| Reconocimiento emitido | Solo si el servidor confirma el documento del usuario: ofrecer «Descargar reconocimiento» mediante la descarga autenticada existente. |
| Histórico con detalle comprobable | Identificarlo como histórico y mostrar la puntuación y el detalle conservados; no aplicar automáticamente el umbral actual ni inferir la versión del curso. |
| Histórico sin detalle comprobable | Mostrar el resultado histórico recuperable y «Detalle histórico no disponible», sin reconstruir respuestas ni justificar con datos actuales. |
| Carga o error | Mostrar un estado de carga legible; ante error, explicar que no se pudo recuperar el resultado y ofrecer «Reintentar» y «Volver a mi aprendizaje». No representar el error como un resultado vacío. |

Para todos los estados, el porcentaje es la proporción de respuestas correctas del intento, no un «porcentaje de conocimiento». La decisión de aprobación utiliza el umbral y la comparación exacta guardados para ese intento; el redondeo del porcentaje presentado nunca modifica la decisión.

#### Estilo, accesibilidad y adaptación

- Utilizar los componentes, colores semánticos, tipografía y espaciado existentes; contrastar una tarjeta de resumen destacada con tarjetas de preguntas más discretas. Evitar gráficos decorativos que distraigan del resultado.
- Diferenciar correcto y para repasar mediante **texto e icono además de color**. Mantener contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande y componentes visuales relevantes.
- Usar encabezados en orden lógico, etiquetas visibles para filtros, estados legibles por lector de pantalla y foco visible. Los botones y enlaces deben funcionar completamente con teclado.
- En escritorio, presentar resumen en columnas cuando el espacio lo permita; en móvil, apilar tarjetas, botones y opciones sin desbordamiento horizontal. Mantener controles táctiles de al menos 44 × 44 píxeles.
- Con zoom del 200 % y nombres o preguntas largos, conservar legibilidad y funcionamiento. Evitar animaciones esenciales y respetar la preferencia de movimiento reducido.
- No mostrar nombre, folio, respuestas o resultados de otros usuarios; no incluir datos personales en URLs adicionales ni en mensajes de error.

#### Ejemplos de contenido

- **Aprobado:** «7 de 10 respuestas correctas · 70 % · Umbral: 70 %». Texto de apoyo: «Aprobaste esta evaluación. Consulta en Mi aprendizaje si ya cumples los demás requisitos del reconocimiento».
- **No aprobado:** «6 de 10 respuestas correctas · 60 % · Umbral: 70 %». Texto de apoyo: «Revisa las preguntas señaladas y vuelve a intentarlo cuando estés preparado».
- **Tarjeta de pregunta:** «Módulo 7 · Para repasar · 0 de 1 pregunta evaluada», seguida de la respuesta elegida, la correcta y la explicación. No etiquetar el módulo como «no dominado».

#### Alcance y validación del rediseño

- Rediseñar la página de detalle existente y revisar la transición posterior al envío; mantener enlaces desde el historial y las rutas de intentos actuales e históricos.
- Conservar la calificación en servidor, el progreso, el historial y los permisos. No cambiar el umbral, la cantidad de preguntas ni la emisión del PDF como parte de una mejora visual.
- Probar los casos de 6/10 y 7/10, todas las respuestas correctas, filtro sin coincidencias, intento histórico con y sin detalle, error de carga y acceso no autorizado.
- Verificar que la opción elegida, la correcta y la explicación correspondan a la instantánea guardada; comprobar que un reconocimiento se ofrezca solo con estado confirmado por el servidor.
- Revisar visualmente en móvil y escritorio, con teclado, lector de pantalla y zoom; validar contraste y que la interfaz no dependa únicamente del color.

### 5.6 Modal de resultado y reconocimiento al finalizar

**Estado:** implementado. Al enviar la evaluación final y recibir la confirmación del servidor de que el intento quedó calificado, se presenta un modal con la calificación y el siguiente paso. No se abre como resultado definitivo mientras el envío no haya sido confirmado.

El documento descargable puede identificarse en la interfaz como **«certificado de reconocimiento interno»**, acompañado de la aclaración de que no es una certificación oficial ni cuenta con aval de ISTQB. Se mantienen los requisitos confirmados: **al menos 70 % de aciertos y los diez módulos de la misma versión marcados como completados**, además de la confirmación del nombre del participante. La calificación aprobatoria por sí sola no habilita la emisión.

#### Experiencia según el resultado

| Situación confirmada por el servidor | Contenido y acciones del modal |
|---|---|
| Menos de 70 % | «No alcanzaste el mínimo requerido en esta ocasión», puntuación en aciertos/total y porcentaje, y umbral del intento. Mostrar los módulos asociados a preguntas incorrectas, con enlaces «Repasar módulo»; ofrecer «Ver detalle» e «Intentar de nuevo». No ofrecer la emisión del certificado. |
| Al menos 70 % y diez módulos completados | «¡Aprobaste la evaluación!», puntuación y porcentaje. Ofrecer «Obtener y descargar mi reconocimiento», además de «Ver detalle». Si todavía no hay un reconocimiento emitido, solicitar el nombre para el documento y su confirmación antes de emitirlo. |
| Al menos 70 %, pero faltan módulos | «Aprobaste la evaluación; aún faltan módulos para obtener tu reconocimiento». Indicar cuáles faltan y enlazar a ellos y a «Mi aprendizaje». No ofrecer la emisión hasta que el servidor confirme que se cumplen todos los requisitos. |
| Reconocimiento ya emitido | Mostrar «Descargar reconocimiento» solo cuando el servidor confirme que pertenece al usuario y corresponde a la versión aplicable. Reutilizar el reconocimiento existente, sin crear otro folio. |
| Resultado confirmado, pero elegibilidad no disponible | Conservar y mostrar la calificación; informar que no se pudo comprobar el estado del reconocimiento y ofrecer reintentar la consulta y ver el detalle. No suponer que el usuario es o no es elegible. |

El modal usa el resultado y el umbral guardados para el intento; para la evaluación vigente, 7/10 cumple el 70 % y 6/10 no lo cumple. La decisión se toma sin redondear. Si en el futuro cambia la política de una evaluación, se aplicará el umbral registrado para ese intento, sin alterar los resultados anteriores.

Si el participante aprueba antes de completar los módulos, puede completarlos después y emitir su reconocimiento desde «Mi aprendizaje» **sin repetir la evaluación**, siempre que se mantengan las reglas de la misma versión. El detalle conserva las explicaciones de las respuestas para orientar el repaso.

#### Flujo de emisión y descarga

1. El usuario confirma el envío; el servidor valida, califica y guarda el intento. Durante la operación se muestra un estado de progreso que evita envíos duplicados.
2. El modal muestra el resultado confirmado y consulta el estado de elegibilidad o del reconocimiento existente. Mientras se consulta, informa que se está comprobando; la calificación no se oculta.
3. Si es elegible y aún no existe un reconocimiento, la acción para obtenerlo abre un paso accesible para introducir y confirmar el nombre que aparecerá en el PDF, con una vista previa y el aviso de privacidad. El usuario puede cancelar sin perder su resultado ni emitir el documento.
4. Tras la confirmación, el servidor vuelve a comprobar los requisitos, emite el reconocimiento de forma idempotente y habilita la descarga autenticada. Si el requisito cambió o falta algún dato, explicar lo sucedido y ofrecer el siguiente paso.
5. Si falla la emisión o la descarga, mostrar el error y una opción para reintentar. No afirmar que se descargó el archivo si no se ha confirmado; si ya se emitió, reutilizar el mismo folio. El documento también permanece accesible desde «Mi aprendizaje».

Los módulos sugeridos para repaso se deducen de las preguntas incorrectas del intento enviado, se muestran una sola vez por módulo y conservan enlaces al contenido disponible. Si no puede determinarse un módulo o el contenido corresponde a otra versión, informarlo sin inventar una recomendación; cuando proceda, advertir que el enlace conduce al contenido vigente. Una respuesta incorrecta indica un tema a revisar, no que el participante carezca de la competencia del módulo.

#### Diseño y accesibilidad

- Mostrar un título claro, puntuación destacada, mensaje textual de aprobación o no aprobación y acciones jerarquizadas; el color o un icono nunca serán la única señal del estado.
- El modal debe tener nombre accesible, recibir el foco al abrirse, mantener la navegación por teclado dentro de él y devolver el foco a un control apropiado al cerrarse. Permitir cerrarlo sin perder el resultado; la página de detalle y el historial deben seguir disponibles.
- Adaptar el contenido a móvil, permitir desplazamiento cuando la lista de módulos sea larga y conservar botones legibles y utilizables con zoom. Anunciar los cambios de estado y errores de forma accesible.
- Ante un fallo o una respuesta incierta del envío, no afirmar que el intento fue enviado o no enviado sin comprobarlo; ofrecer recuperación segura del estado guardado.

#### Ejemplos y criterios de aceptación

- **6/10:** mostrar «60 % · No aprobaste», listar los módulos de las respuestas incorrectas con enlaces de repaso y no ofrecer el reconocimiento.
- **7/10 y diez módulos completados:** mostrar «70 % · Aprobaste» y permitir confirmar el nombre, emitir y descargar el reconocimiento en el mismo flujo.
- **7/10 con módulos pendientes:** mostrar «Aprobaste» y los módulos que faltan; no emitir hasta completar los requisitos y volver a consultar la elegibilidad.
- **Ya emitido:** permitir descargar el mismo reconocimiento, incluso ante doble clic o reintento, sin duplicar folios.
- **Errores y accesibilidad:** verificar fallo de envío, consulta de elegibilidad, emisión y descarga; cierre y reapertura desde el detalle; navegación con teclado, lector de pantalla, móvil y zoom.

## 6. Reconocimiento PDF

### 6.1 Naturaleza y denominación

Denominación recomendada: **«Reconocimiento de finalización y evaluación de conocimientos»**.

Texto sugerido:

> Se reconoce que [nombre del participante] completó los requisitos internos de la guía «ISTQB y Shift-Left Testing aplicada a telemetría de flotas» y aprobó la evaluación interna asociada, según los criterios vigentes al momento de emisión.
>
> Este reconocimiento es emitido por [organización emisora]. No constituye una certificación oficial ISTQB ni implica acreditación o aval de ISTQB.

El nombre de la organización, logotipo, persona firmante, diseño y cualquier referencia a marca deben ser autorizados antes de publicarse. No incluir sellos o firmas que aparenten una acreditación inexistente.

### 6.2 Requisitos de emisión propuestos

Recomendación inicial para la versión vigente del curso:

- Los diez módulos de la misma versión están marcados como completados por el usuario.
- Existe un intento final **enviado** para esa versión con al menos 70 % de respuestas correctas.
- Hay un nombre de presentación confirmado por el usuario y una organización emisora configurada.
- La evaluación, el umbral y los criterios usados quedan registrados junto con el reconocimiento.

La marca de lectura es una autodeclaración: el PDF no debe afirmar que se verificó asistencia, tiempo de estudio o desempeño práctico si la plataforma no registra esa evidencia. Si en un futuro cambian la cantidad de preguntas o el umbral, calcular con las reglas versionadas y no con un valor fijo de 7.

**Ejemplo de regla:** 7/10 = 70 % cumple el umbral; 6/10 = 60 % no lo cumple. No redondear para decidir la aprobación: comparar aciertos y total con el umbral configurado de manera exacta.

Si el examen se aprueba antes de completar los módulos, el usuario ve «Evaluación aprobada; faltan módulos» y puede obtener el reconocimiento cuando satisfaga el resto de requisitos, siempre que corresponda a la misma versión. La elegibilidad se calcula en el servidor, no a partir del navegador.

El reconocimiento es una constancia histórica de los criterios satisfechos al emitirse. Si después se desmarca un módulo, no debe desaparecer ni revocarse automáticamente; la revocación requiere una política explícita y una acción autorizada. Un nuevo cambio de versión del curso tampoco invalida automáticamente una constancia previa.

### 6.3 Contenido del documento

| Elemento | Propuesta |
|---|---|
| Título y participante | Título del reconocimiento y nombre confirmado; no usar automáticamente un correo como nombre profesional. |
| Curso y alcance | Nombre del curso, versión, temas principales y referencia al caso didáctico de telemetría. |
| Resultado | Resultado de la evaluación interna, o simplemente «aprobada» según la política de privacidad elegida. No incluir respuestas. |
| Emisor | Nombre autorizado de la organización y, si se aprueba, nombre/cargo del firmante. |
| Fecha | Fecha de emisión, con zona horaria o referencia UTC definida; fecha de aprobación opcional. |
| Identificador | Folio público aleatorio, no secuencial, de alta entropía. |
| Validación | URL y código QR solo si existe un servicio de verificación alcanzable; no prometer verificación pública con una instalación exclusivamente local. |
| Alcance | Leyenda de evaluación interna y ausencia de certificación o aval oficial ISTQB. |

Propuesta visual: una página A4 horizontal, composición sobria, buen contraste, tipografía legible y diseño consistente con la academia. El PDF debe permitir selección de texto, soportar acentos y nombres largos, y ser legible al imprimirse en escala de grises. El QR complementa, no sustituye, una URL y un folio legibles.

### 6.4 Emisión, descarga y ciclo de vida

1. En «Mi aprendizaje» se muestran requisitos y estado: **pendiente**, **elegible**, **emitido** o **revocado**, según aplique. La sección 5.6 propone ofrecer también la emisión y descarga directamente después de finalizar la evaluación.
2. El usuario elegible confirma el nombre que aparecerá; se muestra una vista previa y una advertencia de privacidad antes de emitir.
3. El servidor comprueba nuevamente la elegibilidad y crea un registro persistente con folio, versión, evidencia y fecha. La emisión es idempotente para la misma persona, curso, versión y política de emisión: un doble clic no crea duplicados.
4. El servidor genera el PDF con los datos registrados y permite descargarlo desde «Mis reconocimientos». Si la generación falla, informar el error y permitir reintentar sin crear folios duplicados ni declarar una descarga exitosa.
5. La descarga posterior debe reconstruir el mismo contenido con plantilla y datos versionados o servir un PDF previamente almacenado. Si se requiere reproducibilidad exacta de bytes o firma digital, debe almacenarse y protegerse el archivo emitido; la regeneración visualmente equivalente no es una firma digital.
6. Una reemisión por corrección de nombre debe conservar el historial: emitir un nuevo folio que sustituya al anterior y aplicar la política de revocación acordada. El estado del folio antiguo debe poder consultarse sin exponer el motivo sensible.

**Sin vencimiento por defecto:** la emisión registra un logro en una fecha, no una competencia vigente para siempre. Una fecha de caducidad solo se agregará si la organización define su propósito y política.

## 7. Validación y confianza

### 7.1 Qué significa verificar

Un folio o QR consultable permite comprobar que el registro existe en la plataforma y conocer su estado. **No demuestra por sí solo** que el PDF no fue editado, que quien lo presenta es su titular, ni que sea una certificación externa. Para mayor garantía, sería necesario diseñar adicionalmente firma digital verificable, gestión de certificados criptográficos e identificación del titular.

### 7.2 Dos modalidades

**A. Instalación local / intranet — recomendada para la situación actual.** El titular descarga el PDF autenticado; un verificador autorizado consulta el folio en la misma red o mediante un mecanismo interno definido. Si no hay una dirección estable accesible, el PDF no debe mostrar un QR o enlace público ficticio.

**B. Verificación externa — fase posterior y sujeta a aprobación.** Publicar un servicio HTTPS estable, definir disponibilidad y protección, y permitir al titular decidir si habilita el acceso externo. La página puede mostrar solamente estado, curso, fecha, emisor y una identificación del titular según la política elegida. Nunca mostrar correo, respuestas, historial o calificación salvo autorización expresa.

Estados propuestos para la consulta: **válido**, **revocado**, **sustituido** y **no encontrado**. Si el servicio no está disponible, informar que la verificación no pudo completarse, no que el reconocimiento es inválido. El acceso al folio o enlace no debe conceder acceso a los demás datos del usuario.

Para la modalidad pública, contemplar identificadores aleatorios, HTTPS, límites de consultas, protección contra enumeración, mensajes que no revelen más datos de los autorizados, auditoría mínima y revocación. Obtener aprobación para la publicación y definir qué sucede si se retira el consentimiento. Un código QR no es secreto y puede fotografiarse o compartirse.

## 8. Arquitectura y datos propuestos

### 8.1 Entidades conceptuales

| Entidad | Campos principales | Invariante |
|---|---|---|
| Versión de curso | Identificador, título, versión, conjunto de módulos, vigencia. | Una versión publicada no cambia retroactivamente. |
| Progreso versionado | Usuario, versión, módulo, fecha y estado declarado. | Único por usuario, versión y módulo; la marca no demuestra lectura verificada. |
| Intento | Usuario, curso y versión, estado, fechas, revisión, puntuación, total y política de aprobación. | En curso editable; enviado inmutable y calificado en servidor. |
| Pregunta asignada | Intento, orden, ID y versión de pregunta, texto, opciones y clave congelados; módulo y explicación. | El servidor mantiene las claves y los datos necesarios para reproducir el resultado; no se exponen antes del envío. |
| Respuesta | Intento, pregunta asignada, opción elegida y fecha. | La opción debe pertenecer a la pregunta y al intento del usuario. |
| Reconocimiento | Folio, usuario, nombre mostrado, curso/versión, intento aprobado, criterio aplicado, fecha, estado, plantilla y emisor. | Su evidencia y datos emitidos permanecen inmutables; estado y sustitución quedan auditados. |

Se puede usar una instantánea estructurada por intento o tablas normalizadas. La elección depende del diseño técnico final, pero deben poder conservarse pregunta, orden de opciones, respuesta correcta y justificación de la versión exacta, incluso si el banco cambia después. Proteger los datos y evitar duplicar información sensible innecesaria.

### 8.2 Operaciones a diseñar

- **Consultar panel:** progreso por versión, intento en curso, resumen de intentos y elegibilidad.
- **Iniciar o reanudar intento:** asignar y persistir preguntas; no entregar la clave al cliente.
- **Guardar respuesta:** validar propiedad, estado, revisión y rango de opción.
- **Enviar intento:** validar integridad, calificar y cerrar en una transacción; manejar reenvíos sin duplicar intentos ni recalificar con otra versión.
- **Ver detalle:** entregar el detalle congelado solo al titular autorizado tras el envío.
- **Emitir / descargar:** verificar elegibilidad, crear reconocimiento de manera idempotente y servir el PDF al titular autorizado.
- **Verificar folio:** exponer únicamente el resultado y los datos permitidos por la modalidad y política vigentes.

El servidor es la fuente de verdad de puntuación, umbral y elegibilidad. Los errores de persistencia, conflictos, generación y descarga deben ser visibles y registrarse sin incluir respuestas, credenciales ni datos personales innecesarios.

### 8.3 Compatibilidad con preguntas dinámicas

La propuesta de preguntas diferentes por intento puede incorporarse como una fase independiente: banco revisado, selección equilibrada por módulo y evitación de repeticiones por usuario hasta agotar el banco. Un banco finito no puede garantizar preguntas inéditas indefinidamente.

La selección debe ocurrir al crear el intento y quedar congelada. El detalle y el reconocimiento deben depender de la instantánea del intento, no de la versión vigente del banco. Esta propuesta no implementa ni exige IA para generar preguntas.

## 9. Migración y manejo de información existente

1. **Respaldar y probar la migración** sobre una copia de SQLite, incluidos datos asociados a WAL mediante un procedimiento consistente con SQLite. No borrar ni recalificar intentos.
2. Conservar resultados, fechas, respuestas y el progreso existentes. Evitar asignar una versión de curso que no pueda demostrarse.
3. Las claves `q1`–`q10` y `v2-m1`–`v2-m10` permiten identificar el conjunto de preguntas en muchos casos, siempre que el conjunto esté completo y coincida exactamente con una versión conservada. Validar identificadores, índices y disponibilidad de contenido; si existe ambigüedad, mostrar solo el resumen histórico y marcar el detalle como no disponible.
4. El progreso actual no registra versión; mostrarlo como **progreso histórico sin versión verificable**, no usarlo silenciosamente como evidencia de haber completado la versión adaptada. Si se decide reconocerlo para elegibilidad, solicitar una confirmación o definir una política explícita y auditable.
5. Los intentos anteriores no generan automáticamente reconocimientos. Definir si serán elegibles y, de ser así, cómo validar la versión del curso, el nombre, las reglas y la evidencia faltante.
6. Mantener el historial histórico consultable y registrar cualquier asignación de versión con su origen y grado de certeza. Verificar los resultados de la migración antes de ponerla en servicio.

## 10. Criterios de aceptación y pruebas

| Caso | Resultado esperado |
|---|---|
| Usuario nuevo | Ve 0 módulos completados, sin intentos y requisitos pendientes; no ve reconocimiento emitido. |
| Borrador con 4 de 10 respuestas | Al recargar o iniciar sesión desde otro dispositivo recupera las mismas preguntas y cuatro respuestas; no aparece puntuación ni clave. |
| Fallo al guardar | Se comunica el error y el estado no se presenta como guardado; el usuario puede reintentar. |
| Edición simultánea | Se detecta el conflicto y no se sobrescriben silenciosamente cambios de otra pestaña. |
| Envío incompleto o índice inválido | El servidor rechaza la solicitud, conserva el borrador y explica la causa. |
| Envío de 6/10 | Se muestra 60 %, no aprobado con umbral 70 %, detalle y opciones de repaso; no se emite reconocimiento. |
| Envío de 7/10 | Se muestra 70 %, aprobado; si faltan módulos, reconocimiento pendiente y requisitos visibles. |
| 10 módulos versionados + 7/10 | El servidor considera elegible al usuario y permite confirmar nombre y emitir un solo folio. |
| Modal posterior al envío | Tras confirmar el resultado, muestra calificación y repaso o reconocimiento según la sección 5.6; maneja carga, fallos y reintentos sin perder el resultado ni duplicar folios. |
| Doble envío o doble emisión | No se duplica la calificación ni el reconocimiento; el usuario recibe el resultado coherente del intento o emisión existente. |
| Cambio posterior del banco | Un intento cerrado conserva preguntas, respuestas, explicaciones y resultado originales. |
| Historial antiguo | Se conserva puntuación; el detalle solo aparece si se identifica la versión con certeza. El progreso sin versión no se convierte automáticamente en evidencia actual. |
| Acceso entre usuarios | Un usuario no puede leer intentos, descargar PDFs ni emitir reconocimientos de otra persona modificando identificadores. |
| PDF | Se descarga un PDF válido, legible y con nombre confirmado, emisor, fecha, folio, alcance y leyenda; no incluye datos no autorizados. |
| Verificación | Folios válidos, revocados, sustituidos y desconocidos muestran el estado correcto; una caída del servicio se informa como indisponibilidad. |
| Accesibilidad | Teclado, lector de pantalla, zoom y tamaños móvil/escritorio permiten completar y consultar el flujo sin depender solo del color. |

Complementar con pruebas de límite de aprobación, concurrencia, migración sobre una copia, recuperación de errores de servidor, autorización, manejo de nombres largos y caracteres especiales, y generación de PDF. Revisar visualmente en móvil y escritorio y probar el lector de PDF elegido.

## 11. Implementación por fases

| Fase | Entregable | Dependencias y salida |
|---|---|---|
| 0. Definiciones | Aprobar reglas académicas, nombre del emisor, identidad y política de privacidad/verificación. | No emitir reconocimientos antes de resolver estas decisiones. |
| 1. Base histórica | Versionar curso y evaluación; diseñar migración y pruebas de compatibilidad; conservar datos previos. | Base trazable para progreso, detalle y emisión. |
| 2. Seguimiento | Panel, borradores persistentes, historial paginado y detalle de intentos finalizados. | Probar recuperación, autorización, calificación y fallos. |
| 3. Reconocimiento interno | Elegibilidad en servidor, emisión idempotente, PDF y consulta/descarga autenticadas. | Probar documento, conservación de evidencia y validación en la red disponible. |
| 4. Evolución opcional | Banco dinámico, evaluaciones por módulo y/o verificación externa con consentimiento. | Requiere políticas y diseño propios; no bloquear las fases anteriores salvo decisión expresa. |

La emisión de un reconocimiento basado en la versión adaptada depende de tener una política fiable de progreso versionado. El banco dinámico no es imprescindible para emitir un reconocimiento, pero debe integrarse sin alterar intentos históricos.

## 12. Indicadores de calidad del aprendizaje

Medir de forma agregada y con una política de privacidad apropiada:

- **Finalización declarada:** usuarios que marcaron todos los módulos de una versión / usuarios que iniciaron esa versión.
- **Envío de evaluación:** usuarios con al menos un intento enviado / usuarios que iniciaron la evaluación.
- **Aprobación:** usuarios con al menos un intento aprobado / usuarios con al menos un intento enviado; indicar versión y periodo.
- **Uso del repaso:** aperturas de un módulo desde el detalle de una respuesta incorrecta / oportunidades de repaso, si se decide registrar el evento.
- **Emisión:** reconocimientos emitidos / usuarios elegibles, por versión y periodo.

Definir ventana temporal, tratamiento de usuarios activos y línea base antes de fijar metas. Ninguno de estos indicadores demuestra por sí solo competencia profesional o impacto operativo.

## 13. Decisiones para aprobar antes de implementar

1. **Evaluación parcial:** ¿basta con guardar y reanudar una evaluación incompleta y mostrar resultados por módulo tras el envío, o se necesitan evaluaciones independientes por módulo?
2. **Reconocimiento:** ¿se requiere completar los diez módulos y aprobar con 70 %, o se desea otra regla? ¿Cuántos intentos se permiten?
3. **Datos históricos:** ¿los avances y evaluaciones anteriores podrán dar derecho a una constancia? Si es así, ¿cómo se verificará la versión y se tratará la evidencia faltante?
4. **Emisor y nombre:** ¿qué organización emitirá el documento, qué imagen o firma puede utilizarse y cómo se confirma o corrige el nombre del participante?
5. **Validación:** ¿solo intranet/autenticada o también pública? ¿Qué datos se mostrarán, con qué consentimiento y durante cuánto tiempo se conservarán?
6. **Ciclo de vida:** ¿quién puede revocar o sustituir un reconocimiento y bajo qué criterios? ¿Se requiere vencimiento o firma digital?
7. **Experiencia:** ¿se desean intentos ilimitados y sin límite de tiempo, y se conservará el umbral sugerido de 7/10?
8. **Siguiente etapa:** ¿se incorporará primero el banco dinámico o se desarrollará el seguimiento con la evaluación fija actual?

**Recomendación:** aprobar primero los criterios y el tratamiento del historial; después construir el panel y la trazabilidad antes de emitir cualquier reconocimiento.
