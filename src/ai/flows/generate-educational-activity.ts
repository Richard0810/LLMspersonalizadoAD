
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
  visualExamples: z.string().describe('Sugerencias de ejemplos visuales o diagramas que el docente puede dibujar en el tablero o en hojas para facilitar la comprensión (tablas, cuadrículas, mapas, pictogramas).'),
  reflectionQuestion: z.string().describe('Una explicación detallada que aclare cómo la actividad evidencia el concepto de pensamiento computacional, seguida por preguntas de reflexión para el estudiante, con cada pregunta en una nueva línea y precedida por un guion.'),
  evaluationCriteria: z.string().describe('Los criterios de evaluación o evidencias de aprendizaje que el docente puede usar para valorar el desempeño de los estudiantes, donde cada criterio está en una nueva línea.')
});

const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Tres actividades desconectadas, muy detalladas y listas para ser implementadas por un docente con poca experiencia en el tema.');

export type GenerateEducationalActivitiesOutput = z.infer<typeof GenerateEducationalActivitiesOutputSchema>;

export async function generateEducationalActivities(
  input: GenerateEducationalActivitiesInput
): Promise<GenerateEducationalActivitiesOutput> {
  return generateEducationalActivitiesFlow(input);
}

const generateEducationalActivitiesPrompt = ai.definePrompt({
  name: 'generateEducationalActivitiesPrompt',
  input: {schema: GenerateEducationalActivitiesInputSchema},
  output: {schema: GenerateEducationalActivitiesOutputSchema},
  prompt: `Rol: Eres un diseñador instruccional experto y un asesor pedagógico especializado en pensamiento computacional para el contexto educativo de Colombia.
Tarea: Tu misión es diseñar tres actividades desconectadas tan completas y detalladas que un docente, incluso sin experiencia previa en el tema, pueda implementarlas en su aula de manera exitosa y sin esfuerzo. Cada actividad debe ser un recurso educativo "llave en mano".
Audiencia: Docentes de tecnología e informática en Colombia, especialmente aquellos en contextos rurales o con baja conectividad.
Tono: Didáctico, claro, práctico, motivador y adaptable por los docentes.

**Instrucción Principal:**
Genera tres actividades desconectadas distintas y muy detalladas, basadas en la siguiente información. **Todo el contenido debe estar en español.**

- Tema a Tratar: {{{topicName}}}
- Concepto de Pensamiento Computacional a Tratar: {{{computationalConcept}}}
- Área Temática: {{{subjectArea}}}
- Nivel de Grado: {{{gradeLevel}}}

**Formato de Salida Requerido para cada actividad (Debes ser MUY RIGUROSO con esta estructura):**
Asegúrate de que cada actividad generada cumpla estrictamente con lo siguiente:
- **title:** Un nombre creativo y descriptivo para la actividad.
- **objective:** Un objetivo de aprendizaje claro, medible y específico, que esté en coherencia con los lineamientos del Ministerio de Educación Nacional (MEN) de Colombia para el grado especificado.
- **computationalConcept:** Menciona explícitamente el concepto de pensamiento computacional que se trabaja (Descomposición, Abstracción, Algoritmos, etc.).
- **materials:** Una lista de materiales simples y accesibles (no electrónicos), descritos con suficiente detalle. **Cada material debe estar en una nueva línea.**
- **estimatedTime:** El tiempo estimado para realizar la actividad (ej: "45 minutos").
- **teacherPreparation:** Describe qué debe hacer o preparar el docente ANTES de iniciar la clase. **Cada paso debe estar en una nueva línea.**
- **stepByStepDevelopment:** Esta es la sección más importante. Debe ser un guion de clase **exhaustivo y obligatoriamente numerado** (1., 2., 3., etc.). Detalla no solo lo que hay que hacer, sino **cómo hacerlo**. Incluye:
    - **Guion para el docente:** Sugerencias sobre qué decir, qué preguntas hacer para motivar a los estudiantes y cómo introducir cada fase (Inicio, Desarrollo, Cierre).
    - **Acciones de los estudiantes:** Describe con claridad qué deben hacer los estudiantes en cada paso.
    - **Gestión del tiempo:** Ofrece una estimación de tiempo para cada bloque de la actividad.
    - **Ejemplos prácticos:** Incluye ejemplos concretos que el docente pueda usar o dibujar en el tablero.
    - **Cada paso numerado debe estar en una nueva línea.**
- **visualExamples:** Describe ejemplos visuales o diagramas que el docente pueda dibujar en el tablero o en hojas para apoyar la explicación (ej: "una tabla de 3x3", "un diagrama de flujo simple con flechas", "pictogramas para representar acciones").
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
  async input => {
    const {output} = await generateEducationalActivitiesPrompt(input);
    return output!;
  }
);
