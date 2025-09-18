
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity and generate relevant visual aids.
 * The flow acts as an "Art Director AI", deciding what to illustrate and how.
 * It now calls the image generation model directly.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { GenerateActivityVisualsInput, GeneratedActivityVisuals, VisualItem } from '@/types';

// Define Zod schemas based on the types in src/types/index.ts
const VisualItemSchema = z.object({
  text: z.string().describe('The original text for the item or step.'),
  imageUrl: z.string().nullable().describe('The data URI of the generated image (or null if no image was generated for this item).'),
});

const GenerateActivityVisualsOutputSchema = z.object({
  materials: z.array(VisualItemSchema).describe('Visual aids for the necessary materials.'),
  instructions: z.array(VisualItemSchema).describe('Visual aids for the step-by-step instructions.'),
  reflection: z.array(VisualItemSchema).describe('Visual aids for the reflection questions.'),
  activityResources: z.array(VisualItemSchema).describe('Visual aids for the suggested visual examples.'),
});

const GenerateActivityVisualsInputSchema = z.object({
  materials: z.string(),
  instructions: z.string(),
  reflection: z.string(),
  activityResources: z.string(),
});

// This internal schema is what the AI will be prompted to produce.
// It includes an additional field for the AI to decide on the image prompt.
const InternalVisualItemSchema = z.object({
    text: z.string().describe('The original, unmodified text for the item or step.'),
    imagePrompt: z.string().nullable().describe('A concise, descriptive prompt for generating an image for this step. If no image is needed, this MUST be null. Example: "A simple drawing of a pencil and a notebook on a table".'),
});

const InternalOutputSchema = z.object({
  materials: z.array(InternalVisualItemSchema),
  instructions: z.array(InternalVisualItemSchema),
  reflection: z.array(InternalVisualItemSchema),
  activityResources: z.array(InternalVisualItemSchema),
});


// Export the wrapper function that the client will call.
export async function generateActivityVisuals(input: GenerateActivityVisualsInput): Promise<GeneratedActivityVisuals> {
  return generateActivityVisualsFlow(input);
}


const analysisPrompt = ai.definePrompt({
    name: 'analyzeActivityForVisuals',
    model: 'googleai/gemini-2.0-flash',
    input: { schema: GenerateActivityVisualsInputSchema },
    output: { schema: InternalOutputSchema },
    prompt: `You are an expert instructional designer and art director. Your task is to analyze an educational activity and decide which parts would benefit most from a visual aid.

You will receive four sections of an activity: materials, instructions, reflection, and activityResources.

**CRITICAL RULES:**
1.  **For 'materials', 'instructions', and 'reflection' sections, NEVER generate an image.** These are lists of text. The 'imagePrompt' field for all items in these sections MUST ALWAYS be null.
2.  **For the 'activityResources' section, you MUST be very selective.**
    *   **LAST RESORT:** Only generate an image if the resource describes a complex, purely visual scene that cannot be represented by text (e.g., "a drawing of a medieval castle", "a photo of a rainforest").
    *   **DO NOT GENERATE IMAGES FOR:** Simple objects (like 'pencil'), tables, charts, simple diagrams, or abstract concepts. If the text says "una tabla para representar...", the imagePrompt MUST be null, as the text itself is the visual guide.
    *   If an image is truly necessary, create a SIMPLE, CLEAR, and CONCISE prompt for an image generation model. The prompt should describe a clean, minimalist, educational-style illustration.
    *   If no image is needed, the 'imagePrompt' field MUST be null.

Analyze the following activity content and provide the output in the required JSON format.

---
**Materials:**
{{{materials}}}
---
**Instructions:**
{{{instructions}}}
---
**Reflection:**
{{{reflection}}}
---
**Activity Resources (activityResources):**
{{{activityResources}}}
---
`,
});

const generateImageDirectly = async (prompt: string): Promise<string | null> => {
    if (!prompt) return null;
    const fullPrompt = `Educational illustration, simple, clean, minimalist, whiteboard drawing style: ${prompt}`;

    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp', // Use the correct model from the bitacora
            prompt: fullPrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        if (media && media.url) {
          return media.url;
        }
        console.warn(`Image generation succeeded but returned no media object for prompt: "${prompt}"`);
        return null;
        
    } catch (error) {
        console.warn(`AI image generation failed for prompt: "${prompt}". Error:`, error);
        return null; // Return null on failure
    }
};

const generateActivityVisualsFlow = ai.defineFlow(
  {
    name: 'generateActivityVisualsFlow',
    inputSchema: GenerateActivityVisualsInputSchema,
    outputSchema: GenerateActivityVisualsOutputSchema,
  },
  async (input) => {
    // Step 1: AI analyzes the activity and decides on image prompts.
    const { output: analysis } = await analysisPrompt(input);
    if (!analysis) {
      throw new Error("AI analysis failed to produce a visual plan.");
    }

    // Step 2: Concurrently generate all the required images.
    const processSection = async (items: z.infer<typeof InternalVisualItemSchema>[]): Promise<VisualItem[]> => {
      if (!items) return [];
      return Promise.all(
        items.map(async (item) => {
          const imageUrl = item.imagePrompt ? await generateImageDirectly(item.imagePrompt) : null;
          return { text: item.text, imageUrl };
        })
      );
    };

    const [materials, instructions, reflection, activityResources] = await Promise.all([
      processSection(analysis.materials),
      processSection(analysis.instructions),
      processSection(analysis.reflection),
      processSection(analysis.activityResources),
    ]);
    
    // Step 3: Return the final structured object with image URLs.
    return { materials, instructions, reflection, activityResources };
  }
);
