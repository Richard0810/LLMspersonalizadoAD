
'use server';
/**
 * @fileOverview A Genkit flow to generate SVG code based on a detailed guide.
 * The flow takes parameters for component type, subject, and content, and returns
 * a string of XML representing the SVG.
 *
 * - generateSvgFromGuide - The main exported function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas based on the provided guide
const SvgComponentTypeSchema = z.enum([
    'carta_pregunta', 
    'carta_accion', 
    'diagrama_ciclo_agua',
    'diagrama_flujo_simple',
]);

export const SvgGenerationInputSchema = z.object({
  componentType: SvgComponentTypeSchema.describe('The type of SVG component to generate.'),
  subject: z.enum(['matematicas', 'ciencias', 'lenguaje', 'historia', 'geografia', 'arte', 'deportes']).describe('The subject, which defines the color scheme.'),
  title: z.string().optional().describe('A custom title for the component.'),
  content: z.string().optional().describe('Custom content for the component (e.g., the question text).'),
});

const SvgGenerationOutputSchema = z.object({
  svgCode: z.string().describe('The generated SVG code as an XML string.'),
});

export type SvgGenerationInput = z.infer<typeof SvgGenerationInputSchema>;
export type SvgGenerationOutput = z.infer<typeof SvgGenerationOutputSchema>;

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
      2.  **Color Palette by Subject:**
          - matematicas: #e74c3c
          - ciencias: #28a745
          - lenguaje: #17a2b8
          - historia: #ffc107
          - geografia: #6f42c1
          - arte: #fd7e14
          - deportes: #20c997
      3.  **Output:** You MUST return ONLY the raw SVG code as a valid XML string. Do not include any explanations, markdown, or anything else. The response must start with '<svg' and end with '</svg>'.
      4.  **Templates:** Adhere strictly to the requested component template.

      **Generation Request:**
      - **Component Type:** ${input.componentType}
      - **Subject:** ${input.subject}
      - **Custom Title:** ${input.title || 'Título por Defecto'}
      - **Custom Content:** ${input.content || 'Contenido de ejemplo...'}

      **Templates to use:**

      **If Component Type is "carta_pregunta":**
      Use this template with a viewBox="0 0 200 280".
      - The main stroke and header fill color MUST be the color for the specified subject.
      - The header text should be the custom title, capitalized.
      - The main content area should contain the custom content.
      - Use font-family="Arial, sans-serif".
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="[SUBJECT_COLOR]" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="[SUBJECT_COLOR]" rx="8"/>
        <text x="100" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">[CUSTOM_TITLE_UPPERCASE]</text>
        <foreignObject x="25" y="70" width="150" height="150">
          <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 14px; color: #333; word-wrap: break-word;">
            [CUSTOM_CONTENT]
          </p>
        </foreignObject>
        <rect x="15" y="245" width="170" height="25" fill="[SUBJECT_COLOR]" rx="5"/>
        <text x="100" y="262" text-anchor="middle" font-size="12" font-weight="bold" fill="white" font-family="Arial, sans-serif">Respuesta</text>
      </svg>
      \`\`\`

      **If Component Type is "carta_accion":**
      Use this template with a viewBox="0 0 200 280".
      - The main stroke and header fill color MUST be the color for the specified subject.
      - The header text should be the custom title, capitalized.
      - The central icon should use a lighter version of the subject color.
      \`\`\`xml
      <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="280" fill="#fff" stroke="[SUBJECT_COLOR]" stroke-width="4" rx="15"/>
        <rect x="15" y="15" width="170" height="40" fill="[SUBJECT_COLOR]" rx="8"/>
        <text x="100" y="40" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="Arial, sans-serif">[CUSTOM_TITLE_UPPERCASE]</text>
        <circle cx="100" cy="110" r="40" fill="[SUBJECT_COLOR]" fill-opacity="0.1" stroke="[SUBJECT_COLOR]" stroke-width="2"/>
        <path d="M90 100 L110 120 M110 100 L90 120" stroke="[SUBJECT_COLOR]" stroke-width="4" stroke-linecap="round" />
        <foreignObject x="25" y="170" width="150" height="100">
            <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center;">
              [CUSTOM_CONTENT]
            </p>
        </foreignObject>
      </svg>
      \`\`\`
      
      **If Component Type is "diagrama_ciclo_agua":**
      Generate a simple water cycle diagram with a viewBox="0 0 400 300". Use "ciencias" color scheme. Ignore custom title and content.
       \`\`\`xml
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="400" height="300" fill="#e0f7fa" />
          
          <path d="M0 250 C 100 230, 200 260, 400 240 L 400 300 L 0 300 Z" fill="#4dd0e1" />
          <text x="50" y="270" font-family="Arial, sans-serif" font-size="14" fill="#006064">OCÉANO</text>

          <circle cx="350" cy="50" r="30" fill="#ffeb3b" />

          <g id="evaporation">
              <path d="M100,230 C 110 200, 120 180, 130 160" stroke="#00bcd4" stroke-width="2" fill="none" stroke-dasharray="4 4" />
              <path d="M120,240 C 130 210, 140 190, 150 170" stroke="#00bcd4" stroke-width="2" fill="none" stroke-dasharray="4 4" />
              <text x="70" y="200" font-family="Arial, sans-serif" font-size="12" fill="#00796b" transform="rotate(-30, 70, 200)">Evaporación</text>
          </g>
          
          <g id="condensation">
              <ellipse cx="200" cy="100" rx="40" ry="25" fill="#fff" />
              <ellipse cx="230" cy="95" rx="30" ry="20" fill="#fff" />
              <text x="190" y="80" font-family="Arial, sans-serif" font-size="12" fill="#00796b">Condensación</text>
          </g>
          
          <g id="precipitation">
              <line x1="210" y1="120" x2="205" y2="140" stroke="#2196f3" stroke-width="2" />
              <line x1="220" y1="125" x2="215" y2="145" stroke="#2196f3" stroke-width="2" />
              <line x1="230" y1="120" x2="225" y2="140" stroke="#2196f3" stroke-width="2" />
              <text x="230" y="140" font-family="Arial, sans-serif" font-size="12" fill="#00796b">Precipitación</text>
          </g>

          <polygon points="300,240 380,150 400,240" fill="#8d6e63" />
      </svg>
      \`\`\`
       **If Component Type is "diagrama_flujo_simple":**
      Generate a simple flowchart with a viewBox="0 0 400 300". Use a neutral color scheme. Use the custom title.
      \`\`\`xml
       <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333"/></marker>
          </defs>
          <rect x="0" y="0" width="400" height="300" fill="#f8f9fa" />
          <text x="200" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="Arial, sans-serif">[CUSTOM_TITLE]</text>

          <ellipse cx="200" cy="70" rx="50" ry="20" fill="#d4edda" stroke="#28a745" stroke-width="2" />
          <text x="200" y="75" text-anchor="middle" font-family="Arial, sans-serif" font-size="12">Inicio</text>
          
          <line x1="200" y1="90" x2="200" y2="120" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
          
          <rect x="140" y="120" width="120" height="40" fill="#d1ecf1" stroke="#17a2b8" stroke-width="2" rx="5" />
          <text x="200" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="12">Primer Paso</text>

          <line x1="200" y1="160" x2="200" y2="190" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>

          <polygon points="200,190 150,215 200,240 250,215" fill="#fff3cd" stroke="#ffc107" stroke-width="2" />
          <text x="200" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12">¿Decisión?</text>

          <ellipse cx="200" cy="270" rx="50" ry="20" fill="#f8d7da" stroke="#dc3545" stroke-width="2" />
          <text x="200" y="275" text-anchor="middle" font-family="Arial, sans-serif" font-size="12">Fin</text>
      </svg>
      \`\`\`

      Now, generate the SVG code for the requested component.
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
