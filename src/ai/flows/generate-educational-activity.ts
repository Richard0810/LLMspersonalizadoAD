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
  activityName: z.string().describe('A creative name for the activity.'),
  learningObjective: z.string().describe('A clear learning objective for the activity.'),
  materials: z.string().describe('A list of simple materials needed for the activity.'),
  instructions: z.string().describe('Step-by-step instructions for the activity.'),
  reflectionQuestion: z.string().describe('A question or topic for reflection/closure.'),
});

const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Three distinct offline educational activities.');

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
  prompt: `You are an AI assistant designed to generate creative and engaging offline educational activities for teachers.

  Generate three distinct activities based on the following information. **All content MUST be in Spanish.**

  Lesson Name: {{{lessonName}}}
  Computational Thinking Concept: {{{computationalConcept}}}
  Subject Area: {{{subjectArea}}}
  Grade Level: {{{gradeLevel}}}

  Each activity should include:
  - A creative and engaging name for the activity (in Spanish).
  - A clear and measurable learning objective (in Spanish).
  - A list of simple and readily available materials (in Spanish).
  - Clear, step-by-step instructions that are easy to follow (in Spanish).
  - A thought-provoking reflection question or topic to encourage deeper thinking and understanding (in Spanish).

  Ensure that the activities are appropriate for the specified grade level and subject area, and that they effectively integrate the given computational thinking concept.

  Format the output as a JSON array of three objects, where each object represents an activity and includes the fields:
  activityName, learningObjective, materials, instructions, and reflectionQuestion.
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
