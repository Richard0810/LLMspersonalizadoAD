
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity and generate relevant visual aids.
 * The flow acts as an "Art Director AI", deciding what to illustrate and how.
 *
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
  visualExamples: z.array(VisualItemSchema).describe('Visual aids for the suggested visual examples.'),
});

const GenerateActivityVisualsInputSchema = z.object({
  materials: z.string(),
  instructions: z.string(),
  reflection: z.string(),
  visualExamples: z.string(),
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
  visualExamples: z.array(InternalVisualItemSchema),
});


// Export the wrapper function that the client will call.
export async function generateActivityVisuals(input: GenerateActivityVisualsInput): Promise<GeneratedActivityVisuals> {
  return generateActivityVisualsFlow(input);
}


const analysisPrompt = ai.definePrompt({
    name: 'analyzeActivityForVisuals',
    input: { schema: GenerateActivityVisualsInputSchema },
    output: { schema: InternalOutputSchema },
    prompt: `You are an expert instructional designer and art director. Your task is to analyze an educational activity and decide which parts would benefit most from a visual aid.

You will receive four sections of an activity: materials, instructions, reflection, and visualExamples.
For EACH item in EACH section, you must make a decision:
1.  Is an image useful here? Images should only be for concrete, visualizable objects or actions. Do not generate images for abstract concepts or simple instructions like "ask the students". For the 'visualExamples' section, always try to generate an image.
2.  If yes, create a SIMPLE, CLEAR, and CONCISE prompt for an image generation model. The prompt should describe a clean, minimalistic, educational-style illustration. Think of simple icons or drawings a teacher would make on a whiteboard.
3.  If no image is needed, the 'imagePrompt' field MUST be null.

Analyze the following activity content:

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
**Suggested Visuals:**
{{{visualExamples}}}
---

Based on your analysis, provide the output in the required JSON format. For each line item in the original text, create a corresponding JSON object with the original text and either an 'imagePrompt' or null.
`,
});

const generateImage = async (prompt: string): Promise<string | null> => {
    if (!prompt) return null;
    try {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp', // Use the specified image generation model
            prompt: `Educational illustration, simple, clean, minimalist, whiteboard drawing style: ${prompt}`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media?.url || null;
    } catch (error) {
        console.error(`Failed to generate image for prompt "${prompt}":`, error);
        return null; // Return null if image generation fails for any reason
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
          const imageUrl = item.imagePrompt ? await generateImage(item.imagePrompt) : null;
          return { text: item.text, imageUrl };
        })
      );
    };

    const [materials, instructions, reflection, visualExamples] = await Promise.all([
      processSection(analysis.materials),
      processSection(analysis.instructions),
      processSection(analysis.reflection),
      processSection(analysis.visualExamples),
    ]);
    
    // Step 3: Return the final structured object with image URLs.
    return { materials, instructions, reflection, visualExamples };
  }
);
