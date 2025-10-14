
'use server';
/**
 * @fileOverview Genkit flow for generating clean SVG code from a text description.
 * - generateSvgCode: Main exported function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the SVG generation flow
const GenerateSvgCodeInputSchema = z.object({
  prompt: z.string().describe('A detailed text description of the desired SVG icon or illustration.'),
  style: z.enum(['outline', 'solid', 'duotone']).describe('The visual style of the SVG.'),
  complexity: z.enum(['simple', 'detailed']).describe('The level of detail in the SVG.'),
  color: z.string().optional().describe('A specific color hint, though the SVG should primarily use currentColor.'),
});
export type GenerateSvgCodeInput = z.infer<typeof GenerateSvgCodeInputSchema>;

// Output schema: expecting a single string of SVG code
const GenerateSvgCodeOutputSchema = z.object({
  svgCode: z.string().describe('The complete, clean, and optimized SVG code string.'),
});
export type GenerateSvgCodeOutput = z.infer<typeof GenerateSvgCodeOutputSchema>;


// The main prompt that instructs the AI
const generateSvgPrompt = ai.definePrompt({
  name: 'generateSvgPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: GenerateSvgCodeInputSchema },
  output: { schema: GenerateSvgCodeOutputSchema },
  prompt: `You are an expert SVG designer. Your sole task is to generate a single, complete, clean, and optimized SVG code based on a user's prompt.

**CRITICAL RULES:**
1.  **SVG Code Only:** Your response MUST be ONLY the SVG code. It must start with \`<svg ...>\` and end with \`</svg>\`. Do NOT include the word "svg", backticks, or any other explanatory text.
2.  **Use \`currentColor\`:** All \`stroke\` and \`fill\` attributes MUST be set to \`currentColor\`. This is non-negotiable and makes the SVG easily styleable with CSS.
3.  **Standard Attributes:** The main \`<svg>\` tag MUST include \`xmlns="http://www.w3.org/2000/svg"\`, a \`viewBox\`, and attributes for accessibility and styling like \`fill="none"\`, \`stroke="currentColor"\`, \`stroke-width="2"\`, \`stroke-linecap="round"\`, and \`stroke-linejoin="round"\`.
4.  **No Extraneous Data:** The generated SVG code must NOT contain any comments, metadata, or editor-specific data (like Sketch or Illustrator attributes).
5.  **Optimize:** The SVG path data should be as concise as possible.

**User Request:**
- **Description:** {{{prompt}}}
- **Style:** {{{style}}}
- **Complexity:** {{{complexity}}}
{{#if color}}
- **Color Hint:** While using \`currentColor\`, consider this color theme in the design: {{{color}}}
{{/if}}

Generate the SVG code now.
`,
});

// The Genkit flow that orchestrates the prompt
const generateSvgCodeFlow = ai.defineFlow(
  {
    name: 'generateSvgCodeFlow',
    inputSchema: GenerateSvgCodeInputSchema,
    outputSchema: GenerateSvgCodeOutputSchema,
  },
  async (input) => {
    const { output } = await generateSvgPrompt(input);
    if (!output?.svgCode) {
      throw new Error('La IA no pudo generar el código SVG.');
    }
    // Clean up potential markdown fences if the AI accidentally adds them
    const cleanedCode = output.svgCode.replace(/```svg\n?|```/g, '').trim();
    return { svgCode: cleanedCode };
  }
);

// Wrapper function to be called from the server action
export async function generateSvgCode(
  input: GenerateSvgCodeInput
): Promise<GenerateSvgCodeOutput> {
  return generateSvgCodeFlow(input);
}
