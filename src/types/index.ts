import { z } from 'zod';

export interface User {
  username: string;
  uid: string;
}

export interface Activity {
  id: string;
  title: string;
  objective: string;
  computationalConcept: string;
  materials: string;
  estimatedTime: string;
  teacherPreparation: string;
  stepByStepDevelopment: string;
  activityResources: string;
  reflectionQuestion: string;
  evaluationCriteria: string;
  // --- Nuevos campos opcionales ---
  duration?: string;
  teacherNotes?: string;
  complexityLevel?: 'Básico' | 'Intermedio' | 'Avanzado';
  groupSize?: 'Individual' | 'Parejas' | 'Grupal';
  context?: 'Urbano' | 'Rural' | 'Mixto';
  activityType?: string;
}

export type MessageSender = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id:string;
  sender: MessageSender;
  text?: string;
  activities?: Activity[];
  isLoading?: boolean;
  error?: string;
  timestamp: number;
  type?: 'text' | 'activity_cards' | 'error' | 'parameter_select_area' | 'parameter_select_grade' | 'loading';
  lessonParams?: LessonParams; 
}

export interface LessonParams {
  // Parámetros básicos
  topicName: string;
  computationalConcept: string;
  subjectArea: string;
  gradeLevel: string;
  // Parámetros avanzados
  duration: string;
  teacherNotes: string;
  complexityLevel: 'Básico' | 'Intermedio' | 'Avanzado';
  groupSize: 'Individual' | 'Parejas' | 'Grupal';
  context: 'Urbano' | 'Rural' | 'Mixto';
  activityType: string;
}

export const subjectAreas = [
  "Matemáticas",
  "Tecnología e Informática",
  "Ciencias Naturales",
  "Lengua Castellana",
  "Ciencias Sociales",
  "Educación Artística",
  "Educación Física"
];

export const gradeLevels = [
  "Transición (Preescolar)",
  "Básica Primaria (Grados 1º a 3º)",
  "Básica Primaria (Grados 4º a 5º)",
  "Básica Secundaria (Grados 6º a 7º)",
  "Básica Secundaria (Grados 8º a 9º)",
  "Educación Media (Grados 10º a 11º)",
];

export const computationalConcepts = [
  "Descomposición",
  "Reconocimiento de patrones",
  "Abstracción",
  "Algoritmos",
  "Todos los conceptos"
];

// --- Nuevas constantes para los selectores del formulario ---
export const complexityLevels: LessonParams['complexityLevel'][] = ["Básico", "Intermedio", "Avanzado"];
export const groupSizes: LessonParams['groupSize'][] = ["Individual", "Parejas", "Grupal"];
export const educationalContexts: LessonParams['context'][] = ["Urbano", "Rural", "Mixto"];
export const activityTypes: { id: string; name: string; description: string }[] = [
    { id: "Juego", name: "Juego", description: "Actividades centradas en reglas, competencia o colaboración para lograr un objetivo lúdico." },
    { id: "Debate", name: "Debate", description: "Fomenta la argumentación y el pensamiento crítico sobre un tema, con diferentes roles." },
    { id: "Manualidad", name: "Manualidad", description: "Implica la creación de un artefacto físico o tangible para representar conceptos." },
    { id: "Reflexión", name: "Reflexión", description: "Actividades introspectivas para conectar la experiencia con conceptos abstractos." },
    { id: "Experimento", name: "Experimento", description: "Se basa en la observación y el análisis de resultados a partir de una hipótesis." }
];


export const SvgGenerationInputSchema = z.object({
  componentType: z.enum(['carta_pregunta', 'carta_accion', 'tabla_personalizada']),
  color: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  numRows: z.number().optional(),
  numCols: z.number().optional(),
  headers: z.string().optional(),
});
export type SvgGenerationInput = z.infer<typeof SvgGenerationInputSchema>;

// Activity Visuals Types
export interface VisualItem {
  text: string;
  svgCode: string | null; // Reemplaza htmlContent
  svgGenerationInput: SvgGenerationInput | null; // Nuevo campo para los parámetros
  imageUrl: string | null;
  imageAlt: string | null;
}


