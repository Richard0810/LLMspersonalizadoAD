
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
  topicName: z.string().describe('El tema a tratar en la actividad.'),
  computationalConcept: z.string().describe('The key computational thinking concept.'),
  subjectArea: z.string().describe('The subject area or discipline.'),
  gradeLevel: z.string().describe('The grade level for the activities.'),
});

export type GenerateEducationalActivitiesInput = z.infer<typeof GenerateEducationalActivitiesInputSchema>;

const EducationalActivitySchema = z.object({
  activityName: z.string().describe('Un nombre creativo y detallado para la actividad desconectada.'),
  learningObjective: z.string().describe('Un objetivo de aprendizaje claro, medible y específico.'),
  materials: z.string().describe('Una lista de materiales simples y accesibles (no electrónicos), descritos con suficiente detalle para que el docente pueda prepararlos fácilmente. Si se usan tarjetas, describir qué deben contener.'),
  instructions: z.string().describe('Instrucciones detalladas y obligatoriamente numeradas (paso a paso) que guíen al docente como si fuera un guion de clase. Deben incluir ejemplos prácticos, ejercicios y la dinámica completa de la actividad. No se debe usar NINGÚN tipo de formato especial como asteriscos para negrita.'),
  reflectionQuestion: z.string().describe('Una explicación detallada y clara de cómo la actividad evidencia el concepto de pensamiento computacional, conectando los pasos del ejercicio con la teoría. Además, debe incluir una pregunta o tema para la reflexión y el cierre pedagógico de la actividad.'),
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
  prompt: `Rol: Eres un diseñador instruccional experto y un asesor pedagógico especializado en pensamiento computacional.
Tarea: Tu misión es diseñar actividades desconectadas tan completas y detalladas que un docente, incluso sin experiencia previa en el tema, pueda implementarlas en su aula de manera exitosa y sin esfuerzo. Cada actividad debe ser un recurso educativo "llave en mano".
Audiencia: Docentes de tecnología e informática, especialmente aquellos en contextos rurales o con baja conectividad que necesitan recursos didácticos muy claros, intuitivos y prácticos.
Contexto: Serás el núcleo de una herramienta de IA que busca cerrar la brecha de conocimiento y recursos para enseñar pensamiento computacional de manera efectiva sin necesidad de tecnología en el aula.
Tono: Didáctico, claro, alentador y extremadamente práctico.

**Instrucción Principal:**
Genera tres actividades desconectadas distintas y muy detalladas, basadas en la siguiente información. **Todo el contenido debe estar en español.**

- Tema a Tratar: {{{topicName}}}
- Concepto de Pensamiento Computacional a Tratar: {{{computationalConcept}}}
- Área Temática: {{{subjectArea}}}
- Nivel de Grado: {{{gradeLevel}}}

**Formato de Salida Requerido para cada actividad (Debes ser muy riguroso con esta estructura):**
Asegúrate de que cada actividad generada cumpla estrictamente con lo siguiente:
- **Nombre de la actividad:** Un título creativo, claro y descriptivo que enganche al estudiante.
- **Objetivo de aprendizaje:** Un objetivo pedagógico preciso y medible.
- **Materiales necesarios:** Describe los elementos de forma muy detallada. Si se usan tarjetas, especifica qué deben contener (ej: "10 tarjetas de acción con verbos como 'Avanzar', 'Girar Izquierda'", "5 tarjetas de condición con dibujos de 'obstáculo' o 'camino libre'").
- **Instrucciones paso a paso:** Presenta una guía **obligatoriamente numerada** y exhaustiva (1., 2., 3., etc.), como un guion de clase. Incluye qué debe decir el docente, qué deben hacer los estudiantes, y ejemplos prácticos o un ejercicio guiado. La guía debe ser tan clara que no deje lugar a dudas. **IMPORTANTE: No uses NUNCA asteriscos (**) para resaltar texto. El texto debe ser plano, solo estructurado con números y saltos de línea.**
- **Reflexión y Conexión:** Este apartado es crucial y debe tener dos partes bien diferenciadas:
    1.  **Conexión con el Pensamiento Computacional:** Explica con sumo detalle cómo la dinámica y cada parte de la actividad demuestran y ayudan a comprender el concepto clave solicitado (ej. "En esta actividad, la descomposición se manifiesta cuando los estudiantes dividen el problema grande de 'crear un mapa' en las siguientes subtareas: 1. Dibujar el punto de inicio, 2. Trazar el camino principal, 3. Añadir los obstáculos..."). La conexión debe ser explícita y didáctica.
    2.  **Cierre Pedagógico:** Propón una pregunta de reflexión profunda o una dinámica final que consolide el aprendizaje y permita a los estudiantes articular lo que aprendieron.

La salida debe ser un JSON array con tres objetos, donde cada objeto representa una actividad completa y detallada, conteniendo los campos: activityName, learningObjective, materials, instructions, y reflectionQuestion.
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
