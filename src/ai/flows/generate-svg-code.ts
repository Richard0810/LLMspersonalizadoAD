'use server';
/**
 * @fileOverview A Genkit flow to generate SVG code based on a detailed guide.
 * The flow takes parameters for component type, subject, and content, and returns
 * a string of XML representing the SVG.
 *
 * - generateSvgFromGuide - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { SvgGenerationInputSchema, SvgGenerationOutputSchema, type SvgGenerationInput, type SvgGenerationOutput } from '@/types';


// The main function to be called from the server action
export async function generateSvgFromGuide(input: SvgGenerationInput): Promise<SvgGenerationOutput> {
  return generateSvgFromGuideFlow(input);
}

// Define the Genkit flow
const generateSvgFromGuideFlow = ai.defineFlow(
  {
    name: 'generateSvgFromGuideFlow',
    inputSchema: SvgGenerationInputSchema,
    outputSchema: SvgGenerationOutputSchema,
  },
  async (input) => {
    
    const prompt = `
      You are an expert SVG generator for educational materials. Your task is to create SVG code based on a strict guide.
      
      **Guide Rules:**
      1.  **SVG Structure:** Use '<svg viewBox="0 0 width height" xmlns="http://www.w3.org/2000/svg">...</svg>'.
      2.  **Color:** The main stroke and fill color MUST be the color provided in the 'color' parameter.
      3.  **Output:** You MUST return ONLY the raw SVG code as a valid XML string. Do not include any explanations, markdown, or anything else. The response must start with '<svg' and end with '</svg>'.
      4.  **Automatic Icon Generation:** For cards, you MUST automatically generate a simple, relevant icon based on the 'title' and 'content'. For example, if the title is 'Pregunta de Ciencias', a good icon would be a beaker (🧪) or an atom. If the title is 'Avanzar' and content is 'Avanza 3 pasos', a good icon would be three arrows or a boot with a number 3. You MUST generate this icon as a simple SVG <path> or <polygon> to represent it. The generated path/polygon should be filled with the main color and have a subtle opacity (e.g., fill-opacity="0.8"). The generated icon path must be centered within its group.
      5.  **Templates:** Adhere strictly to the requested component template.
      6.  **Empty Fields:** If 'title' or 'content' are empty or not provided, you MUST leave the corresponding text elements in the SVG empty. Do not use default text.

      **Generation Request:**
      - **Component Type:** ${input.componentType}
      - **Main Color:** ${input.color}
      - **Custom Title / Tema:** ${input.title || ''}
      - **Custom Content / Conceptos:** ${input.content || ''}

      **Templates to use:**

      **If Component Type is "carta_pregunta":**
      Use this template with a viewBox="0 0 200 280".
      - The main stroke and header fill color MUST be the custom color.
      - The header text should be the custom title, capitalized. If no title, leave it blank.
      - The main content area should contain the custom content. If no content, leave it blank.
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="${input.color}" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        <g transform="translate(100 85) scale(2.5)">
            <!-- ICON_AREA: Generate a centered path/polygon based on the title and content. For a question card, this could be a question mark, a magnifying glass, or something related to the subject. -->
        </g>
        <foreignObject x="25" y="140" width="150" height="80">
          <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 16px; color: #333; word-wrap: break-word; text-align: center; display: flex; justify-content: center; align-items: center; height: 100%;">
            ${input.content || ''}
          </p>
        </foreignObject>
        <rect x="15" y="245" width="170" height="25" fill="${input.color}" rx="5"/>
        <text x="100" y="262" text-anchor="middle" font-size="12" font-weight="bold" fill="white" font-family="Arial, sans-serif">Respuesta</text>
      </svg>
      \`\`\`

      **If Component Type is "carta_accion":**
      Use this template with a viewBox="0 0 200 280".
      - The main stroke and header fill color MUST be the custom color.
      - The header text should be the custom title, capitalized. If no title, leave it blank.
      - For the central icon, you MUST generate a relevant SVG path/polygon based on the 'title' and 'content' to represent the action.
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="${input.color}" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        
        <g transform="translate(100 85) scale(3)">
            <!-- ICON_AREA: Generate a centered path/polygon based on the title and content. E.g., for an arrow: <path d="M-5 -10 L0 -15 L5 -10 M0 -15 L0 5" stroke="${input.color}" stroke-width="2" fill="none"/> -->
        </g>

        <text x="100" y="180" text-anchor="middle" font-size="16" font-weight="bold" fill="#333" font-family="Arial, sans-serif">
            ${input.content || ''}
        </text>
      </svg>
      \`\`\`

      **If Component Type is "diagrama_generico":**
      - This is the most creative task. DO NOT use a fixed template.
      - You MUST generate a complete, custom SVG from scratch with a viewBox="0 0 400 300".
      - Analyze the 'Tema del Diagrama' (title) and 'Conceptos o Pasos Clave' (content).
      - Based on the content, decide the best type of diagram (flowchart, cycle, simple map).
      - Draw SVG shapes (<rect>, <circle>, <ellipse>, <path>) for nodes and steps.
      - Use SVG <text> elements to label the shapes with the provided concepts/steps.
      - Use SVG <path> or <line> elements with markers (arrows) to connect the shapes logically.
      - The entire diagram must be visually coherent and use the provided 'Main Color'.
      - For example, if content is "Inicio, Procesar, Decidir, Fin", create a flowchart with a start shape, two rectangles, a diamond, and an end shape, connected by arrows.

      Now, generate the SVG code. For the cards, dynamically generate the icon inside "<!-- ICON_AREA -->". For the generic diagram, build the entire SVG.
    `;

    const { text: svgCode } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
    });
    
    if (!svgCode) {
      throw new Error("La IA no pudo generar el código SVG.");
    }
    
    // Clean the output to ensure it's only the SVG code
    const cleanedSvgCode = svgCode.replace(/```xml|```/g, '').trim();

    return { svgCode: cleanedSvgCode };
  }
);
