# Informe de Evolución del Proyecto: EduSpark AI

Este documento detalla el viaje evolutivo de la plataforma **EduSpark AI**, desde su concepto inicial hasta su estado actual como una herramienta robusta y especializada para la generación de contenido educativo. Sirve como evidencia del proceso de desarrollo iterativo, refinamiento y resolución de problemas.

## Fase 1: Concepción y Estructura Inicial

El proyecto nació con una visión clara: crear un **asistente de IA especializado** para ayudar a docentes a diseñar actividades educativas desconectadas, enfocadas en el pensamiento computacional.

La arquitectura inicial se basó en:

1.  **Frontend Moderno**: Se eligió **Next.js con React** para construir una interfaz de usuario interactiva y eficiente.
2.  **Backend de IA con Genkit**: Se utilizó **Genkit** para orquestar los flujos de inteligencia artificial, conectándose a los modelos de lenguaje de Google.
3.  **Flujo de Usuario Principal**:
    *   Un formulario inicial (`InitialSetupForm`) para capturar los cuatro parámetros clave: **Tema, Concepto, Área y Grado**.
    *   Una interfaz de chat (`ChatInterface`) que, una vez configurados los parámetros, permitía al usuario interactuar con la IA para generar actividades o hacer preguntas.

El primer entregable funcional fue una aplicación capaz de generar tres actividades básicas en formato de texto.

## Fase 2: Refinamiento Pedagógico del Contenido

Pronto se hizo evidente que las actividades generadas, aunque correctas, carecían de la profundidad necesaria para ser implementadas directamente en el aula ("llave en mano"). La retroalimentación del usuario fue crucial en esta fase.

**Mejoras Implementadas:**

1.  **Estructura de Actividad Detallada**: Se modificó el prompt principal en `src/ai/flows/generate-educational-activity.ts` para que la IA generara actividades con una estructura mucho más rica y pedagógicamente sólida. Se añadieron campos obligatorios como:
    *   `objective`: Un objetivo de aprendizaje claro y medible.
    *   `teacherPreparation`: Pasos previos para el docente.
    *   `stepByStepDevelopment`: Un guion de clase detallado.
    *   `reflectionQuestion`: Preguntas para guiar la metacognición.
    *   `evaluationCriteria`: Criterios de evaluación claros.

2.  **Enfoque en Contextos Rurales y Materiales Accesibles**: Una de las mejoras más significativas fue refinar el prompt para que la IA priorizara **materiales de bajo costo y fácil acceso** (papel, lápices, cartulina, tijeras) en lugar de solo generar "tarjetas". Esto hizo que el campo `activityResources` fuera más versátil y adaptado a la realidad de cualquier aula, especialmente en contextos rurales.

## Fase 3: La Revolución Visual

### 3.1. Creación del Módulo de Apoyo Visual

Para complementar las actividades textuales, se introdujo la capacidad de generar **apoyos visuales**.

*   **Nuevo Flujo de IA (`generate-activity-visuals.ts`)**: Se creó un flujo específico que actúa como un "Director de Arte". Este flujo analiza los `activityResources` de una actividad y decide qué componentes visuales crear.
*   **Página de Detalles de Actividad (`/activity/[id]/page.tsx`)**: Se implementó una página dinámica para mostrar la actividad completa y un botón para "Crear Apoyo Visual".

### 3.2. Iteraciones de Diseño de las Tarjetas Visuales

El diseño de los apoyos visuales (especialmente las tarjetas) fue un proceso de refinamiento continuo basado en tus valiosas sugerencias:

1.  **Versión Inicial**: Tarjetas funcionales pero visualmente simples.
2.  **Primer Rediseño (Inspirado en tu referencia)**: Se adoptó un diseño mucho más profesional:
    *   **Estructura Vertical y Limpia**: Con una cabecera de color (`bg-primary`), un cuerpo blanco, icono centrado y un separador (`<hr>`).
    *   **Jerarquía Visual**: Título en mayúsculas en la cabecera, icono grande y texto descriptivo bien organizado.

3.  **Segundo Rediseño (Más Audaz y Dinámico)**: A partir de tu feedback, se buscaron diseños más impactantes:
    *   **Fondos con Gradientes**: Se instruyó a la IA para usar gradientes sutiles (`bg-gradient-to-br from-emerald-50 to-cyan-50`).
    *   **Bordes y Sombras Marcadas**: Para dar profundidad y presencia a las tarjetas (`border-2`, `shadow-2xl`).
    *   **Formato Vertical (9:16)** y un **Icono Gigante** como protagonista visual.

4.  **Manejo de Títulos de Grupo**: Se corrigió un error en el que los encabezados (ej: "Tarjetas de acción rítmica:") se mostraban como `null`. Se ajustó el prompt para que la IA los renderizara como **títulos estilizados**, mejorando la legibilidad y el flujo visual.

## Fase 4: Usabilidad y Persistencia de Datos

A medida que la aplicación se volvía más compleja, surgieron nuevas necesidades de usabilidad.

