'use server';
/**
 * @fileOverview Genkit flow for generating various visual content types.
 * - generateVisualContent: Main exported function to call the flow.
 */

import { ai, geminiFlash } from '@/ai/genkit';
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

const GeneratedHtmlSchema = z.object({
    type: z.literal('html'),
    content: z.string(),
    title: z.string().optional(),
});

// Schemas for AI output (without the 'type' literal)
const ConceptMapDataContentSchema = z.object({
    title: z.string(),
    nodes: z.array(z.object({ 
        id: z.string(), 
        label: z.string(), 
        type: z.enum(['principal', 'concepto', 'conector']), 
        position: z.object({ top: z.number(), left: z.number() }) 
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
        position: z.object({ top: z.number(), left: z.number() }) 
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

// Full schemas for final output (with the 'type' literal)
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

    if (params.artStyle && params.artStyle !== "Ninguno") {
        fullPrompt += `, en el estilo de ${params.artStyle}`;
    }
    if (params.artType && params.artType !== "Ninguno") {
        fullPrompt += `, como un/a ${params.artType}`;
    }
    if (params.artistInspired) fullPrompt += `, inspirado por ${params.artistInspired}`;
    if (params.attributes) fullPrompt += `, con atributos: ${params.attributes}`;
    if (params.lighting) fullPrompt += `, iluminación: ${params.lighting}`;
    if (params.composition) fullPrompt += `, composición: ${params.composition}`;
    if (params.quality) fullPrompt += `, calidad: ${params.quality}`;
    if (params.negativePrompt) fullPrompt += `. Evita: ${params.negativePrompt}`;
    if (params.theme) fullPrompt += `. El tema general está relacionado con: ${params.theme}.`;

    return fullPrompt;
}

// Helper function to validate parameter types
function isImageGenerationParams(params: any): params is ImageGenerationParams {
    return params && typeof params.prompt === 'string';
}

function isInfoOrgParams(params: any): params is InfoOrgParams {
    return params && typeof params.topic === 'string';
}

function isConceptIllustParams(params: any): params is ConceptIllustParams {
    return params && typeof params.concept === 'string';
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
            if (!isConceptIllustParams(params)) {
                throw new Error("Invalid parameters for concept illustration");
            }
            const p = params as ConceptIllustParams;
            const visualStyle = format === VisualFormat.PHOTO_REALISTIC ? 'Fotorrealista' : p.visualStyle;
            imgParams = { 
                prompt: `Un/a ${visualStyle} de "${p.concept}". ${p.specificElements || ''}`, 
                theme: p.theme 
            };
        } else {
            if (!isImageGenerationParams(params)) {
                throw new Error("Invalid parameters for image generation");
            }
            imgParams = params as ImageGenerationParams;
        }

        const fullPrompt = buildImagePrompt(imgParams);
        
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: fullPrompt,
            responseModalities: ['TEXT', 'IMAGE'],
        });
        
        if (!media || !media.url) {
            throw new Error("Image generation failed to return media.");
        }

        const { text: altText } = await ai.generate({
            model: geminiFlash,
            prompt: [
              { media: { url: media.url } },
              { text: `Genera un texto alternativo (alt text) conciso y descriptivo para la siguiente imagen. El prompt original para la imagen fue: "${imgParams.prompt}". El texto debe estar en español y no exceder los 125 caracteres.` }
            ]
        });

        const result: GenerateVisualContentFlowOutput = {
            type: 'image',
            url: media.url,
            alt: altText || 'Imagen generada',
        };
        return result;
    }

    // Handle multi-step information organization category
    if (category === VisualCategory.INFO_ORGANIZATION) {
        if (!isInfoOrgParams(params)) {
            throw new Error("Invalid parameters for info organization");
        }
        
        const infoParams = params as InfoOrgParams;
        const { topic, level, details } = infoParams;
        
        let lengthInstruction: 'muy breve (3 a 4 puntos clave)' | 'breve (5 a 6 puntos clave)' | 'detallado pero conciso (7 a 8 ideas principales)' = 'breve (5 a 6 puntos clave)';
        if (level === 'basic') lengthInstruction = 'muy breve (3 a 4 puntos clave)';
        if (level === 'advanced') lengthInstruction = 'detallado pero conciso (7 a 8 ideas principales)';

        // STEP 1: Generate structured content
        const structuredContentPrompt = `Genera un resumen CONCISO Y DIRECTO para el tema '${topic}'. La longitud debe ser ${lengthInstruction}. Organiza los puntos principales y sub-puntos de forma lógica. El resumen DEBE estar completamente en español. Este resumen será la base para construir un diagrama visual. Detalles adicionales: ${details || ''}`;
        
        const { text: structuredContent } = await ai.generate({ 
            model: geminiFlash, 
            prompt: structuredContentPrompt 
        });
        
        if (!structuredContent) {
            throw new Error("Could not generate base content for the diagram.");
        }

        // STEP 2: Generate final output based on format
        let finalPrompt = '';
        let outputSchema: z.ZodSchema<any> | undefined = undefined;
        
        switch(format) {
            case VisualFormat.CONCEPT_MAP:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa conceptual interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del mapa es: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
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
                break;
                
            case VisualFormat.MIND_MAP:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa mental interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema central del mapa debe ser: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
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
                break;
                
            case VisualFormat.FLOW_CHART:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de flujo interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
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
                break;
                
            case VisualFormat.VENN_DIAGRAM:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de Venn, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es una comparación: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 2-3 elementos para cada sección (círculo A, círculo B, intersección).
- **Si el nivel es 'intermediate':** Genera 3-5 elementos para cada sección.
- **Si el nivel es 'advanced':** Genera 5 o más elementos, buscando diferencias y similitudes más sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Todos los elementos en los arrays "items" DEBEN derivarse del resumen.
2.  **Etiquetas Claras:** Asigna una etiqueta clara a "circleA" y "circleB".
3.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = VennDiagramDataContentSchema;
                break;
                
            case VisualFormat.COMPARISON_TABLE:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una tabla comparativa, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal es: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una tabla simple con 2-3 columnas y 3-5 filas.
- **Si el nivel es 'intermediate':** Genera una tabla con 3-4 columnas y 5-8 filas.
- **Si el nivel es 'advanced':** Genera una tabla detallada con 4 o más columnas y más de 8 filas.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Estructura:** El primer elemento de "headers" debe ser el criterio de comparación (ej. "Característica"). El resto son los ítems a comparar. Cada fila debe tener la misma cantidad de elementos que "headers".
2.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido.`;
                outputSchema = ComparisonTableDataContentSchema;
                break;
                
            case VisualFormat.TIMELINE:
                finalPrompt = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una línea de tiempo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal es: "${topic}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 4-6 eventos clave.
- **Si el nivel es 'intermediate':** Genera 7-10 eventos.
- **Si el nivel es 'advanced':** Genera 11 o más eventos, incluyendo detalles sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Los campos "date", "title" y "description" deben derivarse del resumen y estar en orden cronológico.
2.  **Salida Final:** La respuesta debe ser ÚNICamente el objeto JSON válido.`;
                outputSchema = TimelineDataContentSchema;
                break;
                
            default: // Infographic and other HTML-based formats
                finalPrompt = `Tu tarea es actuar como un diseñador gráfico y de UI experto y generar una infografía visualmente impactante en CÓDIGO HTML5. Todo el texto visible para el usuario DEBE estar en español.
El tema es: "${topic}".
El nivel de detalle es: "${level}".

**CONTENIDO ESTRUCTURADO EN ESPAÑOL (Fuente de la Verdad):**
---
${structuredContent}
---

**INSTRUCCIONES DE DISEÑO (MUY IMPORTANTE):**
1.  **Solo Código HTML:** Tu respuesta debe ser ÚNICA y EXCLUSIVAMENTE el código HTML completo. No incluyas explicaciones, comentarios, ni la palabra "html". La salida debe empezar con \`<!DOCTYPE html>\` y terminar con \`</html>\`.
2.  **Estilos CSS Auto-contenidos:** TODO el CSS debe estar dentro de una única etiqueta \`<style>\` en el \`<head>\`. No uses enlaces a hojas de estilo externas. Hazlo moderno, limpio y profesional.
3.  **Tipografía Profesional:**
    *   Importa las fuentes 'Inter' y 'Space Grotesk' de Google Fonts en el CSS.
    *   Usa 'Space Grotesk' para los títulos (h1, h2, h3) con un peso de 700.
    *   Usa 'Inter' para el cuerpo del texto (p, li) con un peso de 400 y 600 para negritas.
    *   Establece una jerarquía visual clara con tamaños de fuente (ej: h1: 2.5rem, h2: 1.8rem, p: 1rem).
4.  **Paleta de Colores Vibrante y Gradientes:**
    *   Usa una paleta de colores moderna y atractiva. Inspírate en paletas con púrpuras, azules, y rosas.
    *   **Fondo Principal:** Usa un gradiente lineal sutil para el fondo del \`<body>\`, por ejemplo, de un azul claro a un púrpura claro.
    *   **Colores de Acento:** Usa colores vibrantes (ej: fucsia, amarillo, turquesa) para títulos, iconos y elementos destacados.
5.  **Iconografía con SVG Incrustado (MUY IMPORTANTE):**
    *   Para cada sección o punto clave, DEBES generar e incrustar un **código SVG completo** para un icono simple y relevante. NO uses marcadores de posición como '[ICONO: palabra]'.
    *   **Estilo del SVG:** Los SVG deben ser de estilo "outline" (líneas), con un \`stroke="currentColor"\` para que hereden el color del texto, un \`stroke-width="2"\`, \`stroke-linecap="round"\`, \`stroke-linejoin="round"\`, y \`fill="none"\`. El tamaño debe ser de 24x24 píxeles dentro de un div.
6.  **Estructura y Layout (Flexbox/Grid):**
    *   Usa un contenedor principal con un \`max-width\` para centrar el contenido.
    *   Organiza el contenido en "tarjetas" o "secciones" distintas usando \`divs\`. Cada tarjeta debe tener \`background-color: white;\`, \`border-radius\`, y una sombra sutil (\`box-shadow\`) para crear un efecto de profundidad.
    *   Usa CSS Flexbox o Grid para crear un diseño adaptable (responsive) que se vea bien tanto en móviles como en escritorio.
7.  **Basado en Contenido:** El texto de la infografía (títulos, párrafos) DEBE basarse fielmente en el "CONTENIDO ESTRUCTURADO" proporcionado y debe estar en español.

Genera el código HTML completo y profesional AHORA.`;
                outputSchema = z.object({
                    content: z.string(),
                    title: z.string().optional(),
                });
                break;
        }

        const { output } = await ai.generate({
            model: geminiFlash,
            prompt: finalPrompt,
            output: {
                schema: outputSchema
            }
        });

        if (!output) {
            throw new Error("Failed to generate output from AI model");
        }

        // Return the correct format based on the visual format
        switch(format) {
            case VisualFormat.CONCEPT_MAP:
                return { ...(output as any), type: 'concept-map-data' };
            case VisualFormat.MIND_MAP:
                return { ...(output as any), type: 'mind-map-data' };
            case VisualFormat.FLOW_CHART:
                return { ...(output as any), type: 'flowchart-data' };
            case VisualFormat.VENN_DIAGRAM:
                return { ...(output as any), type: 'venn-diagram-data' };
            case VisualFormat.COMPARISON_TABLE:
                return { ...(output as any), type: 'comparison-table-data' };
            case VisualFormat.TIMELINE:
                return { ...(output as any), type: 'timeline-data' };
            default: // Infographic
                return { ...(output as any), type: 'html' };
        }
    }
    
    throw new Error(`The combination of category '${category}' and format '${format}' is not implemented or failed to produce output.`);
  }
);
