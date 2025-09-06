
'use server';
/**
 * @fileOverview A flow to generate visual content for an educational activity.
 * It analyzes text sections (materials, instructions, reflection) and generates
 * relevant images for each part.
 *
 * - generateVisualContent - The main function to trigger the visual content generation.
 * - GenerateVisualContentInput - The input type for the flow.
 * - GenerateVisualContentOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateVisualContentInputSchema = z.object({
  materials: z.string().describe('The materials section of the activity.'),
  instructions: z.string().describe('The instructions section of the activity.'),
  reflection: z.string().describe('The reflection section of the activity.'),
});
export type GenerateVisualContentInput = z.infer<typeof GenerateVisualContentInputSchema>;

const ImageGenerationSchema = z.object({
    shouldGenerate: z.boolean().describe("Whether an image is relevant and should be generated for this text snippet."),
    imagePrompt: z.string().optional().describe("A detailed, descriptive prompt for a text-to-image model. Example: 'A simple black and white word search puzzle about planets'. Be specific."),
});

const VisualStepSchema = z.object({
  step: z.string().describe('The original text for this step.'),
  image: z.string().optional().describe('The generated image as a Base64 data URI.'),
});

const GenerateVisualContentOutputSchema = z.object({
  materials: z.array(VisualStepSchema),
  instructions: z.array(VisualStepSchema),
  reflection: z.array(VisualStepSchema),
});
export type GenerateVisualContentOutput = z.infer<typeof GenerateVisualContentOutputSchema>;

// Helper function to process a text section (e.g., instructions)
async function processSection(text: string): Promise<z.infer<typeof VisualStepSchema>[]> {
    if (!text.trim()) {
        return [];
    }

    // Split text into processable chunks (e.g., by line breaks for numbered lists or paragraphs)
    const chunks = text.split('\n').filter(chunk => chunk.trim() !== '');

    const processedChunks = await Promise.all(
        chunks.map(async (chunk) => {
            const llmResponse = await ai.generate({
                model: googleAI('gemini-2.0-flash'),
                prompt: `Analyze the following text from an educational activity. Decide if a simple, clear, and helpful visual aid (like a simple drawing, diagram, or graphic) would enhance it for a teacher or student. If so, create a specific DALL-E 3 style prompt to generate it. If not, indicate that no image is needed. The visual should be simple, almost like a line drawing or a basic graphic.

Text to analyze: "${chunk}"`,
                output: { schema: ImageGenerationSchema },
                config: { temperature: 0.2 },
            });

            const decision = llmResponse.output;
            if (!decision) {
                return { step: chunk };
            }

            if (decision.shouldGenerate && decision.imagePrompt) {
                const {media} = await ai.generate({
                    model: googleAI('imagen-4.0-fast-generate-001'),
                    prompt: decision.imagePrompt,
                });
                return {
                    step: chunk,
                    image: media?.url,
                };
            }

            return { step: chunk };
        })
    );

    return processedChunks.filter(Boolean) as z.infer<typeof VisualStepSchema>[];
}

const generateVisualContentFlow = ai.defineFlow(
  {
    name: 'generateVisualContentFlow',
    inputSchema: GenerateVisualContentInputSchema,
    outputSchema: GenerateVisualContentOutputSchema,
  },
  async (input) => {
    const [materials, instructions, reflection] = await Promise.all([
      processSection(input.materials),
      processSection(input.instructions),
      processSection(input.reflection),
    ]);

    return {
      materials,
      instructions,
      reflection,
    };
  }
);

export async function generateVisualContent(input: GenerateVisualContentInput): Promise<GenerateVisualContentOutput> {
  return generateVisualContentFlow(input);
}
