
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity's resources and generate rich HTML components.
 * The flow acts as an "Art Director AI", generating rich HTML components for activity resources.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualItem } from '@/types';

const VisualItemSchema = z.object({
  text: z.string().describe('The original text for the item or step.'),
  htmlContent: z.string().nullable().describe('The self-contained HTML block for this resource. If no special visualization is needed, this MUST be null.'),
});

const GenerateActivityVisualsOutputSchema = z.array(VisualItemSchema);

const ActivityResourcesInputSchema = z.string().describe('A string containing the newline-separated list of resources for the activity.');


export async function generateActivityVisuals(input: string): Promise<VisualItem[]> {
  return generateActivityVisualsFlow(input);
}


const analysisPrompt = ai.definePrompt({
    name: 'analyzeActivityForVisuals',
    model: 'googleai/gemini-2.0-flash',
    input: { schema: ActivityResourcesInputSchema },
    output: { schema: GenerateActivityVisualsOutputSchema },
    prompt: `You are an expert UI/UX designer specializing in creating educational materials with HTML and Tailwind CSS.
Your task is to analyze a list of activity resources and generate a rich, self-contained HTML component for EACH item.

**CRITICAL RULES:**
1.  You MUST process EACH item from the input string, which is separated by newlines.
2.  For each item, you MUST generate a corresponding object in the output array. This object MUST contain:
    *   'text': The original, unmodified text of the resource item.
    *   'htmlContent': A self-contained HTML block for this resource. If the resource is simple text that doesn't need a visual component (like "Un lápiz"), this MUST be null. For all others, generate HTML.
3.  **HTML & Styling Requirements (VERY IMPORTANT):**
    *   The output for 'htmlContent' MUST be a **single block of HTML**, starting with a \`<div>\` and containing all necessary elements and styles.
    *   Use **Tailwind CSS classes** for styling. DO NOT use inline \`<style>\` tags or external stylesheets.
    *   Create visually appealing "cards" or "widgets". Use classes like \`border\`, \`rounded-lg\`, \`p-4\`, \`bg-white\`, \`shadow-md\`.
    *   Use semantic and structural HTML (e.g., \`h3\`, \`p\`, \`strong\`).
    *   For elements like symbols or large icons (e.g., '+1', an arrow), use large font sizes (\`text-6xl\`, \`font-bold\`) and center them. Add accent colors like \`text-green-600\` or \`text-red-600\`.
    *   Example for a card: \`<div class="border rounded-lg p-6 bg-white shadow-lg w-full max-w-sm mx-auto text-center font-sans"> <h3 class="text-3xl font-bold mb-4">SUMAR</h3> <div class="text-left space-y-2"> <p><strong>ACCIÓN:</strong> Sumar</p> <p><strong>DESCRIPCIÓN:</strong> Suma 1 al valor de la casilla actual</p> </div> <div class="text-8xl font-bold text-green-600 mt-6">+1</div> </div>\`
    *   If the resource describes a table, generate a valid HTML \`<table>\` with Tailwind classes for styling (e.g. \`w-full\`, \`text-left\`, \`border-collapse\`). Style the header (\`<thead>\`) with a background color (e.g. \`bg-gray-100\`).
    *   Ensure the HTML is clean, valid, and self-contained for each resource.

Analyze the following activity resources and provide the output in the required JSON array format.

---
**Activity Resources:**
{{{input}}}
---
`,
});

const generateActivityVisualsFlow = ai.defineFlow(
  {
    name: 'generateActivityVisualsFlow',
    inputSchema: ActivityResourcesInputSchema,
    outputSchema: GenerateActivityVisualsOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      throw new Error("AI analysis failed to produce a visual plan for the resources.");
    }
    return output;
  }
);
