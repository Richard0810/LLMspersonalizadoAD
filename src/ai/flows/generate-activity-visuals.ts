
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity and generate relevant visual aids.
 * The flow acts as an "Art Director AI", generating rich HTML components for activity resources.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { GenerateActivityVisualsInput, GeneratedActivityVisuals, VisualItem } from '@/types';

// Define Zod schemas based on the types in src/types/index.ts
const VisualItemSchema = z.object({
  text: z.string().describe('The original text for the item or step.'),
  htmlContent: z.string().nullable().describe('The data URI of the generated image (or null if no image was generated for this item).'),
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
// It now includes a field for the AI to decide on the HTML content.
const InternalVisualItemSchema = z.object({
    text: z.string().describe('The original, unmodified text for the item or step.'),
    htmlContent: z.string().nullable().describe('A self-contained HTML block for this resource. If no special visualization is needed, this MUST be null.'),
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
    prompt: `You are an expert UI/UX designer specializing in creating educational materials with HTML and Tailwind CSS.
Your task is to analyze an educational activity and generate rich HTML components for the 'activityResources'.

**CRITICAL RULES:**
1.  **For 'materials', 'instructions', and 'reflection' sections, NEVER generate HTML.** The 'htmlContent' field for all items in these sections MUST ALWAYS be null. Their 'text' field must contain the original unmodified text provided in the input. Split the text for these sections by newlines into individual 'text' items in the array.
2.  **For 'activityResources', you MUST generate a self-contained HTML component for EACH item.** Each item describes a resource like a card, a table, or a small diagram.
3.  **HTML & Styling Requirements (VERY IMPORTANT):**
    *   The output for 'htmlContent' MUST be a **single block of HTML**, starting with a \`<div>\` and containing all necessary elements and styles.
    *   Use **Tailwind CSS classes** for styling. DO NOT use inline \`<style>\` tags or external stylesheets.
    *   Create visually appealing "cards" or "widgets". Use classes like \`border\`, \`rounded-lg\`, \`p-4\`, \`bg-white\`, \`shadow-md\`.
    *   Use semantic and structural HTML (e.g., \`h3\`, \`p\`, \`strong\`).
    *   For elements like symbols or large icons (e.g., '+1', an arrow), use large font sizes (\`text-6xl\`, \`font-bold\`) and center them. Add accent colors like \`text-green-600\` or \`text-red-600\`.
    *   Example for a card: \`<div class="border rounded-lg p-6 bg-white shadow-lg w-full max-w-sm mx-auto text-center font-sans"> <h3 class="text-3xl font-bold mb-4">SUMAR</h3> <div class="text-left space-y-2"> <p><strong>ACCIÓN:</strong> Sumar</p> <p><strong>DESCRIPCIÓN:</strong> Suma 1 al valor de la casilla actual</p> </div> <div class="text-8xl font-bold text-green-600 mt-6">+1</div> </div>\`
    *   If the resource describes a table, generate a valid HTML \`<table>\` with Tailwind classes for styling (e.g. \`w-full\`, \`text-left\`, \`border-collapse\`). Style the header (\`<thead>\`) with a background color (e.g. \`bg-gray-100\`).
    *   Ensure the HTML is clean, valid, and self-contained for each resource.

Analyze the following activity content and provide the output in the required JSON format. Ensure all original text for materials, instructions, and reflection is preserved in the 'text' field, split into items by newlines.

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

const generateActivityVisualsFlow = ai.defineFlow(
  {
    name: 'generateActivityVisualsFlow',
    inputSchema: GenerateActivityVisualsInputSchema,
    outputSchema: GenerateActivityVisualsOutputSchema,
  },
  async (input) => {
    // Step 1: AI analyzes the activity and generates HTML content for resources.
    const { output: analysis } = await analysisPrompt(input);
    if (!analysis) {
      throw new Error("AI analysis failed to produce a visual plan.");
    }
    
    // The analysis now directly contains the htmlContent, so we just need to map the types.
    const processSection = (items: z.infer<typeof InternalVisualItemSchema>[] | undefined): VisualItem[] => {
      if (!items) return [];
      return items.map(item => ({
        text: item.text,
        htmlContent: item.htmlContent
      }));
    };

    return {
        materials: processSection(analysis.materials),
        instructions: processSection(analysis.instructions),
        reflection: processSection(analysis.reflection),
        activityResources: processSection(analysis.activityResources),
    };
  }
);