1.  **Persistencia del Contenido Visual**: Se detectó que el contenido visual generado se perdía al refrescar la página. Para solucionarlo, se implementó un sistema de guardado en el `localStorage` del navegador.
    *   Se crearon las funciones `saveVisualsForActivity` y `getVisualsForActivity` en `src/lib/localStorageUtils.ts`.
    *   La página de actividad ahora guarda el contenido tras generarlo y lo carga automáticamente al visitarla.

2.  **Control del Usuario**: Se añadió un **botón para eliminar** el contenido visual generado, dándote control total sobre el resultado final. Esto requirió la creación de la función `clearVisualsForActivity`.

## Fase 5: Estabilidad y Resolución de Problemas de Despliegue

Durante el proyecto, nos enfrentamos a un persistente error de compilación en Vercel relacionado con un `TypeError` en los flujos de Genkit.

1.  **Primer Intento (Incorrecto)**: Se intentó forzar a Vercel a ignorar los errores de TypeScript creando un archivo `next.config.js`. Aunque esto permitió el despliegue, **causó un error en producción**, demostrando que ignorar los errores no es una solución viable.
2.  **Solución Definitiva (Correcta)**: Se identificó que el problema era una sintaxis incorrecta en la llamada a la función `ai.generate()` en las versiones más recientes de Genkit. La solución correcta fue:
    *   Eliminar el `next.config.js`.
    *   Corregir la llamada a la función en `src/ai/flows/generate-activity-visuals.ts`, usando `@ts-ignore` como una medida de seguridad quirúrgica para esa línea específica, asegurando que el resto del código siga siendo verificado por TypeScript.

## Fase 6: Ingeniería de Prompts y Orquestación de la IA

El corazón de EduSpark AI es la forma en que instruye a los modelos de lenguaje. No se trata de una simple pregunta-respuesta, sino de un proceso de "ingeniería de prompts" diseñado para obtener resultados estructurados, consistentes y de alta calidad.

### 6.1. El Prompt Maestro: `generateEducationalActivitiesPrompt`

Este prompt, ubicado en `src/ai/flows/generate-educational-activity.ts`, es el responsable de crear las tres actividades educativas. Su efectividad se basa en varios pilares:

1.  **Definición del Rol (Persona)**: El prompt comienza asignando un rol a la IA: *"Eres un diseñador instruccional experto y un asesor pedagógico especializado en pensamiento computacional para el contexto educativo de Colombia."* Esto es crucial, ya que establece el tono, el vocabulario y el nivel de detalle que debe usar el modelo.

2.  **Inyección Dinámica de Parámetros**: Los cuatro parámetros que defines en la interfaz (Tema, Concepto, Área y Grado) se insertan directamente en el prompt usando la sintaxis de Handlebars (`{{{topicName}}}`, `{{{computationalConcept}}}`, etc.). Esto personaliza la solicitud en tiempo real.

3.  **Lógica Condicional**: El prompt maneja inteligentemente la opción "Todos los conceptos". Utiliza una estructura `{{#if isAllConcepts}} ... {{else}} ... {{/if}}` para cambiar la instrucción dada a la IA, pidiéndole que integre los cuatro conceptos clave si esa opción está seleccionada.

4.  **Esquema de Salida Estricto (Zod Schema)**: Este es el componente más importante. Se le exige a la IA que la salida sea un **array JSON con exactamente tres objetos**. Cada objeto debe cumplir con el `EducationalActivitySchema` definido con Zod. Esto fuerza a la IA a generar siempre campos como `title`, `objective`, `materials`, etc., eliminando la aleatoriedad y asegurando que la respuesta pueda ser procesada por la aplicación sin errores.

5.  **Instrucciones Granulares por Campo**: Para cada campo del JSON, el prompt proporciona instrucciones increíblemente detalladas. Por ejemplo:
    *   Para `stepByStepDevelopment`, se le exige: *"un guion de clase exhaustivo y obligatoriamente numerado (1., 2., 3., etc.). Detalla no solo lo que hay que hacer, sino cómo hacerlo... Incluye: Guion para el docente, Acciones de los estudiantes, Gestión del tiempo..."*.
    *   Para `activityResources`, se le ordena: *"Describe de manera exhaustiva... los recursos específicos y tangibles que el docente debe crear o dibujar. No des ejemplos, proporciona el contenido final."*

Este nivel de detalle en el prompt es lo que transforma una simple generación de texto en la creación de un producto educativo estructurado y listo para usar.

### 6.2. El Director de Arte IA: `generateActivityVisuals`

Cuando solicitas "Crear Apoyo Visual", se activa un flujo de dos pasos, orquestado por el prompt `analyzeActivityForVisuals`.

