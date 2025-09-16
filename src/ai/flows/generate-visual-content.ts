
'use server';
/**
 * @fileOverview Genkit flow for generating various visual content types.
 * - generateVisualContent: Main exported function to call the flow.
 * - GenerateVisualContentFlowInput: Input type for the flow.
 * - GenerateVisualContentFlowOutput: Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { 
  GenerateVisualContentFlowInput, 
  GenerateVisualContentFlowOutput,
  GeneratedImageType,
  ImageGenerationParams,
  InfoOrgParams,
  ConceptIllustParams
} from '@/types';
import { VisualCategory, VisualFormat } from '@/types';

// Input Schemas for Params (internal to flow)
const BaseParamsSchema = z.object({
  theme: z.string().optional().describe("Tema general o contexto para la generación."),
});

const ImageGenerationParamsSchema = BaseParamsSchema.extend({
  prompt: z.string().min(1, "El prompt es obligatorio.").describe("Descripción detallada de la imagen a generar."),
  artStyle: z.string().optional().describe("Estilo artístico deseado (ej. Impresionista, Cyberpunk)."),
  artType: z.string().optional().describe("Tipo de arte (ej. Pintura al Óleo, Arte Digital)."),
  artistInspired: z.string().optional().describe("Artista o periodo como inspiración (ej. Van Gogh)."),
  attributes: z.string().optional().describe("Atributos del sujeto/objeto (colores, texturas)."),
  lighting: z.string().optional().describe("Iluminación y atmósfera (ej. Iluminación dramática)."),
  composition: z.string().optional().describe("Composición y perspectiva (ej. Plano cercano)."),
  quality: z.string().optional().describe("Calidad deseada (ej. alta resolución). Este es un indicativo para el prompt, no un parámetro directo del modelo de imagen actual."),
  negativePrompt: z.string().optional().describe("Elementos a excluir de la imagen."),
  aspectRatio: z.string().optional().describe("Relación de aspecto (ej. 1:1, 16:9). Este es un indicativo para el prompt."),
  numImages: z.number().optional().default(1).describe("Número de imágenes. Para gemini-2.0-flash-exp, siempre es 1."),
});

const InfoOrgParamsSchema = BaseParamsSchema.extend({
  topic: z.string().min(1, "El tema es obligatorio.").describe("Tema principal de la información a organizar."),
  level: z.enum(['basic', 'intermediate', 'advanced']).optional().default('intermediate').describe("Nivel de complejidad para la generación."),
  details: z.string().optional().describe("Detalles y contexto adicional."),
  outputStructure: z.string().optional().describe("Sugerencias para la estructura HTML (ej. 'HTML5 con <ul> y <li> anidados')."),
});

const ConceptIllustParamsSchema = BaseParamsSchema.extend({
  concept: z.string().min(1, "El concepto es obligatorio.").describe("Concepto a ilustrar."),
  visualStyle: z.string().min(1, "El estilo visual es obligatorio.").describe("Estilo visual deseado (ej. fotorrealista, ilustración estilizada)."),
  specificElements: z.string().optional().describe("Elementos específicos o detalles a incluir."),
});

// Main flow input schema, Zod version of GenerateVisualContentFlowInput
const FlowInputSchema = z.object({
  category: z.nativeEnum(VisualCategory),
  format: z.nativeEnum(VisualFormat),
  translatedFormatName: z.string().describe("Nombre traducido del formato para usar en prompts."),
  params: z.union([
    ImageGenerationParamsSchema,
    InfoOrgParamsSchema,
    ConceptIllustParamsSchema,
  ]),
  isPreview: z.boolean().optional().default(false).describe("Indica si es una generación de vista previa (más rápida, menos detallada)."),
});

// Output Schema using discriminated union based on 'type' property
const GeneratedImageSchema = z.object({
  type: z.literal('image'),
  url: z.string().describe("Data URI de la imagen generada (formato: 'data:image/png;base64,...')."),
  alt: z.string().describe("Texto alternativo para la imagen."),
});

const GeneratedHtmlSchema = z.object({
  type: z.literal('html'),
  content: z.string().describe("Cadena completa de HTML5 auto-contenido."),
  title: z.string().optional().describe("Título opcional para el contenido HTML."),
});

const GeneratedConceptMapDataSchema = z.object({
    type: z.literal('concept-map-data'),
    title: z.string(),
    nodes: z.array(z.object({
        id: z.string().describe("ID único y descriptivo para el nodo (ej: 'nodo-fotosintesis')."),
        label: z.string().describe("El texto que se mostrará dentro del nodo."),
        type: z.enum(['principal', 'concepto', 'conector']).describe("El tipo de nodo para aplicar el estilo correcto."),
        position: z.object({
            top: z.number().describe("Posición vertical inicial en píxeles."),
            left: z.number().describe("Posición horizontal inicial en píxeles.")
        }).describe("Coordenadas iniciales del nodo en un lienzo de 1200x800px.")
    })).describe("Array de todos los nodos del mapa."),
    connections: z.array(z.object({
        from: z.string().describe("El ID del nodo de origen."),
        to: z.string().describe("El ID del nodo de destino.")
    })).describe("Array de todas las conexiones, referenciando los IDs de los nodos.")
});

const GeneratedMindMapDataSchema = z.object({
  type: z.literal('mind-map-data'),
  title: z.string().describe("El tema central del mapa mental, que irá en el nodo principal."),
  branches: z.array(z.object({
    id: z.string().describe("ID único para la rama (ej: 'rama-definicion')."),
    title: z.string().describe("El título de esta rama o sub-nodo."),
    children: z.array(z.string()).describe("Una lista de puntos o ideas clave para esta rama."),
    position: z.object({
      top: z.string().describe("Posición CSS 'top' inicial (ej: '20%')."),
      left: z.string().describe("Posición CSS 'left' inicial (ej: '70%').")
    }).describe("Coordenadas iniciales para el sub-nodo.")
  })).describe("Una lista de 4 a 6 ramas principales que emanan del tema central.")
});

const GeneratedFlowchartDataSchema = z.object({
    type: z.literal('flowchart-data'),
    title: z.string(),
    nodes: z.array(z.object({
        id: z.string().describe("ID único para el nodo (ej: 'nodo-inicio')."),
        label: z.string().describe("El texto que se mostrará dentro del nodo."),
        type: z.enum(['start-end', 'process', 'decision']).describe("El tipo de nodo para aplicar el estilo correcto."),
        position: z.object({
            top: z.number().describe("Posición vertical inicial en píxeles."),
            left: z.number().describe("Posición horizontal inicial en píxeles.")
        }).describe("Coordenadas iniciales del nodo en un lienzo de 1200x800px.")
    })).describe("Array de todos los nodos del diagrama de flujo."),
    connections: z.array(z.object({
        from: z.string().describe("El ID del nodo de origen."),
        to: z.string().describe("El ID del nodo de destino.")
    })).describe("Array de todas las conexiones, referenciando los IDs de los nodos.")
});

const GeneratedVennDiagramDataSchema = z.object({
  type: z.literal('venn-diagram-data'),
  title: z.string().describe("Título principal del diagrama de Venn."),
  circleA: z.object({
    label: z.string().describe("Etiqueta para el círculo A."),
    items: z.array(z.string()).describe("Lista de elementos únicos del círculo A."),
  }),
  circleB: z.object({
    label: z.string().describe("Etiqueta para el círculo B."),
    items: z.array(z.string()).describe("Lista de elementos únicos del círculo B."),
  }),
  intersection: z.object({
    label: z.string().optional().describe("Etiqueta opcional para la intersección."),
    items: z.array(z.string()).describe("Lista de elementos comunes en la intersección."),
  }),
});

const GeneratedComparisonTableDataSchema = z.object({
    type: z.literal('comparison-table-data'),
    title: z.string().describe("Título principal de la tabla comparativa."),
    headers: z.array(z.string()).describe("Array con los textos de los encabezados de la tabla."),
    rows: z.array(z.array(z.string())).describe("Array de filas, donde cada fila es un array de strings (celdas)."),
});

const GeneratedTimelineDataSchema = z.object({
    type: z.literal('timeline-data'),
    title: z.string().describe("Título principal de la línea de tiempo."),
    events: z.array(z.object({
        date: z.string().describe("La fecha o periodo del evento (ej: '1969', 'Siglo XV')."),
        title: z.string().describe("El título del evento."),
        description: z.string().describe("Una breve descripción del evento.")
    })).describe("Una lista de eventos en orden cronológico.")
});


const FlowOutputSchema = z.discriminatedUnion("type", [
  GeneratedImageSchema,
  GeneratedHtmlSchema,
  GeneratedConceptMapDataSchema,
  GeneratedMindMapDataSchema,
  GeneratedFlowchartDataSchema,
  GeneratedVennDiagramDataSchema,
  GeneratedComparisonTableDataSchema,
  GeneratedTimelineDataSchema
]);


// Exported async wrapper function for the flow
export async function generateVisualContent(
  input: GenerateVisualContentFlowInput
): Promise<GenerateVisualContentFlowOutput> {
  // Validate input against the Zod schema for the flow
  const validatedFlowInput = FlowInputSchema.parse(input);
  return generateVisualContentFlow(validatedFlowInput);
}

// Helper to parse JSON from text, cautious about malformed JSON from LLM
function parseJsonFromText(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("Genkit flow: Failed to parse JSON directly from model, returning raw text. Error:", e, "Problematic JSON string:", jsonStr);
    return { rawText: jsonStr, parseError: (e as Error).message, errorDescription: "El JSON recibido del modelo no es válido." };
  }
}

// The Genkit flow (internal)
const generateVisualContentFlow = ai.defineFlow(
  {
    name: 'generateVisualContentFlow',
    inputSchema: FlowInputSchema,
    outputSchema: FlowOutputSchema,
  },
  async (input) => {
    const { category, format, translatedFormatName, params } = input;
    let promptForAI = '';

    // IMAGE GENERATION (includes previews and concept illustrations that are images)
    if (category === VisualCategory.IMAGE_GENERATION || category === VisualCategory.CONCEPT_ILLUSTRATION) {
      
      let imgGenParams: ImageGenerationParams;

      if (category === VisualCategory.CONCEPT_ILLUSTRATION) {
        const conceptParams = params as ConceptIllustParams;
        imgGenParams = { // Construct ImageGenerationParams from ConceptIllustParams
            theme: conceptParams.theme,
            prompt: `Un/a ${conceptParams.visualStyle} de "${conceptParams.concept}". ${conceptParams.specificElements || ''}. Todo el texto visible en la imagen debe estar en español si es aplicable.`,
            quality: 'alta resolución', // Default quality for concept illustrations
        };
      } else {
        imgGenParams = params as ImageGenerationParams;
      }

      let fullPrompt = imgGenParams.prompt;
      if (imgGenParams.artStyle && imgGenParams.artStyle !== "Ninguno") fullPrompt += `, en el estilo de ${imgGenParams.artStyle}`;
      if (imgGenParams.artType && imgGenParams.artType !== "Ninguno") fullPrompt += `, como un/a ${imgGenParams.artType}`;
      if (imgGenParams.artistInspired) fullPrompt += `, inspirado por ${imgGenParams.artistInspired}`;
      if (imgGenParams.attributes) fullPrompt += `, con atributos: ${imgGenParams.attributes}`;
      if (imgGenParams.lighting) fullPrompt += `, iluminación: ${imgGenParams.lighting}`;
      if (imgGenParams.composition) fullPrompt += `, composición: ${imgGenParams.composition}`;
      if (imgGenParams.quality) fullPrompt += `, calidad: ${imgGenParams.quality}`;
      if (imgGenParams.aspectRatio) fullPrompt += `, relación de aspecto: ${imgGenParams.aspectRatio}`;
      
      if (imgGenParams.negativePrompt) fullPrompt += `. Evita: ${imgGenParams.negativePrompt}`;
      fullPrompt += ` El tema general está relacionado con: ${imgGenParams.theme}.`;

      const { text: altText } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `Genera un texto alternativo (alt text) conciso y descriptivo en español para una imagen basada en la siguiente descripción: "${fullPrompt.substring(0, 400)}"`,
      });

      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: fullPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media || !media.url) {
        throw new Error("La generación de imágenes falló o no devolvió imágenes.");
      }

      const result: GeneratedImageType = {
        type: 'image',
        url: media.url,
        alt: altText || (params as ImageGenerationParams).prompt.substring(0, 100),
      };

      return result;
    }
    
    // HTML OR DATA GENERATION (Info Organization and some Concept Illustrations)
    if (category === VisualCategory.INFO_ORGANIZATION) {
      
      const infoParams = params as InfoOrgParams;
      const topicOrConcept = infoParams.topic;
      const details = infoParams.details || '';
      const level = infoParams.level || 'intermediate';
      const lengthMap = { basic: 'corta', intermediate: 'media', advanced: 'larga' } as const;
      const summaryLength = lengthMap[level];

      // STEP 1: Generate structured text content first.
      const { text: structuredContent } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `Genera un resumen DETALLADO y JERÁRQUICO de longitud ${summaryLength} para el tema '${topicOrConcept}'. Organiza los puntos principales y sub-puntos de forma lógica. Este resumen será la base para construir un diagrama visual. ${details}. El contenido debe estar en español.`,
      });
      
      if (!structuredContent) {
          throw new Error('No se pudo generar el contenido base para la visualización.');
      }

      // STEP 2: Use the generated text to create the final visual output (JSON or HTML).
      if (format === VisualFormat.CONCEPT_MAP) {
         promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa conceptual interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del mapa es: "${topicOrConcept}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

A partir de este contenido, DEBES generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una estructura de datos simple con 5-7 nodos en total (1 principal, 2-3 conceptos, 2-3 conectores).
- **Si el nivel es 'intermediate':** Genera una estructura más detallada con 8-12 nodos, incluyendo algunas ramas secundarias.
- **Si el nivel es 'advanced':** Genera una estructura compleja con más de 12 nodos, múltiples niveles de jerarquía y, si es relevante, relaciones cruzadas.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** El campo "label" de cada nodo DEBE derivarse del "RESUMEN DEL CONTENIDO". No inventes información.
2.  **IDs Únicos:** A cada nodo asígnale un "id" único y descriptivo (ej: "nodo-fotosintesis"). NO USES IDs genéricos como "nodo-1".
3.  **Posiciones CSS:** Para CADA nodo, genera una posición inicial ("top", "left") en píxeles en el campo "position". Las posiciones deben estar distribuidas lógicamente en un lienzo de 1200x800px para que el mapa sea legible. El nodo principal debe estar cerca de la parte superior central.
4.  **Tipos de Nodo:** Asigna el "type" correcto: 'principal' para el concepto central, 'concepto' para ideas secundarias, y 'conector' para las palabras de enlace.
5.  **Conexiones:** En el array "connections", define las relaciones entre tus nodos usando sus IDs únicos en los campos "from" y "to".
6.  **Idioma:** Todo el texto del campo "label" DEBE estar en ESPAÑOL.
7.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada:
{
  "type": "concept-map-data",
  "title": "Mapa Conceptual: ${topicOrConcept}",
  "nodes": [
    { "id": "nodo-principal", "label": "Mapa Conceptual", "type": "principal", "position": { "top": 30, "left": 490 } },
    { "id": "conector-sirve", "label": "Sirve para", "type": "conector", "position": { "top": 150, "left": 250 } },
    { "id": "nodo-representar", "label": "Representar conocimiento", "type": "concepto", "position": { "top": 250, "left": 170 } }
  ],
  "connections": [
    { "from": "nodo-principal", "to": "conector-sirve" },
    { "from": "conector-sirve", "to": "nodo-representar" }
  ]
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedConceptMapDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para el mapa conceptual.');
        const parsedData = parseJsonFromText(text);

        const validationResult = GeneratedConceptMapDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for concept map failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para el mapa conceptual no es válido: ${validationResult.error.toString()}`);
        }

      } else if (format === VisualFormat.MIND_MAP) {
         promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un mapa mental interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema central del mapa debe ser: "${topicOrConcept}".
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
1.  **Contenido:** El campo "title" de cada rama y los strings en "children" DEBEN derivarse del "RESUMEN DEL CONTENIDO". No inventes información.
2.  **IDs Únicos:** A cada rama asígnale un "id" único y descriptivo (ej: "rama-beneficios").
3.  **Posiciones CSS:** Para CADA rama, genera una posición inicial ("top", "left") en porcentajes (ej: '20%'). Las posiciones deben estar distribuidas lógicamente alrededor de un nodo central. NO las coloques todas en el mismo sitio.
4.  **Idioma:** Todo el texto DEBE estar en ESPAÑOL.
5.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada:
{
  "type": "mind-map-data",
  "title": "Mapa Mental",
  "branches": [
    {
      "id": "rama-definicion",
      "title": "Definición",
      "children": ["Herramienta visual", "Organiza ideas", "Jerárquico"],
      "position": { "top": "20%", "left": "70%" }
    },
    {
      "id": "rama-beneficios",
      "title": "Beneficios",
      "children": ["Mejora creatividad", "Ayuda a la memoria", "Clarifica pensamientos"],
      "position": { "top": "50%", "left": "80%" }
    }
  ]
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedMindMapDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para el mapa mental.');
        const parsedData = parseJsonFromText(text);

        const validationResult = GeneratedMindMapDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for mind map failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para el mapa mental no es válido: ${validationResult.error.toString()}`);
        }
      } else if (format === VisualFormat.FLOW_CHART) {
           promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de flujo interactivo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es: "${topicOrConcept}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

A partir de este contenido, DEBES generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una estructura de datos simple con 4-6 nodos en total (inicio, fin, 2-4 procesos).
- **Si el nivel es 'intermediate':** Genera una estructura más detallada con 6-10 nodos, incluyendo al menos un nodo de 'decisión'.
- **Si el nivel es 'advanced':** Genera una estructura compleja con más de 10 nodos, múltiples decisiones y posibles bucles o caminos alternativos.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** El campo "label" de cada nodo DEBE derivarse del "RESUMEN DEL CONTENIDO". Debe haber siempre un nodo de inicio y uno de fin.
2.  **IDs Únicos:** A cada nodo asígnale un "id" único y descriptivo (ej: "nodo-inicio", "decision-valido"). NO USES IDs genéricos como "nodo-1".
3.  **Posiciones CSS:** Para CADA nodo, genera una posición inicial ("top", "left") en píxeles en el campo "position". Las posiciones deben estar distribuidas lógicamente en un lienzo de 1200x800px para que el diagrama sea legible y siga un flujo descendente.
4.  **Tipos de Nodo:** Asigna el "type" correcto: 'start-end' para el inicio y fin del proceso, 'process' para acciones o pasos, y 'decision' para puntos de bifurcación.
5.  **Conexiones:** En el array "connections", define las relaciones secuenciales entre tus nodos usando sus IDs únicos en los campos "from" y "to".
6.  **Idioma:** Todo el texto del campo "label" DEBE estar en ESPAÑOL.
7.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada:
{
  "type": "flowchart-data",
  "title": "Diagrama de Flujo: ${topicOrConcept}",
  "nodes": [
    { "id": "nodo-inicio", "label": "Inicio", "type": "start-end", "position": { "top": 50, "left": 490 } },
    { "id": "nodo-proceso1", "label": "Definir Proceso", "type": "process", "position": { "top": 150, "left": 490 } },
    { "id": "nodo-decision1", "label": "¿Símbolos claros?", "type": "decision", "position": { "top": 250, "left": 490 } },
    { "id": "nodo-fin", "label": "Fin", "type": "start-end", "position": { "top": 350, "left": 490 } }
  ],
  "connections": [
    { "from": "nodo-inicio", "to": "nodo-proceso1" },
    { "from": "nodo-proceso1", "to": "nodo-decision1" },
    { "from": "nodo-decision1", "to": "nodo-fin" }
  ]
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedFlowchartDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para el diagrama de flujo.');
        const parsedData = parseJsonFromText(text);

        const validationResult = GeneratedFlowchartDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for flowchart failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para el diagrama de flujo no es válido: ${validationResult.error.toString()}`);
        }
      } else if (format === VisualFormat.VENN_DIAGRAM) {
          promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para un diagrama de Venn, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal del diagrama es una comparación, por lo que el título debe reflejar esto: "${topicOrConcept}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

A partir de este contenido, DEBES identificar los dos conceptos principales a comparar, sus características únicas y sus similitudes para generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 2-3 elementos para cada sección (círculo A, círculo B, intersección).
- **Si el nivel es 'intermediate':** Genera 3-5 elementos para cada sección.
- **Si el nivel es 'advanced':** Genera 5 o más elementos para cada sección, buscando similitudes y diferencias más sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Todos los elementos en los arrays "items" DEBEN derivarse del "RESUMEN DEL CONTENIDO". No inventes información.
2.  **Etiquetas Claras:** Asigna una etiqueta clara y concisa a "circleA" y "circleB" que represente los dos conceptos que se comparan.
3.  **Idioma:** Todo el texto DEBE estar en ESPAÑOL.
4.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada para un tema como "Comparar Perros y Gatos":
{
  "type": "venn-diagram-data",
  "title": "Diagrama de Venn: Perros vs. Gatos",
  "circleA": {
    "label": "Perros",
    "items": ["Leales", "Necesitan paseos", "Ladran"]
  },
  "circleB": {
    "label": "Gatos",
    "items": ["Independientes", "Usan caja de arena", "Ronronean"]
  },
  "intersection": {
    "items": ["Son mamíferos", "Mascotas domésticas", "Tienen cuatro patas"]
  }
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedVennDiagramDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para el diagrama de Venn.');
        const parsedData = parseJsonFromText(text);
        const validationResult = GeneratedVennDiagramDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for Venn diagram failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para el diagrama de Venn no es válido: ${validationResult.error.toString()}`);
        }
      } else if (format === VisualFormat.COMPARISON_TABLE) {
          promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una tabla comparativa, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal de la tabla es: "${topicOrConcept}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

A partir de este contenido, DEBES identificar los criterios de comparación y los datos para cada elemento a comparar para generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera una tabla simple con 2-3 columnas y 3-5 filas.
- **Si el nivel es 'intermediate':** Genera una tabla con 3-4 columnas y 5-8 filas.
- **Si el nivel es 'advanced':** Genera una tabla detallada con 4 o más columnas y más de 8 filas, incluyendo criterios de comparación más sutiles.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Los campos "title", "headers" y los datos en "rows" DEBEN derivarse del "RESUMEN DEL CONTENIDO". No inventes información.
2.  **Estructura:** El primer elemento de "headers" debe ser el criterio de comparación (ej. "Característica"). El resto de elementos son los ítems a comparar. Cada array en "rows" debe tener la misma cantidad de elementos que "headers".
3.  **Idioma:** Todo el texto DEBE estar en ESPAÑOL.
4.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada para "Comparar Teléfonos":
{
  "type": "comparison-table-data",
  "title": "Tabla Comparativa: Teléfonos",
  "headers": ["Característica", "Modelo A", "Modelo B"],
  "rows": [
    ["Pantalla", "6.1 pulgadas OLED", "6.7 pulgadas AMOLED"],
    ["Batería", "4000 mAh", "5000 mAh"],
    ["Cámara", "12 MP", "108 MP"]
  ]
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedComparisonTableDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para la tabla comparativa.');
        const parsedData = parseJsonFromText(text);
        const validationResult = GeneratedComparisonTableDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for comparison table failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para la tabla comparativa no es válido: ${validationResult.error.toString()}`);
        }
      } else if (format === VisualFormat.TIMELINE) {
          promptForAI = `Tu tarea es generar una ESTRUCTURA DE DATOS JSON para una línea de tiempo, BASADO EN EL RESUMEN PROPORCIONADO.
El tema principal de la línea de tiempo es: "${topicOrConcept}".
El nivel de complejidad solicitado es: "${level}".

**RESUMEN DEL CONTENIDO (Fuente de la Verdad):**
---
${structuredContent}
---

A partir de este contenido, DEBES identificar los eventos clave y sus fechas para generar un objeto JSON que siga el esquema de salida.

**Reglas de Generación por Nivel (MUY IMPORTANTE):**
- **Si el nivel es 'basic':** Genera 4-6 eventos clave.
- **Si el nivel es 'intermediate':** Genera 7-10 eventos.
- **Si el nivel es 'advanced':** Genera 11 o más eventos, incluyendo detalles más sutiles o eventos secundarios importantes.

**Reglas de Estructura JSON (MUY IMPORTANTE):**
1.  **Contenido:** Los campos "date", "title" y "description" DEBEN derivarse del "RESUMEN DEL CONTENIDO". Los eventos deben estar en orden cronológico.
2.  **Idioma:** Todo el texto DEBE estar en ESPAÑOL.
3.  **Salida Final:** La respuesta debe ser ÚNICAMENTE el objeto JSON válido. No incluyas explicaciones, comentarios o markdown.

Ejemplo de salida JSON esperada:
{
  "type": "timeline-data",
  "title": "Línea de Tiempo: Segunda Guerra Mundial",
  "events": [
    {
      "date": "1939",
      "title": "Invasión de Polonia",
      "description": "Alemania invade Polonia, dando inicio a la guerra en Europa."
    },
    {
      "date": "1941",
      "title": "Ataque a Pearl Harbor",
      "description": "Japón ataca la base naval de Pearl Harbor, provocando la entrada de EE.UU. a la guerra."
    },
    {
      "date": "1945",
      "title": "Fin de la Guerra",
      "description": "Alemania y Japón se rinden, poniendo fin a la Segunda Guerra Mundial."
    }
  ]
}`;
        const { text } = await ai.generate({ prompt: promptForAI, output: { schema: GeneratedTimelineDataSchema } });
        if (!text) throw new Error('El modelo no generó datos JSON para la línea de tiempo.');
        const parsedData = parseJsonFromText(text);
        const validationResult = GeneratedTimelineDataSchema.safeParse(parsedData);
        if (validationResult.success) {
            return validationResult.data;
        } else {
             console.error("Generated JSON for timeline failed validation:", validationResult.error.toString(), "Raw JSON:", text);
             throw new Error(`El JSON generado para la línea de tiempo no es válido: ${validationResult.error.toString()}`);
        }
      } else { // Fallback for other HTML types (Infographic)
         const outputStructure = infoParams.outputStructure || '';
         promptForAI = `Tu tarea es generar una representación visual completa en CÓDIGO HTML5 para un/a "${translatedFormatName}".
Usa el siguiente CONTENIDO ESTRUCTURADO como la base fundamental para la información que mostrarás.

**CONTENIDO ESTRUCTURADO (Fuente de la Verdad):**
---
${structuredContent}
---

**INSTRUCCIONES DE GENERACIÓN:**
1.  **Basado en Contenido:** El HTML debe representar visual y fielmente la información del "CONTENIDO ESTRUCTURADO". No inventes contenido. Para infografías, crea un diseño atractivo con secciones, iconos sugeridos (usando emojis o texto como [ICONO: libro]) y una paleta de colores coherente.
2.  **Solo Código:** Responde ÚNICAMENTE con el código HTML5. No incluyas explicaciones ni texto fuera de las etiquetas <html>...</html>. Omite los comentarios HTML.
3.  **Auto-contenido:** Incluye TODOS los estilos CSS necesarios en una etiqueta <style> en el <head>. Los estilos deben ser claros, ordenados y visualmente atractivos.
4.  **Adaptable:** El diseño debe ser responsive.
5.  **Idioma:** Todo el texto visible DENTRO del HTML debe estar en ESPAÑOL.
6.  **Estructura Semántica:** Usa HTML semántico apropiado para "${translatedFormatName}".
7.  **Complejidad:** Adapta la cantidad de detalle al nivel solicitado: "${level}".
8.  **Contexto Adicional:** Considera estas instrucciones del usuario: "${details || 'Ninguna.'}".

Ejemplo de inicio de respuesta esperada:
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translatedFormatName}: ${topicOrConcept}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f9; color: #333; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; text-align: center; margin-bottom: 20px; }
        /* Add specific styles for ${translatedFormatName} here */
    </style>
</head>
<body><div class="container"><h1>${translatedFormatName}: ${topicOrConcept}</h1><!-- CONTENT HERE --></div></body></html>`;
      
        const { text } = await ai.generate({ prompt: promptForAI });
        if (!text) throw new Error('El modelo no generó contenido HTML.');
        const htmlContent = text.replace(/^```html\s*|```\s*$/g, '').trim();
        return { type: 'html', content: htmlContent, title: `${translatedFormatName}: ${topicOrConcept}` };
     }
    }
    
    throw new Error(`La combinación de categoría '${category}' y formato '${format}' no está implementada o no se pudo procesar.`);
  }
);
