
import { VisualCategory, VisualFormat } from '@/types';

interface VisualFormatDetail {
  id: VisualFormat;
  name: string;
  description: string;
  category: VisualCategory;
}

export const ALL_VISUAL_FORMATS_LIST: VisualFormatDetail[] = [
  // Image Generation
  { id: VisualFormat.TEXT_TO_IMAGE, name: 'Texto a Imagen', description: 'Genera una imagen artística desde una descripción textual.', category: VisualCategory.IMAGE_GENERATION },

  // Info Organization
  { id: VisualFormat.CONCEPT_MAP, name: 'Mapa Conceptual', description: 'Organiza conceptos y sus relaciones jerárquicas.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.MIND_MAP, name: 'Mapa Mental', description: 'Expande ideas de forma radial a partir de un concepto central.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.FLOW_CHART, name: 'Diagrama de Flujo', description: 'Visualiza los pasos y decisiones de un proceso.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.VENN_DIAGRAM, name: 'Diagrama de Venn', description: 'Muestra similitudes y diferencias entre dos conjuntos.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.COMPARISON_TABLE, name: 'Tabla Comparativa', description: 'Compara características de varios elementos en una tabla.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.TIMELINE, name: 'Línea de Tiempo', description: 'Ordena eventos cronológicamente.', category: VisualCategory.INFO_ORGANIZATION },
  { id: VisualFormat.INFOGRAPHIC, name: 'Infografía', description: 'Combina texto e imágenes para presentar información.', category: VisualCategory.INFO_ORGANIZATION },

  // Concept Illustration
  { id: VisualFormat.PHOTO_REALISTIC, name: 'Imagen Fotorrealista', description: 'Crea una imagen realista de un concepto.', category: VisualCategory.CONCEPT_ILLUSTRATION },
  { id: VisualFormat.ILLUSTRATION_CONCEPT, name: 'Ilustración de Concepto', description: 'Crea una ilustración estilizada de una idea.', category: VisualCategory.CONCEPT_ILLUSTRATION },
];

export const VISUAL_CATEGORIES_LIST = [
    { id: VisualCategory.IMAGE_GENERATION, name: "Generación de Imágenes", icon: "🎨" },
    { id: VisualCategory.INFO_ORGANIZATION, name: "Organización de Información", icon: "📊" },
    { id: VisualCategory.CONCEPT_ILLUSTRATION, name: "Ilustración de Conceptos", icon: "💡" },
];

export const VISUAL_FORMATS_BY_CATEGORY: Record<VisualCategory, VisualFormatDetail[]> = {
  [VisualCategory.IMAGE_GENERATION]: ALL_VISUAL_FORMATS_LIST.filter(f => f.category === VisualCategory.IMAGE_GENERATION),
  [VisualCategory.INFO_ORGANIZATION]: ALL_VISUAL_FORMATS_LIST.filter(f => f.category === VisualCategory.INFO_ORGANIZATION),
  [VisualCategory.CONCEPT_ILLUSTRATION]: ALL_VISUAL_FORMATS_LIST.filter(f => f.category === VisualCategory.CONCEPT_ILLUSTRATION),
};


export const ART_STYLES = ["Ninguno", "Impresionismo", "Expresionismo", "Surrealismo", "Arte Pop", "Minimalismo", "Arte Abstracto", "Cyberpunk", "Steampunk", "Fantasía", "Ciencia Ficción", "Estilo Anime/Manga", "Estilo Dibujo Animado (Cartoon)"];
export const ART_TYPES = ["Ninguno", "Pintura al Óleo", "Acuarela", "Dibujo a Lápiz", "Arte Digital", "Modelo 3D", "Fotografía"];
