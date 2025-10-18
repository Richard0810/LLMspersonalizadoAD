
'use server';
/**
 * @fileOverview A Genkit flow to analyze an educational activity's resources and generate rich HTML components and conditional image guides.
 * The flow acts as an "Art Director AI", generating rich HTML components for activity resources and deciding when to generate an image guide.
 * - generateActivityVisuals - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualItem } from '@/types';

// Step 1: AI analysis output schema
const VisualAnalysisItemSchema = z.object({
  text: z.string().describe('The original, unmodified text of the resource item.'),
  htmlContent: z.string().nullable().describe('A self-contained, Tailwind-styled HTML block for this resource. If the resource is a simple text that doesn\'t need a visual component, this MUST be null.'),
  imagePrompt: z.string().nullable().describe("A detailed, specific prompt for a text-to-image model to generate a visual guide. This should ONLY be created if the resource describes a physical item to be drawn or built (e.g., a game board, a specific craft). For abstract cards or simple items, this MUST be null."),
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
    const altText = `Guía visual para: ${prompt.substring(0, 100)}`; // Simple and reliable alt text

    try {
        // @ts-ignore - This is added to bypass the type check in Vercel build
        const { media, text } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: fullPrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'], // CRITICAL: This is required to get an image
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
Your task is to analyze a list of activity resources and, for EACH item, generate a rich visual representation.

**CRITICAL RULES (NON-NEGOTIABLE):**
1.  **Process EVERY Item:** You MUST process EACH item from the input string, which is separated by newlines.
2.  **Generate One Component per Item:** For each resource, you must decide to generate EITHER 'htmlContent' OR 'imagePrompt', but NEVER both. If 'htmlContent' is generated, 'imagePrompt' MUST be null.
3.  **HTML for Structured Data:** If a resource describes structured content (like a card with title/action, a table with columns, or a list of instructions), you MUST generate 'htmlContent' for it. For example, "Plantilla... dividida en dos columnas: 'Instrucción' y 'Repeticiones'" MUST be generated as an HTML table.
4.  **Image Prompts for Drawings ONLY:** Only generate an 'imagePrompt' if the resource explicitly describes a physical, visual item to be DRAWN or CREATED BY HAND (e.g., "Dibuja un tablero con 20 casillas", "Crea un mapa del tesoro en una cartulina").
5.  **Headers as HTML:** If an item is a header for sub-items (e.g., "Tarjetas de acción rítmica:"), you MUST generate an 'htmlContent' block that styles it as a title (e.g., \`<h4 class="text-2xl font-bold ...">...</h4>\`). 'imagePrompt' MUST be null.
6.  **Simple Items = Null:** For simple resources that don't need a visual component (e.g., "Un lápiz", "Tijeras", "Una moneda"), BOTH 'htmlContent' and 'imagePrompt' MUST be null.

**HTML & STYLING REQUIREMENTS ('htmlContent'):**
*   Use Tailwind CSS classes ONLY. DO NOT use inline \`<style>\` tags.
*   **Card Design**: Create a vertical card. Use classes like \`border\`, \`rounded-lg\`, \`shadow-lg\`, \`w-full\`, \`max-w-xs\`, \`mx-auto\`, \`bg-card\`, \`font-sans\`, \`overflow-hidden\`.
    *   **Header**: A div with a background color (\`bg-primary\`, \`p-3\`).
    *   **Main Title**: Inside, an \`h3\` with \`text-xl\`, \`font-bold\`, \`text-primary-foreground\`, \`text-center\`, \`uppercase\`.
    *   **Content Body**: Main content area with padding (\`p-6\`).
    *   **Symbol/Icon**: Centered (\`text-center\`), large (\`text-6xl\`), with space (\`my-4\`). Use unicode characters.
    *   **Separator**: A horizontal rule (\`<hr class="border-border">\`).
    *   **Text Details**: Labels like "Acción:" MUST be in \`<strong>\` tags.
*   **For tables**: If a resource describes a "tabla" or "columnas", you MUST generate a valid HTML \`<table>\` with Tailwind classes (\`w-full\`, \`border-collapse\`), and style the header (\`bg-gray-100\`).
*   **CRITICAL EXAMPLE FOR CARD**: For "Título: PALMADA, Acción: Dar una palmada., Símbolo: 👏", the HTML MUST look like this:
    \`\`\`html
    <div class="border rounded-lg shadow-lg w-full max-w-xs mx-auto bg-card font-sans overflow-hidden">
      <div class="bg-primary p-3">
        <h3 class="text-xl font-bold text-primary-foreground text-center uppercase">PALMADA</h3>
      </div>
      <div class="p-6">
        <div class="text-center text-6xl my-4">👏</div>
        <hr class="border-border">
        <div class="mt-4 space-y-2 text-sm">
          <p><strong class="text-foreground">Acción:</strong> <span class="text-muted-foreground">Dar una palmada.</span></p>
        </div>
      </div>
    </div>
    \`\`\`
*   **CRITICAL EXAMPLE FOR TABLE**: For "Plantilla... dividida en dos columnas: 'Instrucción' y 'Repeticiones'.", generate an HTML table. 'imagePrompt' MUST be null.

**IMAGE PROMPT REQUIREMENTS ('imagePrompt'):**
*   Be specific. Instead of "un tablero", describe "Un tablero de juego simple, estilo dibujo, con 20 casillas numeradas. La casilla 1 dice 'Inicio' y la 20 'Fin'."
*   If you generate an 'imagePrompt', 'htmlContent' MUST be null.

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
    // Step 1: Analyze the resources to decide what to generate (HTML and/or image prompts)
    const { output: analysisResult } = await analysisPrompt(input);
    
    if (!analysisResult) {
      throw new Error("AI analysis failed to produce a visual plan for the resources.");
    }

    // Step 2: Concurrently generate images for items that have an imagePrompt
    const imageGenerationPromises = analysisResult.map(item => {
        if (item.imagePrompt) {
            return generateImageAndAltText(item.imagePrompt);
        }
        return Promise.resolve(null); // No image needed for this item
    });

    const generatedImages = await Promise.all(imageGenerationPromises);

    // Step 3: Combine the analysis results with the generated images
    const finalVisualItems: VisualItem[] = analysisResult.map((item, index) => {
        const imageResult = generatedImages[index];
        return {
            text: item.text,
            htmlContent: item.htmlContent,
            imageUrl: imageResult ? imageResult.imageUrl : null,
            imageAlt: imageResult ? imageResult.altText : null,
        };
    });
    
    return finalVisualItems;
  }
);
