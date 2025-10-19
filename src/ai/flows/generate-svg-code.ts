
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
    
    // Function to wrap text into multiple tspan elements
    const wrapText = (text: string, maxWidth: number, fontSize: number): string => {
        if (!text) return '';
        const words = text.split(' ');
        let currentLine = '';
        const lines: string[] = [];
        
        words.forEach(word => {
            // This is a rough estimation of text width. A real implementation would need a more accurate measurement.
            const estimatedLineLength = (currentLine + ' ' + word).length;
            if (estimatedLineLength > (maxWidth / (fontSize * 0.5))) { // Heuristic
                lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine = currentLine ? `${currentLine} ${word}` : word;
            }
        });
        if (currentLine) {
            lines.push(currentLine.trim());
        }

        return lines.map((line, index) => `<tspan x="100" dy="${index === 0 ? '0' : '1.2em'}">${line}</tspan>`).join('');
    };

    const contentTspans = wrapText(input.content || '', 180, 14);

    const prompt = `
      You are an expert SVG generator for educational materials. Your task is to create clean, compact, and valid SVG code.
      
      **Guide Rules (Non-Negotiable):**
      1.  **Output Format:** You MUST return ONLY the raw SVG code as a valid XML string. Do not include any explanations, markdown, or anything else. The response must start with '<svg' and end with '</svg>'.
      2.  **Color:** The main stroke, header fill, and icon fill color MUST be the color provided in the 'color' parameter: '${input.color}'.
      3.  **Templates:** Adhere strictly to the requested component template.
      4.  **Text Wrapping:** For card content, you MUST use multiple <tspan> elements to wrap text. Do NOT use <foreignObject>. The provided content has already been split for you. You MUST insert the following block directly: '${contentTspans}'.
      5.  **Icons (CRITICAL):**
          -   **\`carta_pregunta\`:** You MUST use the PREDEFINED question mark icon.
          -   **\`carta_accion\`:** You MUST generate a simple, relevant SVG <path> or <polygon> icon based on the title ('${input.title || ''}') and content ('${input.content || ''}').
          -   **If \`content\` is empty or missing, DO NOT generate an icon for \`carta_accion\`. The icon area should be left blank.**

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
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="196" height="276" fill="#fff" stroke="${input.color}" stroke-width="3" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="38" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        <g transform="translate(75, 75) scale(0.6)">
          <circle cx="50" cy="50" r="45" fill="${input.color}" stroke-width="0"/>
          <text x="50" y="72" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">?</text>
        </g>
        <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14px" fill="#333">
            ${contentTspans}
        </text>
      </svg>
      \`\`\`

      **If Component Type is "carta_accion":**
      Use this template with a viewBox="0 0 200 280".
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="196" height="276" fill="#fff" stroke="${input.color}" stroke-width="3" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="${input.color}" rx="8"/>
        <text x="100" y="38" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">${input.title?.toUpperCase() || ''}</text>
        <g transform="translate(100 115) scale(2.5)">
            <!-- ICON_AREA: Generate a centered path/polygon based on the title and content. If content is empty, leave this blank. -->
        </g>
        <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14px" fill="#333">
             ${contentTspans}
        </text>
      </svg>
      \`\`\`

      **If Component Type is "tabla_personalizada":**
      - Generate a complete, custom SVG from scratch.
      - Base viewBox="0 0 400 300".
      - Draw a grid of cells for ${input.numRows} rows and ${input.numCols} columns.
      - The header row MUST have a fill color of \`${input.color}\` and white text.
      - Use SVG <text> to place the '${input.headers}' (split by comma) into the header cells.
      - Remaining cells should be empty.

      Now, generate the SVG code.
    `;

    // A call to the model to generate the SVG code.
    // @ts-ignore
    const { text: svgCode } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
    });
    
    if (!svgCode) {
      throw new Error("La IA no pudo generar el código SVG.");
    }
    
    // Clean the output to ensure it's only the SVG code
    const cleanedSvgCode = svgCode.replace(/```(xml|svg)?|```/g, '').trim();

    return { svgCode: cleanedSvgCode };
  }
);
