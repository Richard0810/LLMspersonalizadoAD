'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity's resources and generate image prompts for each.
 * The flow acts as a "Creative Director AI", turning every resource item into a detailed image prompt.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualItem } from '@/types';

// Step 1: AI analysis output schema. Simplified to focus only on image generation.
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
        // @ts-ignore - This is added to bypass the type check in Vercel build
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
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
    model: 'googleai/gemini-2.0-flash',
    input: { schema: ActivityResourcesInputSchema },
    output: { schema: VisualAnalysisSchema },
    prompt: `You are an expert Creative Director specializing in educational materials.
Your task is to analyze a list of activity resources and, for EACH item, generate a prompt to create a beautiful and clear visual illustration.

**CRITICAL RULES (NON-NEGOTIABLE):**
1.  **Process EVERY Item:** You MUST process EACH item from the input string, which is separated by newlines.
2.  **Image Prompts for EVERYTHING VISUAL:** For each resource, you must generate a detailed 'imagePrompt'.
    - If the item is a **card** (e.g., "Tarjeta de acción: Avanza 2 casillas"), the prompt should describe the card itself. Example: "Una tarjeta de acción de estilo de juego de mesa, con el título 'AVANZA' y un ícono de dos huellas. Debajo, el texto 'Avanza 2 casillas'".
    - If the item is a **drawable object** (e.g., "Un tablero de juego con 15 casillas"), the prompt should describe the object. Example: "Un tablero de juego simple con una ruta de 15 casillas numeradas, estilo minimalista."
    - If the item is a **header or title** (e.g., "Tarjetas de Ritmo:"), you MUST set 'imagePrompt' to null. The text itself will be used as a title in the UI.
    - For simple, **non-visual items** (e.g., "Lápices", "Tijeras"), you MUST set 'imagePrompt' to null.
3.  **QUANTITY & CONTENT (EXTREMELY IMPORTANT):** If a resource line specifies a quantity (e.g., "Tarjetas de Instrucción (3 tarjetas): ... con ejemplo: 'Sumar A y B'"), you MUST generate an array with EXACTLY that number of distinct items. For each item, you MUST generate a relevant and creative 'imagePrompt', using the provided examples as a guide. Each card must be unique.

**CRITICAL EXAMPLE FOR CARDS (Expanding Quantity):**
-   **Input Resource:** "Tarjetas de Instrucción (3 tarjetas): Cada tarjeta debe tener una instrucción simple, por ejemplo: 'Sumar A y B', 'Restar B de A'."
-   **Your Output (must be an array of 3 objects):**
    [
      { "text": "Tarjeta de Instrucción 1", "imagePrompt": "Una tarjeta de instrucción de juego, fondo blanco, con el título 'INSTRUCCIÓN' y un ícono de suma (+). Debajo, el texto 'Sumar A y B'." },
      { "text": "Tarjeta de Instrucción 2", "imagePrompt": "Una tarjeta de instrucción de juego, fondo blanco, con el título 'INSTRUCCIÓN' y un ícono de resta (-). Debajo, el texto 'Restar B de A'." },
      { "text": "Tarjeta de Instrucción 3", "imagePrompt": "Una tarjeta de instrucción de juego, fondo blanco, con el título 'INSTRUCCIÓN' y un ícono de guardar (un disquete o flecha a una caja). Debajo, el texto 'Guardar resultado en A'." }
    ]

Analyze the following activity resources and provide the output in the required JSON array format, following all rules.

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
    // Step 1: Analyze the resources to decide what to generate (image prompts for everything)
    const { output: analysisResult } = await analysisPrompt(input);
    
    if (!analysisResult) {
      throw new Error("AI analysis failed to produce a visual plan for the resources.");
    }

    // Step 2: Concurrently generate all visuals (images only)
    const generationPromises = analysisResult.map(async (item) => {
        let imageUrl: string | null = null;
        let imageAlt: string | null = null;

        if (item.imagePrompt) {
            // Generate image from the prompt
            const imageResult = await generateImageAndAltText(item.imagePrompt);
            if (imageResult) {
                imageUrl = imageResult.imageUrl;
                imageAlt = imageResult.altText;
            }
        }

        const finalItem: VisualItem = {
            text: item.text,
            svgCode: null, // SVG generation is removed
            svgGenerationInput: null, // SVG generation is removed
            imageUrl,
            imageAlt,
        };
        return finalItem;
    });

    const finalVisualItems = await Promise.all(generationPromises);
    
    // The analysis result might be a nested array if the AI expands a quantity. Flatten it.
    const flattenedItems = finalVisualItems.flat();

    return flattenedItems;
  }
);
