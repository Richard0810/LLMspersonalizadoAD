'use server';

/**
 * @fileOverview A flow to generate three distinct offline educational activities based on user input.
 *
 * - generateEducationalActivities - A function that triggers the activity generation process.
 * - GenerateEducationalActivitiesInput - The input type for the generateEducationalActivities function.
 * - GenerateEducationalActivitiesOutput - The return type for the generateEducationalActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEducationalActivitiesInputSchema = z.object({
  lessonName: z.string().describe('The name of the lesson.'),
  computationalConcept: z.string().describe('The key computational thinking concept.'),
  subjectArea: z.string().describe('The subject area or discipline.'),
  gradeLevel: z.string().describe('The grade level for the activities.'),
});

export type GenerateEducationalActivitiesInput = z.infer<typeof GenerateEducationalActivitiesInputSchema>;

const EducationalActivitySchema = z.object({
  activityName: z.string().describe('Un nombre detallado para la actividad desconectada.'),
  learningObjective: z.string().describe('Un objetivo de aprendizaje claro y medible.'),
  materials: z.string().describe('Una lista de materiales simples y accesibles (no electrónicos).'),
  instructions: z.string().describe('Instrucciones detalladas paso a paso para el docente y los estudiantes.'),
  reflectionQuestion: z.string().describe('Una pregunta o tema para la reflexión y el cierre pedagógico de la actividad.'),
});

const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Tres actividades desconectadas y detalladas.');

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
  prompt: `Rol: Eres un asesor educativo especializado en informática.
Tarea: Ayudar a docentes del área de tecnología a diseñar actividades desconectadas enfocadas en el desarrollo del pensamiento computacional. Dado un concepto relacionado con pensamiento computacional, debes generar una actividad que no requiera dispositivos electrónicos, pero que facilite la comprensión del contenido.
Audiencia: Docentes de tecnología e informática que buscan estrategias didácticas para desarrollar el pensamiento computacional en contextos con baja conectividad.
Contexto: Serás utilizado en entornos educativos para la planificación de clases, especialmente en zonas rurales o con baja conectividad.
Tono: Académico, didáctico y formal.

**Instrucción Principal:**
Genera tres actividades desconectadas distintas basadas en la siguiente información. **Todo el contenido debe estar en español.**

- Nombre de la Lección de Referencia: {{{lessonName}}}
- Concepto de Pensamiento Computacional a Tratar: {{{computationalConcept}}}
- Área Temática: {{{subjectArea}}}
- Nivel de Grado: {{{gradeLevel}}}

**Formato de Salida Requerido para cada actividad:**
Asegúrate de que cada actividad generada cumpla estrictamente con la siguiente estructura:
- **Nombre de la actividad:** Un título claro y descriptivo.
- **Objetivo de aprendizaje:** Un objetivo pedagógico preciso.
- **Materiales necesarios:** Lista de elementos sencillos y no electrónicos.
- **Instrucciones paso a paso:** Una guía detallada para que el docente pueda implementar la actividad.
- **Reflexión o cierre:** Una pregunta o dinámica para consolidar el aprendizaje.

La salida debe ser un JSON array con tres objetos, donde cada objeto representa una actividad y contiene los campos: activityName, learningObjective, materials, instructions, y reflectionQuestion.
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
