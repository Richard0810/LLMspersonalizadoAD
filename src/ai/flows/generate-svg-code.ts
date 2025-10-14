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
      2.  **Color:** The main stroke, header fill, and icon fill color MUST be the color provided in the 'color' parameter.
      3.  **Output:** You MUST return ONLY the raw SVG code as a valid XML string. Do not include any explanations, markdown, or anything else. The response must start with '<svg' and end with '</svg>'.
      4.  **Automatic Icon Generation:** For the action card ('carta_accion'), you MUST automatically generate a simple, relevant icon based on the 'title' and 'content'. For example, if the title is 'Avanzar' and content is 'Avanza 3 pasos', a good icon would be three arrows or a boot with a number 3. You MUST generate this icon as a simple SVG <path> or <polygon> to represent it. The generated path/polygon should be filled with the main color and have a subtle opacity (e.g., fill-opacity="0.8"). The generated icon path must be centered within its group.
      5.  **Templates:** Adhere strictly to the requested component template.
      6.  **Empty Fields:** If a field is not provided, leave the corresponding SVG elements empty.
      7.  **Multi-line Text (CRITICAL):** The <foreignObject> tag is NOT allowed. For the main content text element in cards, if the text is long, you MUST simulate line breaks by using multiple <tspan> elements inside the <text> tag. Each <tspan> should have an x="100" and a 'dy' attribute (e.g., dy="1.2em") to create the line spacing.

      **Generation Request:**
      - **Component Type:** ${input.componentType}
      - **Main Color:** ${input.color}
      - **Title:** ${input.title || ''}
      - **Content:** ${input.content || ''}
      - **Rows:** ${input.numRows || ''}
      - **Columns:** ${input.numCols || ''}
      - **Headers:** ${input.headers || ''}

      **Templates to use:**

      **If Component Type is "carta_pregunta":**
      Use this template with a viewBox="0 0 200 280".
      - The main stroke and header fill color MUST be the custom color.
      - The header text should be the custom title, capitalized.
      - The main content area must use <text> and <tspan> for wrapping.
      - The icon is PREDEFINED. Do not generate a new one.
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="${input.color}" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="40" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        <g transform="translate(100 85) scale(2.5)">
            <path d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,20 C7.581722,20 4,16.418278 4,12 C4,7.581722 7.581722,4 12,4 C16.418278,4 20,7.581722 20,12 C20,16.418278 16.418278,20 12,20 Z M12,17 C11.4477153,17 11,17.4477153 11,18 C11,18.5522847 11.4477153,19 12,19 C12.5522847,19 13,18.5522847 13,18 C13,17.4477153 12.5522847,17 12,17 Z M12,6 C9.790861,6 8,7.790861 8,10 C8,10.5522847 8.44771525,11 9,11 C9.55228475,11 10,10.5522847 10,10 C10,8.8954305 10.8954305,8 12,8 C13.1045695,8 14,8.8954305 14,10 C14,11.6568542 12,12.5 12,14 C12,14.5522847 12.4477153,15 13,15 C13.5522847,15 14,14.5522847 14,14 C14,12.0160411 16,11.082538 16,10 C16,7.790861 14.209139,6 12,6 Z" fill="${input.color}" fill-opacity="0.8" transform="translate(-12, -12)"></path>
        </g>
        <text x="100" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="16px" fill="#333">
            <!-- CONTENT_AREA: Use <tspan x="100" dy="1.2em"> for each line of wrapped text. -->
        </text>
        <rect x="15" y="245" width="170" height="25" fill="${input.color}" rx="5"/>
        <text x="100" y="262" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="bold" fill="white" font-family="Arial, sans-serif">Respuesta</text>
      </svg>
      \`\`\`

      **If Component Type is "carta_accion":**
      Use this template with a viewBox="0 0 200 280".
      - Main stroke and header fill must be the custom color.
      - Header text is the custom title, capitalized.
      - Generate a relevant SVG path/polygon for the icon.
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="${input.color}" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="40" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        <g transform="translate(100 100) scale(3)">
            <!-- ICON_AREA: Generate a centered path/polygon based on the title and content. -->
        </g>
        <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16px" fill="#333">
            <!-- CONTENT_AREA: Use <tspan x="100" dy="1.2em"> for each line of wrapped text. -->
        </text>
      </svg>
      \`\`\`

      **If Component Type is "tabla_personalizada":**
      - This is a creative task. DO NOT use a fixed template.
      - You MUST generate a complete, custom SVG from scratch.
      - The overall SVG size should be responsive, but a good base is a viewBox="0 0 400 300".
      - Analyze the number of rows, columns, and the provided headers.
      - Draw a grid of cells using SVG <rect> and <line> elements.
      - The header row MUST have a fill color matching the 'Main Color' and white text.
      - Use SVG <text> elements to place the provided 'Headers' (split by comma) into the header cells. Center the text.
      - The remaining cells should be empty (white background, colored stroke).
      - The entire table must be visually coherent and use the provided 'Main Color' for all strokes and the header fill.

      Now, generate the SVG code. For the cards, dynamically generate the icon inside "<!-- ICON_AREA -->" and the content inside "<!-- CONTENT_AREA -->". For the table, build the entire SVG.
    `;

    // A call to the model to generate the SVG code.
    const { text: svgCode } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
    });
    
    if (!svgCode) {
      throw new Error("La IA no pudo generar el código SVG.");
    }
    
    // Clean the output to ensure it's only the SVG code
    const cleanedSvgCode = svgCode.replace(/```xml|```/g, '').trim();

    let finalSvg = cleanedSvgCode;

    // This logic is a fallback. The AI is now instructed to do this itself.
    if ((input.componentType === 'carta_pregunta' || input.componentType === 'carta_accion') && input.content) {
        const contentLines = (input.content || '').split(' ');
        let tspans = '';
        let currentLine = '';
        
        for (const word of contentLines) {
            if ((currentLine + word).length > 20) { // Simple line break logic
                tspans += `<tspan x="100" dy="1.2em">${currentLine}</tspan>`;
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }
        if (currentLine) {
            tspans += `<tspan x="100" dy="1.2em">${currentLine.trim()}</tspan>`;
        }
        
        if (tspans) {
           finalSvg = finalSvg.replace('<!-- CONTENT_AREA: Use <tspan x="100" dy="1.2em"> for each line of wrapped text. -->', tspans.replace(' dy="1.2em"', ''));
        }
    }


    return { svgCode: finalSvg };
  }
);
