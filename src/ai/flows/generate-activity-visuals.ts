
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
        const { media } = await ai.generate({
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

**CRITICAL RULES:**
1.  You MUST process EACH item from the input string, which is separated by newlines.
2.  If an item is a main header for sub-items (e.g., "Tarjetas de 'Instrucción':" followed by "Título: INSTRUCCIÓN..."), you MUST process each sub-item individually.
3.  For each item/sub-item, you MUST generate a corresponding object in the output array. This object MUST contain:
    *   'text': The original, unmodified text of the resource item.
    *   'htmlContent': A self-contained HTML block styled with Tailwind CSS.
        *   For items that are HEADERS (like "Tarjetas de acción rítmica:"), you MUST generate an HTML block that styles it as a title (e.g., \`<h4 class="text-2xl font-bold text-primary mb-4 border-b-2 pb-2">Tarjetas de acción rítmica:</h4>\`).
        *   For items that are visual components (like cards), generate the full card HTML.
        *   If the resource is simple text that doesn't need a visual component (like "Un lápiz" or a coded message), this MUST be null.
    *   'imagePrompt': A detailed text-to-image prompt. This field is CRUCIAL. It MUST be null for most items. Only generate a prompt string if the resource explicitly describes a physical, visual item to be drawn or created by the teacher (e.g., "Dibuja un tablero con 20 casillas", "Crea un mapa del tesoro en una cartulina"). For abstract items like "Tarjeta de Acción: Sumar", text-based content, or section headers, the 'imagePrompt' MUST be null.

**HTML & STYLING REQUIREMENTS ('htmlContent'):**
*   The output MUST be a single, self-contained block of HTML, starting with a \`<div>\` for cards or \`<h4>\` for headers.
*   Use Tailwind CSS classes ONLY. DO NOT use inline \`<style>\` tags.
*   **Card Design**: Create a vertical card. Use classes like \`border\`, \`rounded-lg\`, \`shadow-lg\`, \`w-full\`, \`max-w-xs\`, \`mx-auto\`, \`bg-card\`, \`font-sans\`, \`overflow-hidden\`.
*   **Visual Hierarchy**:
    *   **Header**: The card must start with a header div with a background color (\`bg-primary\`, \`p-3\`).
    *   **Main Title**: Inside the header, use an \`h3\` with \`text-xl\`, \`font-bold\`, \`text-primary-foreground\`, \`text-center\`, \`uppercase\`.
    *   **Content Body**: The main content area should have padding (\`p-6\`).
    *   **Symbol/Icon**: This is the visual anchor. Place it after the header. It must be in a \`div\`, centered (\`text-center\`), and large (\`text-6xl\`). Give it some space (\`my-4\`). Use unicode characters for symbols where possible.
    *   **Separator**: After the icon, add a horizontal rule (\`<hr class="border-border">\`).
    *   **Text Details**: The text content (Action, Description) should be in a div with spacing (\`mt-4 space-y-2\`). Labels like "Acción:" MUST be wrapped in \`<strong>\` tags and have a distinct color (\`text-foreground\`). The rest of the text should use \`text-muted-foreground\`.
*   **For tables**: If the resource describes a "tabla", you MUST generate a valid HTML \`<table>\` with Tailwind classes (\`w-full\`, \`border-collapse\`), and style the header (\`bg-gray-100\`).
*   **CRITICAL EXAMPLE**: For a card like "Título: PALMADA, Acción: Dar una palmada., Descripción: Golpear las palmas de las manos., Símbolo: 👏", the HTML MUST look like this:
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
          <p><strong class="text-foreground">Descripción:</strong> <span class="text-muted-foreground">Golpear las palmas de las manos.</span></p>
        </div>
      </div>
    </div>
    \`\`\`
*   **CRITICAL EXAMPLE FOR NESTED ITEMS**: For an input like "Tarjetas con símbolos:\n- Triángulo (amarillo): Representa datos de entrada.\n- Cuadrado (azul): Representa un proceso.", you MUST process "Triángulo" and "Cuadrado" as separate items and generate two separate HTML card blocks.

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
            imageAlt: imageResult ? imageResult.altText : null,
        };
    });
    
    return finalVisualItems;
  }
);
 
    

