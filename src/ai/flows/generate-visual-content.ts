'use server';
/**
 * @fileOverview Genkit flow for generating various visual content types.
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

const GeneratedHtmlSchema = z.object({
    type: z.literal('html'),
    content: z.string(),
    title: z.string().optional(),
});

const ConceptMapDataContentSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({ 
        id: z.string(), 
        label: z.string(), 
        type: z.enum(['principal', 'concepto', 'conector']), 
        position: z.object({ top: number(), left: z.number() }) 
    })),
    connections: z.array(z.object({ from: z.string(), to: z.string() })),
});

const MindMapDataContentSchema = z.object({
    title: z.string(),
    branches: z.array(z.object({
        id: z.string(),
        title: z.string(),
        children: z.array(z.string()),
        position: z.object({
            top: z.string(),
            left: z.string()
        })
    })),
});

const FlowchartDataContentSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({ 
        id: z.string(), 
        label: z.string(), 
        type: z.enum(['start-end', 'process', 'decision']), 
        position: z.object({ top: number(), left: z.number() }) 
    })),
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
    events: z.array(z.object({ 
        date: z.string(), 
        title: z.string(), 
        description: z.string() 
    })),
});

const GeneratedConceptMapDataSchema = ConceptMapDataContentSchema.extend({ 
    type: z.literal('concept-map-data') 
});
const GeneratedMindMapDataSchema = MindMapDataContentSchema.extend({ 
    type: z.literal('mind-map-data') 
});
const GeneratedFlowchartDataSchema = FlowchartDataContentSchema.extend({ 
    type: z.literal('flowchart-data') 
});
const GeneratedVennDiagramDataSchema = VennDiagramDataContentSchema.extend({ 
    type: z.literal('venn-diagram-data') 
});
const GeneratedComparisonTableDataSchema = ComparisonTableDataContentSchema.extend({ 
    type: z.literal('comparison-table-data') 
});
const GeneratedTimelineDataSchema = TimelineDataContentSchema.extend({ 
    type: z.literal('timeline-data') 
});

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

export async function generateVisualContent(
    input: GenerateVisualContentFlowInput
): Promise<GenerateVisualContentFlowOutput> {
  const validatedInput = FlowInputSchema.parse(input);
  return generateVisualContentFlow(validatedInput);
}

function buildImagePrompt(params: ImageGenerationParams): string {
    let fullPrompt = params.prompt;
    if (params.artStyle && params.artStyle !== "Ninguno") fullPrompt += `, en el estilo de ${params.artStyle}`;
    if (params.artType && params.artType !== "Ninguno") fullPrompt += `, como un/a ${params.artType}`;
    if (params.theme) fullPrompt += `. El tema general está relacionado con: ${params.theme}.`;
    return fullPrompt;
}

function isImageGenerationParams(params: any): params is ImageGenerationParams {
    return params && typeof params.prompt === 'string';
}

function isInfoOrgParams(params: any): params is InfoOrgParams {
    return params && typeof params.topic === 'string';
}

function isConceptIllustParams(params: any): params is ConceptIllustParams {
    return params && typeof params.concept === 'string';
}

async function generateImageAndAltText(prompt: string): Promise<{ imageUrl: string, altText: string }> {
    const fullPrompt = `Educational illustration, simple, clean, minimalist, whiteboard drawing style: ${prompt}`;
    const altText = prompt.substring(0, 150);

    try {
        const { media } = await ai.generate({
            model: 'googleai/imagen-3.0-generate-002',
            prompt: fullPrompt,
        });
        
        if (media && media.url) {
            return { imageUrl: media.url, altText };
        }
        return { imageUrl: '', altText: 'La generación de imagen no devolvió un resultado.' };
    } catch (error) {
        console.error(`AI image generation failed for prompt: "${prompt}". Error:`, error);
        return { imageUrl: '', altText: `Error al generar la guía visual.` };
    }
};

const generateVisualContentFlow = ai.defineFlow(
  {
    name: 'generateVisualContentFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FlowOutputSchema,
  },
  async (input) => {
    const { category, format, params } = input;

    if (category === VisualCategory.IMAGE_GENERATION || category === VisualCategory.CONCEPT_ILLUSTRATION) {
        let imgParams: ImageGenerationParams;
        if (category === VisualCategory.CONCEPT_ILLUSTRATION) {
            if (!isConceptIllustParams(params)) throw new Error("Parámetros inválidos");
            imgParams = { prompt: `Un/a ${params.visualStyle} de "${params.concept}". ${params.specificElements || ''}` };
        } else {
            if (!isImageGenerationParams(params)) throw new Error("Parámetros inválidos");
            imgParams = params as ImageGenerationParams;
        }
        const { imageUrl, altText } = await generateImageAndAltText(buildImagePrompt(imgParams));
        if (!imageUrl) throw new Error(altText);
        return { type: 'image', url: imageUrl, alt: altText };
    }

    if (category === VisualCategory.INFO_ORGANIZATION) {
        if (!isInfoOrgParams(params)) throw new Error("Invalid parameters");
        const { text: structuredContent } = await ai.generate({ 
            model: 'googleai/gemini-2.5-flash', 
            prompt: `Genera un resumen para '${params.topic}'.` 
        });
        
        if (!structuredContent) throw new Error("No se pudo generar el contenido base.");

        let finalPrompt = `Genera un JSON para ${format} basado en: ${structuredContent}`;
        let outputSchema: z.ZodSchema<any> = z.any();
        
        switch(format) {
            case VisualFormat.CONCEPT_MAP: outputSchema = ConceptMapDataContentSchema; break;
            case VisualFormat.MIND_MAP: outputSchema = MindMapDataContentSchema; break;
            case VisualFormat.FLOW_CHART: outputSchema = FlowchartDataContentSchema; break;
            case VisualFormat.VENN_DIAGRAM: outputSchema = VennDiagramDataContentSchema; break;
            case VisualFormat.COMPARISON_TABLE: outputSchema = ComparisonTableDataContentSchema; break;
            case VisualFormat.TIMELINE: outputSchema = TimelineDataContentSchema; break;
            default: outputSchema = z.object({ content: z.string() }); break;
        }

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: finalPrompt,
            output: { 
              schema: outputSchema,
              format: 'json'
            }
        });

        if (!output) throw new Error("El modelo no pudo estructurar los datos correctamente. Intenta de nuevo.");
        return { ...(output as any), type: format === VisualFormat.INFOGRAPHIC ? 'html' : `${format}-data` };
    }
    
    throw new Error(`Not implemented.`);
  }
);
