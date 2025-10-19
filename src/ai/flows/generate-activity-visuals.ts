
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity's resources and generate SVG parameters or image prompts.
 * The flow acts as an "Art Director AI", deciding whether to generate parameters for an SVG component (like a card or table)
 * or an image prompt for something that needs to be drawn by hand.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualItem, SvgGenerationInput } from '@/types';
import { SvgGenerationInputSchema } from '@/types';
import { generateSvgFromGuide } from './generate-svg-code';

// Step 1: AI analysis output schema
const VisualAnalysisItemSchema = z.object({
  text: z.string().describe('The original, unmodified text of the resource item.'),
  svgGenerationInput: SvgGenerationInputSchema.nullable().describe("An object with the exact parameters for the 'generateSvgFromGuide' flow. This MUST be generated if the resource describes a card, table, or other structured component. If an 'imagePrompt' is generated, this MUST be null."),
  imagePrompt: z.string().nullable().describe("A detailed, specific prompt for a text-to-image model. This should ONLY be created if the resource describes a physical item to be DRAWN or CREATED BY HAND (e.g., a game board, a craft). If 'svgGenerationInput' is generated, this MUST be null."),
});

const VisualAnalysisSchema = z.array(VisualAnalysisItemSchema);

const ActivityResourcesInputSchema = z.object({
    resources: z.string().describe('A string containing the newline-separated list of resources for the activity.'),
});


/**
 * Generates an image and a corresponding alt text using the AI model.
 */
async function generateImageAndAltText(prompt: string): Promise<{ imageUrl: string, altText: string } | null> {
    const fullPrompt = `Educational illustration, simple, clean, minimalist, whiteboard drawing style for a teacher's guide: ${prompt}`;
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
    prompt: `You are an expert UI/UX designer and Art Director specializing in educational materials.
Your task is to analyze a list of activity resources and, for EACH item, generate a plan to create a visual component.

**CRITICAL RULES (NON-NEGOTIABLE):**
1.  **Process EVERY Item:** You MUST process EACH item from the input string, which is separated by newlines.
2.  **Choose ONE path:** For each resource, you must decide to generate parameters for EITHER 'svgGenerationInput' OR 'imagePrompt'. NEVER both.
3.  **SVG for Components:** If a resource describes structured content like a card or a table, you MUST generate an 'svgGenerationInput' object for it. 'imagePrompt' MUST be null.
4.  **Image Prompts for Drawings ONLY:** Only generate an 'imagePrompt' if the resource explicitly describes a physical, visual item to be DRAWN or CREATED BY HAND (e.g., "Dibuja un tablero con 20 casillas", "Crea un mapa del tesoro en una cartulina", "Un semáforo hecho con cartulina"). 'svgGenerationInput' MUST be null.
5.  **Headers and Titles:** If an item is just a header for sub-items (e.g., "Tarjetas de acción rítmica:"), you MUST treat it as a simple text item. Both 'svgGenerationInput' and 'imagePrompt' MUST be null. The text itself will be used as a title in the UI.
6.  **Simple Items = Null:** For simple resources that don't need a visual component (e.g., "Un lápiz", "Tijeras", "Una moneda"), BOTH 'svgGenerationInput' and 'imagePrompt' MUST be null.
7.  **QUANTITY & CONTENT (EXTREMELY IMPORTANT):** If a resource line specifies a quantity (e.g., "Tarjetas de Instrucción (10 tarjetas): ... con ejemplo: 'Sumar A y B'"), you MUST generate an array with EXACTLY that number of items. For each item in the array, you MUST generate a relevant and distinct 'title' and 'content', using the provided examples as a guide and creatively completing the rest. DO NOT generate empty or generic cards. Each card MUST have meaningful content derived from the instruction.

**CRITICAL EXAMPLE FOR SVG CARD (Expanding Quantity):**
-   **Input Resource:** "Tarjetas de Instrucción (3 tarjetas): Cada tarjeta debe tener una instrucción simple, por ejemplo: 'Sumar A y B', 'Restar B de A'."
-   **Your Output (must be an array of 3 objects):**
    [
      { "text": "Tarjeta de Instrucción 1", "svgGenerationInput": { "componentType": "carta_accion", "color": "#17a2b8", "title": "INSTRUCCIÓN", "content": "Sumar A y B" }, "imagePrompt": null },
      { "text": "Tarjeta de Instrucción 2", "svgGenerationInput": { "componentType": "carta_accion", "color": "#17a2b8", "title": "INSTRUCCIÓN", "content": "Restar B de A" }, "imagePrompt": null },
      { "text": "Tarjeta de Instrucción 3", "svgGenerationInput": { "componentType": "carta_accion", "color": "#17a2b8", "title": "INSTRUCCIÓN", "content": "Guardar resultado en A" }, "imagePrompt": null }
    ]

**CRITICAL EXAMPLE FOR IMAGE PROMPT:**
-   **Input Resource:** "Un semáforo de cartulina con círculos de colores rojo, amarillo y verde."
-   **Your Output:** \`[{ "text": "Un semáforo de cartulina...", "svgGenerationInput": null, "imagePrompt": "Un dibujo de un semáforo simple hecho de cartulina, estilo guía para manualidades, mostrando claramente los círculos rojo, amarillo y verde." }]\`

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
    // Step 1: Analyze the resources to decide what to generate (SVG inputs and/or image prompts)
    const { output: analysisResult } = await analysisPrompt(input);
    
    if (!analysisResult) {
      throw new Error("AI analysis failed to produce a visual plan for the resources.");
    }

    // Step 2: Concurrently generate all visuals (both SVG and images)
    const generationPromises = analysisResult.map(async (item) => {
        let svgCode: string | null = null;
        let imageUrl: string | null = null;
        let imageAlt: string | null = null;

        if (item.svgGenerationInput) {
            // Generate SVG from the parameters
            const svgResult = await generateSvgFromGuide(item.svgGenerationInput);
            svgCode = svgResult.svgCode;
        } else if (item.imagePrompt) {
            // Generate image from the prompt
            const imageResult = await generateImageAndAltText(item.imagePrompt);
            if (imageResult) {
                imageUrl = imageResult.imageUrl;
                imageAlt = imageResult.altText;
            }
        }

        const finalItem: VisualItem = {
            text: item.text,
            svgGenerationInput: item.svgGenerationInput,
            svgCode,
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
