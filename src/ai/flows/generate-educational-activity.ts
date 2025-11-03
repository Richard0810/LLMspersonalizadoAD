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
  // --- Nuevos campos ---
  duration: z.string().describe('La duración estimada para la actividad, ej: "45 minutos".').optional(),
  teacherNotes: z.string().describe('Indicaciones adicionales del docente.').optional(),
  complexityLevel: z.enum(["Básico", "Intermedio", "Avanzado"]).describe('El nivel de complejidad deseado.').optional(),
  groupSize: z.enum(["Individual", "Parejas", "Grupal"]).describe('El formato social de la actividad.').optional(),
  context: z.enum(["Urbano", "Rural", "Mixto"]).describe('El contexto educativo para adaptar materiales.').optional(),
  activityType: z.string().describe('El formato pedagógico de la actividad, ej: "Juego".').optional(),
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
  evaluationCriteria: z.string().describe('Los criterios de evaluación o evidencias de aprendizaje que el docente puede usar para valorar el desempeño de los estudiantes, donde cada criterio está en una nueva línea.'),
  // --- Nuevos campos opcionales en el schema de salida ---
  duration: z.string().optional(),
  teacherNotes: z.string().optional(),
  complexityLevel: z.enum(["Básico", "Intermedio", "Avanzado"]).optional(),
  groupSize: z.enum(["Individual", "Parejas", "Grupal"]).optional(),
  context: z.enum(["Urbano", "Rural", "Mixto"]).optional(),
  activityType: z.string().optional(),
});

const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Tres actividades desconectadas, muy detalladas y listas para ser implementadas por un docente con poca experiencia en el tema.');

export type GenerateEducationalActivitiesOutput = z.infer<typeof GenerateEducationalActivitiesOutputSchema>;

export async function generateEducationalActivities(
  input: GenerateEducationalActivitiesInput
): Promise<GenerateEducationalActivitiesOutput> {
  return await generateEducationalActivitiesFlow(input);
}

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

**Parámetros Adicionales (MUY IMPORTANTES):**
- **Duración Estimada:** La actividad debe diseñarse para durar aproximadamente **{{{duration}}} minutos**. Ajusta el número de pasos y la profundidad en 'stepByStepDevelopment' para que coincida con este tiempo.
- **Nivel de Complejidad:** El nivel de la actividad debe ser **{{{complexityLevel}}}**. Un nivel 'Básico' debe tener menos pasos y conceptos más directos. Un nivel 'Avanzado' debe requerir más pensamiento crítico y tener más pasos.
- **Tamaño del Grupo:** La dinámica debe estar diseñada para un formato **{{{groupSize}}}**.
- **Tipo de Actividad:** El formato pedagógico principal debe ser un(a) **{{{activityType}}}**.
- **Contexto Educativo:** Adapta los materiales y ejemplos al contexto **{{{context}}}**. Si es 'Rural', prioriza materiales naturales o de muy fácil acceso.
{{#if teacherNotes}}
- **Indicaciones Adicionales del Docente:** Ten en cuenta estas indicaciones especiales: "{{{teacherNotes}}}"
{{/if}}


**Formato de Salida Requerido y Guía de Calidad (Debes ser MUY RIGUROSO con esta estructura):**
Asegúrate de que cada actividad generada cumpla estrictamente con lo siguiente:
- **title:** Un nombre creativo, lúdico y descriptivo para la actividad.
- **objective:** Un objetivo de aprendizaje claro, medible y específico, que esté en coherencia con los lineamientos del Ministerio de Educación Nacional (MEN) de Colombia para el grado especificado.
- **computationalConcept:** Menciona explícitamente el concepto o conceptos de pensamiento computacional que se trabajan.
- **materials:** Una lista de materiales simples y accesibles (no electrónicos), adaptados al contexto. **Especifica cantidades por grupo y ofrece opciones de sustitución**. Cada material debe estar en una nueva línea.
- **estimatedTime:** Usa el valor proporcionado en los parámetros ({{{duration}}} minutos).
- **teacherPreparation:** Describe qué debe hacer o preparar el docente ANTES de iniciar la clase. **Cada paso debe estar en una nueva línea.**
- **stepByStepDevelopment:** Esta es la sección más importante. Debe ser un guion de clase **exhaustivo y obligatoriamente numerado** (1., 2., 3., etc.) que se ajuste al nivel de complejidad y duración. Detalla no solo lo que hay que hacer, sino **cómo hacerlo**. Incluye:
    - **Guion para el docente:** Sugerencias sobre qué decir, qué preguntas hacer para motivar a los estudiantes y cómo introducir cada fase (Inicio, Desarrollo, Cierre).
    - **Acciones de los estudiantes:** Describe con claridad qué deben hacer los estudiantes en cada paso, según el tamaño del grupo.
    - **Gestión del tiempo:** Ofrece una estimación de tiempo realista para cada bloque de la actividad (ej: Inicio (10 min), Desarrollo (25 min), Cierre (10 min)) que sume el total de 'estimatedTime'.
    - **Ejemplos prácticos:** Incluye ejemplos concretos que el docente pueda usar o dibujar en el tablero.
- **activityResources:** ¡Aquí es donde tu creatividad brilla! Describe de manera exhaustiva y como una lista los recursos específicos y tangibles que el docente debe crear o dibujar, en línea con el tipo de actividad. **Piensa más allá de las 'tarjetas'**. Tu prioridad es inventar elementos interactivos como **tableros de juego, diales con flechas, fichas personalizadas, modelos de papel para armar, semáforos de cartulina, o cualquier otro artefacto físico** que haga la actividad más memorable.
- **reflectionQuestion:** El contenido debe tener dos partes. Primero, una explicación detallada que conecte las acciones del ejercicio con la teoría del pensamiento computacional. Segundo, a continuación, preguntas para guiar la reflexión de los estudiantes. **Cada pregunta debe estar en una nueva línea y comenzar con un guion (-).**
- **evaluationCriteria:** Describe las **evidencias de aprendizaje observables y verificables**, adaptadas al nivel de complejidad.
- **Rellena todos los campos opcionales del schema de salida** (duration, complexityLevel, etc.) con los valores que se te han proporcionado en los parámetros.

La salida debe ser un JSON array con tres objetos, donde cada objeto representa una actividad completa y detallada.
  `,
});

const generateEducationalActivitiesFlow = ai.defineFlow(
  {
    name: 'generateEducationalActivitiesFlow',
    inputSchema: GenerateEducationalActivitiesInputSchema,
    outputSchema: GenerateEducationalActivitiesOutputSchema,
  },
  async (input) => {
    const isAllConcepts = input.computationalConcept === 'Todos los conceptos';
    
    const promptInput = {
      ...input,
      isAllConcepts,
    };

    const {output} = await generateEducationalActivitiesPrompt(promptInput);
    return output!;
  }
);
