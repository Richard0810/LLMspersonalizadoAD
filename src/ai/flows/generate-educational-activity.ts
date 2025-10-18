
'use server';

/**
 * @fileOverview A flow to generate three distinct offline educational activities based on user input.
 *
 * - generateEducationalActivities - A function that triggers the activity generation process.
 * - GenerateEducationalActivitiesInput - The input type for the generateEducationalActivities function.
 * - GenerateEducationalActivitiesOutput - The return type for the generateEducationalactivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEducationalActivitiesInputSchema = z.object({
  topicName: z.string().describe('El tema a tratar en la actividad.'),
  computationalConcept: z.string().describe('The key computational thinking concept.'),
  subjectArea: z.string().describe('The subject area or discipline.'),
  gradeLevel: z.string().describe('The grade level for the activities.'),
});

export type GenerateEducationalActivitiesInput = z.infer<typeof GenerateEducationalActivitiesInputSchema>;

const EducationalActivitySchema = z.object({
  title: z.string().describe('Título de la actividad.'),
  objective: z.string().describe('Un objetivo de aprendizaje claro, medible, específico y en coherencia con los lineamientos del MEN de Colombia.'),
  computationalConcept: z.string().describe('El concepto o conceptos de pensamiento computacional trabajados en la actividad.'),
  materials: z.string().describe('Una lista de materiales simples y accesibles (no electrónicos), donde cada material está en una nueva línea.'),
  estimatedTime: z.string().describe('El tiempo estimado para la realización completa de la actividad (ej: "45 minutos", "2 horas de clase").'),
  teacherPreparation: z.string().describe('Los pasos o materiales que el docente debe preparar antes de la clase, donde cada paso está en una nueva línea.'),
  stepByStepDevelopment: z.string().describe('Guion de clase para el docente, detallando qué decir y hacer. Debe ser una guía numerada con acciones específicas para estudiantes, gestión de tiempos y ejemplos prácticos. Cada paso debe estar en una nueva línea.'),
  activityResources: z.string().describe("Una lista de recursos tangibles y específicos que el docente debe crear o dibujar. No deben ser ejemplos, sino el contenido final. Para tablas, se deben definir columnas y filas exactas. Para tarjetas, se debe describir su contenido (acción, descripción, símbolo). Cada recurso debe estar en una nueva línea."),
  reflectionQuestion: z.string().describe("Una explicación detallada y clara que demuestre cómo la actividad evidencia el concepto de pensamiento computacional, conectando las acciones específicas del ejercicio con la teoría. A continuación, debe incluir preguntas para guiar la reflexión del estudiante, con cada pregunta en una nueva línea y precedida por un guion."),
  evaluationCriteria: z.string().describe('Los criterios de evaluación o evidencias de aprendizaje que el docente puede usar para valorar el desempeño de los estudiantes, donde cada criterio está en una nueva línea.')
});

const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Tres actividades desconectadas, muy detalladas y listas para ser implementadas por un docente con poca experiencia en el tema.');

export type GenerateEducationalActivitiesOutput = z.infer<typeof GenerateEducationalActivitiesOutputSchema>;

export async function generateEducationalActivities(
  input: GenerateEducationalActivitiesInput
): Promise<GenerateEducationalActivitiesOutput> {
  // Directly calling the flow function is safer for Server Actions,
  // as it doesn't rely on the global registry that ai.run() uses.
  return generateEducationalActivitiesFlow(input);
}

// We add the `isAllConcepts` to the input schema for the prompt, but it's not part of the external-facing schema.
const PromptInputSchema = GenerateEducationalActivitiesInputSchema.extend({
    isAllConcepts: z.boolean(),
});

const generateEducationalActivitiesPrompt = ai.definePrompt({
  name: 'generateEducationalActivitiesPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateEducationalActivitiesOutputSchema},
  prompt: `Rol: Eres un diseñador instruccional experto, un genio de la gamificación y un asesor pedagógico especializado en pensamiento computacional para el contexto educativo de Colombia. Tu superpoder es la creatividad con materiales de bajo costo y fácil acceso (papel, cartulina, lápices, tijeras, tapas de botella, piedras, etc.). Tu misión es transformar conceptos abstractos en artefactos físicos y juegos de mesa tangibles.
Tarea: Tu misión es diseñar tres actividades desconectadas tan completas y detalladas que un docente, incluso sin experiencia previa en el tema, pueda implementarlas en su aula de manera exitosa y sin esfuerzo. Cada actividad debe ser un recurso educativo "llave en mano".
Audiencia: Docentes de tecnología e informática en Colombia, especialmente aquellos en contextos rurales o con baja conectividad.
Tono: Didáctico, claro, práctico, lúdico, motivador y adaptable por los docentes.

**Instrucción Principal:**
Genera tres actividades desconectadas distintas y muy detalladas, basadas en la siguiente información. **Todo el contenido debe estar en español.**

- Tema a Tratar: {{{topicName}}}
- Área Temática: {{{subjectArea}}}
- Nivel de Grado: {{{gradeLevel}}}
{{#if isAllConcepts}}
- Concepto de Pensamiento Computacional a Tratar: La actividad debe integrar de manera cohesiva los cuatro conceptos clave del pensamiento computacional: Descomposición, Reconocimiento de patrones, Abstracción y Algoritmos. Asegúrate de que la sección 'computationalConcept' y 'reflectionQuestion' expliquen cómo se manifiesta cada uno de estos conceptos en la actividad.
{{else}}
- Concepto de Pensamiento Computacional a Tratar: {{{computationalConcept}}}
{{/if}}


**Formato de Salida Requerido para cada actividad (Debes ser MUY RIGUROSO con esta estructura):**
Asegúrate de que cada actividad generada cumpla estrictamente con lo siguiente:
- **title:** Un nombre creativo, lúdico y descriptivo para la actividad.
- **objective:** Un objetivo de aprendizaje claro, medible y específico, que esté en coherencia con los lineamientos del Ministerio de Educación Nacional (MEN) de Colombia para el grado especificado.
- **computationalConcept:** Menciona explícitamente el concepto o conceptos de pensamiento computacional que se trabajan (Descomposición, Abstracción, Algoritmos, Reconocimiento de patrones, etc.).
- **materials:** Una lista de materiales simples y accesibles (no electrónicos), descritos con suficiente detalle. **Cada material debe estar en una nueva línea.**
- **estimatedTime:** El tiempo estimado para realizar la actividad (ej: "45 minutos").
- **teacherPreparation:** Describe qué debe hacer o preparar el docente ANTES de iniciar la clase. **Cada paso debe estar en una nueva línea.**
- **stepByStepDevelopment:** Esta es la sección más importante. Debe ser un guion de clase **exhaustivo y obligatoriamente numerado** (1., 2., 3., etc.). Detalla no solo lo que hay que hacer, sino **cómo hacerlo**. Incluye:
    - **Guion para el docente:** Sugerencias sobre qué decir, qué preguntas hacer para motivar a los estudiantes y cómo introducir cada fase (Inicio, Desarrollo, Cierre).
    - **Acciones de los estudiantes:** Describe con claridad qué deben hacer los estudiantes en cada paso.
    - **Gestión del tiempo:** Ofrece una estimación de tiempo para cada bloque de la actividad.
    - **Ejemplos prácticos:** Incluye ejemplos concretos que el docente pueda usar o dibujar en el tablero.
    - **Cada paso numerado debe estar en una nueva línea.**
- **activityResources:** ¡Aquí es donde tu creatividad brilla! Describe de manera exhaustiva y como una lista los recursos específicos y tangibles que el docente debe crear o dibujar. **Piensa más allá de las 'tarjetas'**. Tu prioridad es inventar elementos interactivos como **tableros de juego, diales con flechas, fichas personalizadas, modelos de papel para armar, semáforos de cartulina, o cualquier otro artefacto físico** que haga la actividad más memorable. Si propones tarjetas, deben ser muy justificadas. Describe el contenido final de cada recurso, no des ejemplos. Para tablas, define columnas y filas. **Cada recurso debe estar en una nueva línea.**
- **reflectionQuestion:** El contenido debe tener dos partes. Primero, una explicación detallada y clara que demuestre cómo la actividad evidencia el concepto de pensamiento computacional, conectando las acciones específicas del ejercicio con la teoría. Segundo, a continuación de la explicación, debe incluir preguntas para guiar la reflexión y la metacognición de los estudiantes. **Cada pregunta debe estar en una nueva línea y comenzar con un guion (-).**
- **evaluationCriteria:** Describe las evidencias de aprendizaje o los criterios que el docente puede observar para evaluar si los estudiantes alcanzaron el objetivo. **Cada criterio debe estar en una nueva línea.**

La salida debe ser un JSON array con tres objetos, donde cada objeto representa una actividad completa y detallada, conteniendo los campos especificados.
  `,
});

const generateEducationalActivitiesFlow = ai.defineFlow(
  {
    name: 'generateEducationalActivitiesFlow',
    inputSchema: GenerateEducationalActivitiesInputSchema,
    outputSchema: GenerateEducationalActivitiesOutputSchema,
  },
  async (input) => {
    // Pre-process the input to create a boolean flag for the prompt.
    const isAllConcepts = input.computationalConcept === 'Todos los conceptos';
    
    const promptInput = {
      ...input,
      isAllConcepts,
    };

    const {output} = await generateEducationalActivitiesPrompt(promptInput);
    return output!;
  }
);

    