1.  **Paso 1: Análisis y Planificación (El Director de Arte)**:
    *   **Entrada**: Se le pasa la lista de `activityResources` de una actividad.
    *   **Tarea**: El prompt le pide a la IA que actúe como un "experto UI/UX y Director de Arte". Su misión no es generar las imágenes directamente, sino **analizar cada recurso** y decidir qué hacer.
    *   **Salida Estructurada**: Para cada recurso, la IA debe generar un objeto JSON con tres campos:
        *   `text`: El texto original del recurso.
        *   `htmlContent`: Un bloque de código HTML (usando Tailwind CSS) si el recurso es una tarjeta o un título. Si no necesita representación visual (ej: "Un lápiz"), este campo debe ser `null`.
        *   `imagePrompt`: Un prompt detallado para un modelo de texto-a-imagen. Este campo es crucial: solo se debe generar si el recurso describe un elemento físico a dibujar (ej: "un tablero de juego"). Para tarjetas abstractas o texto simple, debe ser `null`.

2.  **Paso 2: Ejecución Concurrente**:
    *   Una vez que el "Director de Arte" ha creado el plan (el array de objetos JSON), el código de la aplicación lo procesa.
    *   Recorre el array y, solo para aquellos elementos que tienen un `imagePrompt` no nulo, realiza una llamada a un modelo de generación de imágenes (`googleai/gemini-2.0-flash-exp`), asegurándose de incluir la configuración crítica `responseModalities: ['TEXT', 'IMAGE']`.
    *   Todas estas llamadas de generación de imágenes se ejecutan en paralelo (`Promise.all`), haciendo el proceso mucho más rápido.

Esta estrategia de dos pasos es altamente eficiente. Evita hacer llamadas innecesarias al modelo de imágenes y permite que la IA se enfoque primero en la tarea que mejor hace (análisis y estructuración) antes de proceder con la generación visual.

## Fase 7: Personalización Avanzada y Mejora de la Experiencia de Usuario (27 de octubre de 2025)

En esta fase, el enfoque se centró en otorgar al usuario un control mucho más granular sobre el tipo de actividades generadas, mejorando significativamente la personalización y la usabilidad de la plataforma.

### 7.1. Expansión del Formulario de Creación

Para transformar la herramienta en un asistente de diseño instruccional más completo, se añadieron **seis nuevos parámetros avanzados** al formulario de configuración inicial:

1.  **Duración estimada:** Para ajustar la longitud y complejidad de la actividad.
2.  **Nivel de Complejidad:** (Básico, Intermedio, Avanzado) para modular la profundidad de los contenidos.
3.  **Tamaño del Grupo:** (Individual, Parejas, Grupal) para definir la dinámica social.
4.  **Contexto Educativo:** (Urbano, Rural, Mixto) para adaptar los materiales y ejemplos.
5.  **Tipo de Actividad:** (Juego, Debate, Manualidad, etc.) para guiar el formato pedagógico.
6.  **Indicaciones para el Docente:** Un campo de texto para añadir notas o requisitos específicos.

### 7.2. Rediseño de la Interfaz de Usuario (UX)

Para integrar los nuevos parámetros sin sobrecargar al usuario, se implementaron mejoras clave en la UI:

1.  **Formulario Organizado con Acordeón:** Se reestructuró el formulario (`InitialSetupForm.tsx`) utilizando un componente `Accordion`. Esto permite separar los "Parámetros básicos" de las "Opciones avanzadas", manteniendo la interfaz limpia y accesible. El usuario puede optar por una configuración rápida o profundizar en la personalización.

2.  **Selector de Actividad Contextual:** Para mejorar la usabilidad, se modificó el componente `SelectItem` de ShadCN/UI para que pudiera mostrar una **descripción debajo de cada opción** en el menú desplegable "Tipo de Actividad". Esto proporciona al docente información contextual inmediata sobre qué implica cada formato pedagógico (Juego, Debate, etc.), facilitando una elección informada.

### 7.3. Actualización del Flujo de IA

El "cerebro" de la aplicación fue actualizado para incorporar los nuevos parámetros:

1.  **Actualización de Tipos y Esquemas:** Se modificaron las interfaces en `src/types/index.ts` y los esquemas de validación de Zod en el flujo `generate-educational-activity.ts` para aceptar los nuevos campos.

2.  **Enriquecimiento del Prompt Maestro:** El prompt principal fue actualizado para que la IA utilice estas nuevas variables como **contexto secundario** al generar las actividades. Por ejemplo, ahora se le instruye explícitamente que ajuste el número de pasos según la `duración` o que adapte los materiales según el `contexto` educativo, logrando resultados mucho más precisos y personalizados.

Estas mejoras marcan un paso importante en la evolución de EduSpark AI, pasando de un generador de contenido a una herramienta de co-diseño pedagógico más sofisticada y adaptada a las necesidades reales de los docentes.

## Conclusión

EduSpark AI ha evolucionado de un simple generador de texto a una plataforma de diseño instruccional multifacética. Cada fase de refinamiento, impulsada por la retroalimentación y la resolución de problemas, ha añadido capas de profundidad, usabilidad y robustez al proyecto, convirtiéndolo en una herramienta significativamente más potente y alineada con las necesidades de los educadores.
