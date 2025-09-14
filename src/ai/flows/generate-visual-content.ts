
'use server';
/**
 * @fileOverview Genkit flow for generating various visual content types.
 * - generateVisualContent: Main exported function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  GenerateVisualContentFlowInput,
  GenerateVisualContentFlowOutput,
  ImageGenerationParams,
  InfoOrgParams,
  ConceptIllustParams,
  VisualCategory,
  VisualFormat
} from '@/types';

// Internal Zod schemas for validation within the flow.
// These should match the types in src/types/index.ts

const ImageGenerationParamsSchema = z.object({
  theme: z.string().optional(),
  prompt: z.string().min(1),
  artStyle: z.string().optional(),
  artType: z.string().optional(),
  artistInspired: z.string().optional(),
  attributes: z.string().optional(),
  lighting: z.string().optional(),
  composition: z.string().optional(),
  quality: z.string().optional(),
  negativePrompt: z.string().optional(),
  aspectRatio: z.string().optional(),
  numImages: z.number().optional(),
});

const InfoOrgParamsSchema = z.object({
  theme: z.string().optional(),
  topic: z.string().min(1),
  level: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  details: z.string().optional(),
  outputStructure: z.string().optional(),
});

const ConceptIllustParamsSchema = z.object({
  theme: z.string().optional(),
  concept: z.string().min(1),
  visualStyle: z.string(),
  specificElements: z.string().optional(),
});

const FlowInputSchema = z.object({
  category: z.nativeEnum(VisualCategory),
  format: z.nativeEnum(VisualFormat),
  translatedFormatName: z.string(),
  params: z.union([
    ImageGenerationParamsSchema,
    InfoOrgParamsSchema,
    ConceptIllustParamsSchema,
  ]),
  isPreview: z.boolean().optional(),
});

const GeneratedImageSchema = z.object({
  type: z.literal('image'),
  url: z.string(),
  alt: z.string(),
});

// Define other output schemas similarly...
const GeneratedHtmlSchema = z.object({
    type: z.literal('html'),
    content: z.string(),
    title: z.string().optional(),
});

// Schemas for AI output (without the 'type' literal)
const ConceptMapDataContentSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['principal', 'concepto', 'conector']), position: z.object({ top: z.number(), left: z.number() }) })),
    connections: z.array(z.object({ from: z.string(), to: z.string() })),
});
const MindMapDataContentSchema = z.object({
    title: z.string(),
    branches: z.array(z.object({ id: z.string(), title: z.string(), children: z.array(z.string()), position: z.object({ top: z.string(), left: z.string() }) })),
});
const FlowchartDataContentSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['start-end', 'process', 'decision']), position: z.object({ top: z.number(), left: z.number() }) })),
    connections: z.array(z.object({ from: z.string(), to: z.string() })),
});
const VennDiagramDataContentSchema = z.object({
    title: z.string(),
    circleA: z.object({ label: z.string(), items: z.array(z.string()) }),
    circleB: z.object({ label: z.string(), items: z.array(z.string()) }),
    intersection: z.object({ label: z.string().optional(), items: z.array(z.string()) }),
});
const ComparisonTableDataContentSchema = z.object({
    title: z.string(),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
});
const TimelineDataContentSchema = z.object({
    title: z.string(),
    events: z.array(z.object({ date: z.string(), title: z.string(), description: z.string() })),
});

// Full schemas for final output (with the 'type' literal)
const GeneratedConceptMapDataSchema = ConceptMapDataContentSchema.extend({ type: z.literal('concept-map-data') });
const GeneratedMindMapDataSchema = MindMapDataContentSchema.extend({ type: z.literal('mind-map-data') });
const GeneratedFlowchartDataSchema = FlowchartDataContentSchema.extend({ type: z.literal('flowchart-data') });
const GeneratedVennDiagramDataSchema = VennDiagramDataContentSchema.extend({ type: z.literal('venn-diagram-data') });
const GeneratedComparisonTableDataSchema = ComparisonTableDataContentSchema.extend({ type: z.literal('comparison-table-data') });
const GeneratedTimelineDataSchema = TimelineDataContentSchema.extend({ type: z.literal('timeline-data') });


const FlowOutputSchema = z.discriminatedUnion("type", [
  GeneratedImageSchema,
  GeneratedHtmlSchema,
  GeneratedConceptMapDataSchema,
  GeneratedMindMapDataSchema,
  GeneratedFlowchartDataSchema,
  GeneratedVennDiagramDataSchema,
  GeneratedComparisonTableDataSchema,
  GeneratedTimelineDataSchema,
]);

export async function generateVisualContent(input: GenerateVisualContentFlowInput): Promise<GenerateVisualContentFlowOutput> {
  const validatedInput = FlowInputSchema.parse(input);
  return generateVisualContentFlow(validatedInput);
}

function buildImagePrompt(params: ImageGenerationParams): string {
    let fullPrompt = params.prompt;
    if (params.artStyle && params.artStyle !== "Ninguno") fullPrompt += `, en el estilo de ${params.artStyle}`;
    if (params.artType && params.artType !== "Ninguno") fullPrompt += `, como un/a ${params.artType}`;
    if (params.negativePrompt) fullPrompt += `. Evita: ${params.negativePrompt}`;
    if (params.aspectRatio) fullPrompt += `, relación de aspecto: ${params.aspectRatio}`;
    return fullPrompt;
}

const generateVisualContentFlow = ai.defineFlow(
  {
    name: 'generateVisualContentFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FlowOutputSchema,
  },
  async (input) => {
    const { category, format, translatedFormatName, params } = input;

    if (category === VisualCategory.IMAGE_GENERATION || (category === VisualCategory.CONCEPT_ILLUSTRATION && (format === VisualFormat.PHOTO_REALISTIC || format === VisualFormat.ILLUSTRATION_CONCEPT))) {
        let imgParams: ImageGenerationParams;
        if (category === VisualCategory.CONCEPT_ILLUSTRATION) {
            const p = params as ConceptIllustParams;
            imgParams = { prompt: `Un/a ${p.visualStyle} de "${p.concept}". ${p.specificElements || ''}`, theme: p.theme };
        } else {
            imgParams = params as ImageGenerationParams;
        }

        const fullPrompt = buildImagePrompt(imgParams);
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: fullPrompt,
            config: {
                // @ts-ignore
                responseModalities: ['TEXT', 'IMAGE'],
            }
        });

        if (media?.url) {
            return {
                type: 'image',
                url: media.url,
                alt: imgParams.prompt.substring(0, 100),
            };
        }
        throw new Error("Image generation failed.");
    }

    if (category === VisualCategory.INFO_ORGANIZATION) {
        const { topic, level, details } = params as InfoOrgParams;
        
        // This is a simplified version. A real implementation would have detailed prompts per format.
        const structuredContentPrompt = `Genera un resumen DETALLADO y JERÁRQUICO para el tema '${topic}'. Organiza los puntos principales y sub-puntos de forma lógica. El nivel de detalle debe ser ${level}. Detalles adicionales: ${details}`;
        const { text: structuredContent } = await ai.generate({ prompt: structuredContentPrompt });
        if(!structuredContent) throw new Error("Could not generate base content.");

        let finalPrompt = '';
        let outputSchema: z.ZodSchema<any>;
        let outputTypeLiteral: GeneratedContentType['type'] | null = null;

        switch(format) {
            case VisualFormat.CONCEPT_MAP:
                finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para un mapa conceptual. El JSON debe tener 'title', 'nodes' (con id, label, type, position) y 'connections' (con from, to).\n\nTexto: ${structuredContent}`;
                outputSchema = ConceptMapDataContentSchema;
                outputTypeLiteral = 'concept-map-data';
                break;
            case VisualFormat.MIND_MAP:
                finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para un mapa mental. El JSON debe tener 'title' y 'branches' (con id, title, children, position).\n\nTexto: ${structuredContent}`;
                outputSchema = MindMapDataContentSchema;
                outputTypeLiteral = 'mind-map-data';
                break;
            case VisualFormat.FLOW_CHART:
                finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para un diagrama de flujo. El JSON debe tener 'title', 'nodes' (con id, label, type, position) y 'connections' (con from, to).\n\nTexto: ${structuredContent}`;
                outputSchema = FlowchartDataContentSchema;
                outputTypeLiteral = 'flowchart-data';
                break;
            case VisualFormat.VENN_DIAGRAM:
                 finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para un diagrama de Venn. El JSON debe tener 'title', 'circleA' (label, items), 'circleB' (label, items) y 'intersection' (items).\n\nTexto: ${structuredContent}`;
                 outputSchema = VennDiagramDataContentSchema;
                 outputTypeLiteral = 'venn-diagram-data';
                 break;
            case VisualFormat.COMPARISON_TABLE:
                finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para una tabla comparativa. El JSON debe tener 'title', 'headers' (array de strings) y 'rows' (array de arrays de strings).\n\nTexto: ${structuredContent}`;
                outputSchema = ComparisonTableDataContentSchema;
                outputTypeLiteral = 'comparison-table-data';
                break;
            case VisualFormat.TIMELINE:
                finalPrompt = `Basado en el siguiente texto, crea una estructura JSON para una línea de tiempo. El JSON debe tener 'title' y un array de 'events' (con date, title, description).\n\nTexto: ${structuredContent}`;
                outputSchema = TimelineDataContentSchema;
                outputTypeLiteral = 'timeline-data';
                break;
            default: // Infographic, etc.
                 finalPrompt = `Crea un código HTML5 auto-contenido y con estilos para una infografía sobre el tema '${topic}', basado en el siguiente texto. El HTML debe ser atractivo visualmente.\n\nTexto: ${structuredContent}`;
                 outputSchema = GeneratedHtmlSchema.omit({ type: true }); // Omit type for HTML generation too
                 outputTypeLiteral = 'html';
                 break;
        }

        const { output } = await ai.generate({
          prompt: finalPrompt,
          output: { schema: outputSchema }
        });

        if (output) {
          if (outputTypeLiteral) {
            // Re-add the 'type' field before returning
            return { ...output, type: outputTypeLiteral };
          }
          return output as GenerateVisualContentFlowOutput;
        }
    }
    
    throw new Error(`The combination of category '${category}' and format '${format}' is not implemented.`);
  }
);

    