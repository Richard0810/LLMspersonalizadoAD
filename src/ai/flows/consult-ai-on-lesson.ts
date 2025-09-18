// src/ai/flows/consult-ai-on-lesson.ts
'use server';

/**
 * @fileOverview An AI agent for answering questions about a lesson or computational thinking.
 *
 * - consultAIOnLesson - A function that handles the question answering process.
 * - ConsultAIOnLessonInput - The input type for the consultAIOnLesson function.
 * - ConsultAIOnLessonOutput - The return type for the consultAIOnLesson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConsultAIOnLessonInputSchema = z.object({
  topicName: z.string().describe('The name of the current lesson topic.'),
  concept: z.string().describe('The key computational thinking concept for the lesson.'),
  area: z.string().describe('The subject area of the lesson.'),
  grade: z.string().describe('The grade level of the lesson.'),
  question: z.string().describe('The user question about the lesson or computational thinking.'),
});
export type ConsultAIOnLessonInput = z.infer<typeof ConsultAIOnLessonInputSchema>;

const ConsultAIOnLessonOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user question.'),
});
export type ConsultAIOnLessonOutput = z.infer<typeof ConsultAIOnLessonOutputSchema>;

export async function consultAIOnLesson(input: ConsultAIOnLessonInput): Promise<ConsultAIOnLessonOutput> {
  return consultAIOnLessonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'consultAIOnLessonPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: ConsultAIOnLessonInputSchema},
  output: {schema: ConsultAIOnLessonOutputSchema},
  prompt: `You are an expert in computational thinking and creating offline activities for education.

You will answer questions related to the current lesson, or general questions about computational thinking and offline activities.

Here is information about the current lesson context:
Topic: {{{topicName}}}
Concept: {{{concept}}}
Area: {{{area}}}
Grade: {{{grade}}}

Question: {{{question}}}`,
});

const consultAIOnLessonFlow = ai.defineFlow(
  {
    name: 'consultAIOnLessonFlow',
    inputSchema: ConsultAIOnLessonInputSchema,
    outputSchema: ConsultAIOnLessonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
