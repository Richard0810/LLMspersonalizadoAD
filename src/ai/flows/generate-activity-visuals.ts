
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
  htmlContent: z.string().nullable().describe('A self-contained, Tailwind-styled HTML block for this resource. If the resource is simple text that doesn\'t need a visual component, this MUST be null.'),
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
            const { text: altText } = await ai.generate({
                model: 'googleai/gemini-2.0-flash',
                prompt: `Genera un texto alternativo (alt text) conciso para una imagen que muestra lo siguiente: "${prompt}". El alt text debe ser descriptivo y no exceder los 150 caracteres.`,
            });
            return { imageUrl: media.url, altText: altText || `Guía visual para: ${prompt.substring(0, 100)}` };
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

**CRITICAL RULES:**
1.  You MUST process EACH item from the input string, which is separated by newlines.
2.  If a resource is a main header for a list of sub-items (e.g., "Tarjetas de 'Instrucción':" followed by "Título: INSTRUCCIÓN..."), you MUST process each sub-item individually. The main header itself should also have its own object in the output array, but its 'htmlContent' and 'imagePrompt' MUST be null.
3.  For each item/sub-item, you MUST generate a corresponding object in the output array. This object MUST contain:
    *   'text': The original, unmodified text of the resource item.
    *   'htmlContent': A self-contained HTML block styled with Tailwind CSS. If the resource is simple text that doesn't need a visual component (like "Un lápiz" or a coded message), this MUST be null. For all others, generate a visually appealing HTML "card" or "widget".
    *   'imagePrompt': A detailed text-to-image prompt. This field is CRUCIAL. It MUST be null for most items. Only generate a prompt string if the resource explicitly describes a physical, visual item to be drawn or created by the teacher (e.g., "Dibuja un tablero con 20 casillas", "Crea un mapa del tesoro en una cartulina"). For abstract items like "Tarjeta de Acción: Sumar" or text-based content, the prompt MUST be null.

**HTML & STYLING REQUIREMENTS ('htmlContent'):**
*   The output MUST be a single, self-contained block of HTML, starting with a \`<div>\`.
*   Use Tailwind CSS classes ONLY. DO NOT use inline \`<style>\` tags.
*   **Card Design**: Create vertical, visually appealing cards. Use classes like \`border\`, \`rounded-lg\`, \`p-6\`, \`bg-white\`, \`shadow-lg\`, \`w-full\`, \`max-w-sm\`, \`mx-auto\`, \`text-center\`, \`font-sans\`.
*   **Visual Hierarchy**:
    *   **Main Title**: Use \`h3\` with \`text-3xl\`, \`font-bold\`, \`mb-4\`, \`uppercase\`, and \`text-primary\`.
    *   **Content Body**: Use a \`div\` with \`text-left\`, \`space-y-2\`, and \`text-muted-foreground\`. Use \`<strong>\` for labels like "Acción:".
    *   **Symbol/Icon**: This is the visual anchor. Place it at the bottom. It MUST be in a separate \`<div>\` and be VERY LARGE. Use \`text-8xl\`, \`font-bold\`, \`text-accent\`, and give it top margin (\`mt-6\`). Use unicode characters for symbols where possible.
*   **For tables**: If the resource describes a "tabla", you MUST generate a valid HTML \`<table>\` with Tailwind classes (\`w-full\`, \`border-collapse\`), and style the header (\`bg-gray-100\`).
*   **CRITICAL EXAMPLE**: For a card like "Título: INSTRUCCIÓN, Acción: Indica la tarea..., Descripción: Contiene la orden..., Símbolo: Un foco que se enciende.", the HTML MUST look like this:
    \`\`\`html
    <div class="border rounded-lg p-6 bg-white shadow-lg w-full max-w-sm mx-auto text-center font-sans">
      <h3 class="text-3xl font-bold mb-4 uppercase text-primary">INSTRUCCIÓN</h3>
      <div class="text-left space-y-2 text-muted-foreground">
        <p><strong>Acción:</strong> Indica la tarea a realizar por la CPU.</p>
        <p><strong>Descripción:</strong> Contiene la orden específica que debe ejecutar la CPU (ej: Sumar, Restar, Multiplicar).</p>
      </div>
      <div class="text-8xl font-bold text-accent mt-6">💡</div>
    </div>
    \`\`\`

**IMAGE PROMPT REQUIREMENTS ('imagePrompt'):**
*   Be specific. Instead of "un tablero", describe "Un tablero de juego simple, estilo dibujo, con 20 casillas numeradas del 1 al 20. La casilla 1 dice 'Inicio' y la 20 'Fin'. Algunas casillas tienen símbolos simples como un engranaje o una lupa."
*   If the resource is a simple card like "Tarjeta de Acción: Avanzar" or just text, the 'imagePrompt' MUST be null.

Analyze the following activity resources and provide the output in the required JSON array format.

---
**Activity Resources:**
{{{resources}}}
---
`,
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
            imageAlt: imageResult ? imageResult.imageAlt : null,
        };
    });
    
    return finalVisualItems;
  }
);
 