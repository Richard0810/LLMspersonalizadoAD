
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
  VisualFormat,
  GeneratedContentType
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
    if (params.artistInspired) fullPrompt += `, inspirado por ${params.artistInspired}`;
    if (params.attributes) fullPrompt += `, con atributos: ${params.attributes}`;
    if (params.lighting) fullPrompt += `, iluminación: ${params.lighting}`;
    if (params.composition) fullPrompt += `, composición: ${params.composition}`;
    if (params.quality) fullPrompt += `, calidad: ${params.quality}`;
    if (params.aspectRatio) fullPrompt += `, relación de aspecto: ${params.aspectRatio}`;
    if (params.negativePrompt) fullPrompt += `. Evita: ${params.negativePrompt}`;
    if (params.theme) fullPrompt += `. El tema general está relacionado con: ${params.theme}.`;

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

    // Handle single-step image generation categories
    if (category === VisualCategory.IMAGE_GENERATION || category === VisualCategory.CONCEPT_ILLUSTRATION) {
        let imgParams: ImageGenerationParams;

        if (category === VisualCategory.CONCEPT_ILLUSTRATION) {
            const p = params as ConceptIllustParams;
            const visualStyle = format === VisualFormat.PHOTO_REALISTIC ? 'Fotorrealista' : p.visualStyle;
            imgParams = { 
                prompt: `Un/a ${visualStyle} de "${p.concept}". ${p.specificElements || ''}`, 
                theme: p.theme 
            };
        } else {
            imgParams = params as ImageGenerationParams;
        }

        const fullPrompt = buildImagePrompt(imgParams);
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: fullPrompt,
        });
        
        if (!media) throw new Error("Image generation failed to return media.");

        const { text: altText } = await ai.generate({
            model: 'gemini',
            prompt: `Genera un texto alternativo (alt text) corto y descriptivo en español para esta imagen. El prompt original era: "${fullPrompt}".`,
            input: { media: { url: media.url } },
        });

        if (media?.url) {
            return {
                type: 'image',
                url: media.url,
                alt: altText || imgParams.prompt.substring(0, 100),
            };
        }
        throw new Error("Image generation failed.");
    }

    // Handle multi-step information organization category
    if (category === VisualCategory.INFO_ORGANIZATION) {
        const infoParams = params as InfoOrgParams;
        const { topic, level, details } = infoParams;
        
        let lengthInstruction: 'corta' | 'media' | 'larga' = 'media';
        if (level === 'basic') lengthInstruction = 'corta';
        if (level === 'advanced') lengthInstruction = 'larga';

        // STEP 1: Generate structured content ("Source of Truth")
        const structuredContentPrompt = `Genera un resumen DETALLADO y JERÁRQUICO para el tema '${topic}'. La longitud debe ser ${lengthInstruction}. Organiza los puntos principales y sub-puntos de forma lógica. Este resumen será la base para construir un diagrama visual. Detalles adicionales: ${details}`;
        
        const { text: structuredContent } = await ai.generate({ model: 'gemini', prompt: structuredContentPrompt });
        if(!structuredContent) throw new Error("Could not generate base content for the diagram.");

        // STEP 2: Use the structured content to generate the final JSON/HTML
        let finalPrompt = '';
        let outputSchema: z.ZodSchema<any> | undefined = undefined;
        let outputTypeLiteral: GeneratedContentType['type'] | null = null;

        const topicOrConcept = infoParams.topic;
        const finalPromptParams = { topicOrConcept, level, structuredContent, translatedFormatName };
        
        switch(format) {
            case VisualFormat.CONCEPT_MAP:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa conceptual interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del mapa es: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

A partir de este contenido, DEBES generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una estructura de datos simple con 5-7 nodos en total (1 principal, 2-3 conceptos, 2-3 conectores).
- **Si el nivel es 'intermediate':** Genera una estructura más detallada con 8-12 nodos, incluyendo algunas ramas secundarias.
- **Si el nivel es 'advanced':** Genera más de 12 nodos, múltiples niveles de jerarquía y, si es relevante, relaciones cruzadas.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **IDs Únicos:** A cada nodo asígnale un "id" único y descriptivo (ej: "nodo-fotosintesis").
2.  **Posiciones CSS:** Para CADA nodo, genera una posición inicial ("top", "left") en píxeles en un lienzo de 1200x800px.
3.  **Tipos de Nodo:** Asigna el "type" correcto: 'principal', 'concepto', o 'conector'.
4.  **Conexiones:** En el array "connections", define las relaciones entre tus nodos usando sus IDs.
5.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = ConceptMapDataContentSchema;
                outputTypeLiteral = 'concept-map-data';
                break;
            case VisualFormat.MIND_MAP:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa mental interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema central del mapa debe ser: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

A partir de este contenido, DEBES generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 3-4 ramas principales, cada una con 1-2 puntos secundarios.
- **Si el nivel es 'intermediate':** Genera 4-5 ramas principales, cada una con 2-3 puntos secundarios.
- **Si el nivel es 'advanced':** Genera 5-6 ramas principales, cada una con 3-4 puntos secundarios o más detallados.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** El campo "title" de cada rama y los strings en "children" DEBEN derivarse del "RESUMEN DEL CONTENIDO".
2.  **IDs Únicos:** A cada rama asígnale un "id" único y descriptivo.
3.  **Posiciones CSS:** Para CADA rama, genera una posición inicial ("top", "left") en porcentajes (ej: '20%'). Las posiciones deben estar distribuidas lógicamente alrededor de un nodo central.
4.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = MindMapDataContentSchema;
                outputTypeLiteral = 'mind-map-data';
                break;
            case VisualFormat.FLOW_CHART:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de flujo interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 4-6 nodos en total (inicio, fin, 2-4 procesos).
- **Si el nivel es 'intermediate':** Genera 6-10 nodos, incluyendo al menos un nodo de 'decisión'.
- **Si el nivel es 'advanced':** Genera más de 10 nodos, múltiples decisiones y posibles bucles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Debe haber siempre un nodo de inicio y uno de fin.
2.  **Posiciones CSS:** Genera una posición ("top", "left") en píxeles distribuida lógicamente en un lienzo de 1200x800px.
3.  **Tipos de Nodo:** Asigna el "type" correcto: 'start-end', 'process', o 'decision'.
4.  **Conexiones:** Define las relaciones secuenciales entre nodos.
5.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = FlowchartDataContentSchema;
                outputTypeLiteral = 'flowchart-data';
                break;
            case VisualFormat.VENN_DIAGRAM:
                 finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de Venn, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es una comparación: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 2-3 elementos para cada sección (círculo A, círculo B, intersección).
- **Si el nivel es 'intermediate':** Genera 3-5 elementos para cada sección.
- **Si el nivel es 'advanced':** Genera 5 o más elementos, buscando diferencias y similitudes más sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Todos los elementos en los arrays "items" DEBEN derivarse del resumen.
2.  **Etiquetas Claras:** Asigna una etiqueta clara a "circleA" y "circleB".
3.  **Salida Final:** La respuesta debe ser ÚNICamente el objeto JSON válido.`;
                 outputSchema = VennDiagramDataContentSchema;
                 outputTypeLiteral = 'venn-diagram-data';
                 break;
            case VisualFormat.COMPARISON_TABLE:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una tabla comparativa, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal es: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una tabla simple con 2-3 columnas y 3-5 filas.
- **Si el nivel es 'intermediate':** Genera una tabla con 3-4 columnas y 5-8 filas.
- **Si el nivel es 'advanced':** Genera una tabla detallada con 4 o más columnas y más de 8 filas.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Estructura:** El primer elemento de "headers" debe ser el criterio de comparación (ej. "Característica"). El resto son los ítems a comparar. Cada fila debe tener la misma cantidad de elementos que "headers".
2.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = ComparisonTableDataContentSchema;
                outputTypeLiteral = 'comparison-table-data';
                break;
            case VisualFormat.TIMELINE:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una línea de tiempo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal es: "{{topicOrConcept}}".
El nivel de complejidad solicitado es: "{{level}}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 4-6 eventos clave.
- **Si el nivel es 'intermediate':** Genera 7-10 eventos.
- **Si el nivel es 'advanced':** Genera 11 o más eventos, incluyendo detalles sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Los campos "date", "title" y "description" deben derivarse del resumen y estar en orden cronológico.
2.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = TimelineDataContentSchema;
                outputTypeLiteral = 'timeline-data';
                break;
            default: // Infographic and other HTML-based formats
                 finalPrompt = `Tu tarea es generar una representación visual completa en CÓDIGO HTML5 para un/a "{{translatedFormatName}}".
Usa el siguiente CONTENIDO ESTRUCTURADO como la base fundamental.

**CONTENIDO ESTRUCTURADO (Fuente de la Verdad):**
---
{{{structuredContent}}}
---

**INSTRUCCIONES DE GENERACIÓN:**
1.  **Basado en Contenido:** El HTML debe representar fielmente la información del resumen. Crea un diseño atractivo con secciones, iconos sugeridos (ej. [ICONO: libro]) y una paleta de colores coherente.
2.  **Solo Código:** Responde ÚNICAMENTE con el código HTML5. No incluyas explicaciones.
3.  **Auto-contenido:** Incluye TODOS los estilos CSS en una etiqueta <style> en el <head>.
4.  **Adaptable:** El diseño debe ser responsive.`;
                 outputSchema = GeneratedHtmlSchema.omit({ type: true }); // Omit type for plain HTML generation
                 outputTypeLiteral = 'html';
                 break;
        }

        const prompt = ai.definePrompt(
            {
                name: `generate-${format}-prompt`,
                input: { schema: z.object({ topicOrConcept: z.string(), level: z.string().optional(), structuredContent: z.string(), translatedFormatName: z.string() }) },
                output: { schema: outputSchema },
                prompt: finalPrompt,
                model: 'gemini',
            }
        );
        
        const { output } = await prompt(finalPromptParams);

        if (output) {
          if (outputTypeLiteral) {
            // Re-add the 'type' field before returning
            return { ...output, type: outputTypeLiteral } as GenerateVisualContentFlowOutput;
          }
          // For cases like HTML where schema is directly the output
          return { type: 'html', ...output } as GenerateVisualContentFlowOutput;
        }
    }
    
    throw new Error(`The combination of category '${category}' and format '${format}' is not implemented or failed to produce output.`);
  }
);

    