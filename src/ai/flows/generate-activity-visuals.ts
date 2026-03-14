'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity's resources and generate image prompts for each.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualItem } from '@/types';

const VisualAnalysisItemSchema = z.object({
  text: z.string().describe('The original, unmodified text of the resource item.'),
  imagePrompt: z.string().nullable().describe("A detailed, specific prompt for a text-to-image model. This MUST be generated for every resource that can be visualized. For simple text-only items (like headers), this can be null."),
});

const VisualAnalysisSchema = z.array(VisualAnalysisItemSchema);

const ActivityResourcesInputSchema = z.object({
    resources: z.string().describe('A string containing the newline-separated list of resources for the activity.'),
});

/**
 * Generates an image and a corresponding alt text using the AI model.
 */
async function generateImageAndAltText(prompt: string): Promise<{ imageUrl: string, altText: string } | null> {
    const fullPrompt = `Educational illustration for a teacher's guide, simple, clean, minimalist, professional, flat design, vector style, white background: ${prompt}`;
    const altText = `Guía visual para: ${prompt.substring(0, 100)}`;

    try {
        const { media } = await ai.generate({
            // Actualizado a Gemini 2.5 Flash
            model: 'gemini-2.5-flash',
            prompt: fullPrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (media && media.url) {
            return { imageUrl: media.url, altText };
        }
        
        console.warn(`AI generation did not return a valid image media object for prompt: "${prompt}"`);
        return null;

    } catch (error) {
        console.warn(`AI image generation failed for prompt: "${prompt}". Error:`, error);
        return null;
    }
};

export async function generateActivityVisuals(input: string): Promise<VisualItem[]> {
  return generateActivityVisualsFlow({ resources: input });
}

const analysisPrompt = ai.definePrompt({
    name: 'analyzeActivityForVisuals',
    // Actualizado a Gemini 2.5 Flash
    model: 'gemini-2.5-flash',
    input: { schema: ActivityResourcesInputSchema },
    output: { schema: VisualAnalysisSchema },
    prompt: `You are an expert Creative Director specializing in educational materials.
Your task is to analyze a list of activity resources and, for EACH item, generate a prompt to create a beautiful and clear visual illustration.

**CRITICAL RULES (NON-NEGOTIABLE):**
1.  **Process EVERY Item:** You MUST process EACH item from the input string, which is separated by newlines.
2.  **Image Prompts for EVERYTHING VISUAL:** For each resource, you must generate a detailed 'imagePrompt'.
3.  **QUANTITY & CONTENT (EXTREMELY IMPORTANT):** If a resource line specifies a quantity, you MUST generate an array with EXACTLY that number of distinct items.

Analyze the following activity resources and provide the output in the required JSON array format.

---
**Activity Resources:**
{{{resources}}}
---
`
});

const generateActivityVisualsFlow = ai.defineFlow(
  {
    name: 'generateActivityVisualsFlow',
    inputSchema: ActivityResourcesInputSchema,
    outputSchema: z.array(z.custom<VisualItem>()),
  },
  async (input) => {
    const { output: analysisResult } = await analysisPrompt(input);
    
    if (!analysisResult) {
      throw new Error("AI analysis failed to produce a visual plan for the resources.");
    }

    const generationPromises = analysisResult.map(async (item) => {
        let imageUrl: string | null = null;
        let imageAlt: string | null = null;

        if (item.imagePrompt) {
            const imageResult = await generateImageAndAltText(item.imagePrompt);
            if (imageResult) {
                imageUrl = imageResult.imageUrl;
                imageAlt = imageResult.altText;
            }
        }

        const finalItem: VisualItem = {
            text: item.text,
            svgCode: null,
            svgGenerationInput: null,
            imageUrl,
            imageAlt,
        };
        return finalItem;
    });

    const finalVisualItems = await Promise.all(generationPromises);
    const flattenedItems = finalVisualItems.flat();

    return flattenedItems;
  }
);
