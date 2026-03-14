'use server';
/**
 * @fileOverview A Genkit flow to generate SVG code based on a detailed guide.
 */

import { ai } from '@/ai/genkit';
import { SvgGenerationInputSchema, SvgGenerationOutputSchema, type SvgGenerationInput, type SvgGenerationOutput } from '@/types';

export async function generateSvgFromGuide(input: SvgGenerationInput): Promise<SvgGenerationOutput> {
  return generateSvgFromGuideFlow(input);
}

const generateSvgFromGuideFlow = ai.defineFlow(
  {
    name: 'generateSvgFromGuideFlow',
    inputSchema: SvgGenerationInputSchema,
    outputSchema: SvgGenerationOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert SVG generator. Generate SVG code for ${input.componentType} with title ${input.title} and color ${input.color}.`;

    const { text: svgCode } = await ai.generate({
      // Actualizado a Gemini 2.5 Flash
      model: 'gemini-2.5-flash',
      prompt,
    });
    
    if (!svgCode) {
      throw new Error("La IA no pudo generar el código SVG.");
    }
    
    const cleanedSvgCode = svgCode.replace(/```(xml|svg)?|```/g, '').trim();
    return { svgCode: cleanedSvgCode };
  }
);