// Visual Generator Types

export enum VisualCategory {
  IMAGE_GENERATION = "image_generation",
  INFO_ORGANIZATION = "info_organization",
  CONCEPT_ILLUSTRATION = "concept_illustration",
}

export enum VisualFormat {
  // Image Generation
  TEXT_TO_IMAGE = "text_to_image",

  // Info Organization
  CONCEPT_MAP = "concept_map",
  MIND_MAP = "mind_map",
  FLOW_CHART = "flow_chart",
  VENN_DIAGRAM = "venn_diagram",
  COMPARISON_TABLE = "comparison_table",
  TIMELINE = "timeline",
  INFOGRAPHIC = "infographic",

  // Concept Illustration
  PHOTO_REALISTIC = "photo_realistic",
  ILLUSTRATION_CONCEPT = "illustration_concept",
}

// Input parameter types
export interface ImageGenerationParams {
  theme?: string;
  prompt: string;
  artStyle?: string;
  artType?: string;
  artistInspired?: string;
  attributes?: string;
  lighting?: string;
  composition?: string;
  quality?: string;
  negativePrompt?: string;
  aspectRatio?: string;
  numImages?: number;
}

export interface InfoOrgParams {
  theme?: string;
  topic: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  details?: string;
  outputStructure?: string;
}

export interface ConceptIllustParams {
  theme?: string;
  concept: string;
  visualStyle: string; // e.g., 'fotorrealista', 'ilustración estilizada'
  specificElements?: string;
}


export interface GenerateVisualContentFlowInput {
  category: VisualCategory;
  format: VisualFormat;
  translatedFormatName: string;
  params: ImageGenerationParams | InfoOrgParams | ConceptIllustParams | SvgGenerationInput;
  isPreview?: boolean;
}

// Output types from the flow
export interface GeneratedImageType {
  type: 'image';
  url: string; // data URI
  alt: string;
}

export interface GeneratedHtmlType {
  type: 'html';
  content: string;
  title?: string;
}

export interface GeneratedSvgType {
    type: 'svg';
    svgCode: string;
}

export interface GeneratedConceptMapDataType {
  type: 'concept-map-data';
  title: string;
  nodes: Array<{
    id: string;
    label: string;
    type: 'principal' | 'concepto' | 'conector';
    position: { top: number; left: number };
  }>;
  connections: Array<{ from: string; to: string }>;
}

export interface GeneratedMindMapDataType {
  type: 'mind-map-data';
  title: string;
  branches: Array<{
    id: string;
    title: string;
    children: string[];
    position: { top: string; left: string };
  }>;
}

export interface GeneratedFlowchartDataType {
  type: 'flowchart-data';
  title: string;
  nodes: Array<{
    id: string;
    label: string;
    type: 'start-end' | 'process' | 'decision';
    position: { top: number; left: number };
  }>;
  connections: Array<{ from: string; to: string }>;
}

export interface GeneratedVennDiagramDataType {
  type: 'venn-diagram-data';
  title: string;
  circleA: { label: string; items: string[] };
  circleB: { label: string; items: string[] };
  intersection: { label?: string; items: string[] };
}

export interface GeneratedComparisonTableDataType {
  type: 'comparison-table-data';
  title: string;
  headers: string[];
  rows: string[][];
}

export interface GeneratedTimelineDataType {
  type: 'timeline-data';
  title: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
  }>;
}

export type GeneratedContentType =
  | GeneratedImageType
  | GeneratedHtmlType
  | GeneratedConceptMapDataType
  | GeneratedMindMapDataType
  | GeneratedFlowchartDataType
  | GeneratedVennDiagramDataType
  | GeneratedComparisonTableDataType
  | GeneratedTimelineDataType
  | GeneratedSvgType;

export type GenerateVisualContentFlowOutput = GeneratedContentType;


export const SvgGenerationOutputSchema = z.object({
  svgCode: z.string(),
});
export type SvgGenerationOutput = z.infer<typeof SvgGenerationOutputSchema>;
