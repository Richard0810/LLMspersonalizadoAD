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
  topicName: string;
  computationalConcept: string;
  subjectArea: string;
  gradeLevel: string;
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


// Activity Visuals Types
export interface VisualItem {
  text: string;
  htmlContent: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}


// Visual Generator Types

export enum VisualCategory {
  IMAGE_GENERATION = "image_generation",
  INFO_ORGANIZATION = "info_organization",
  CONCEPT_ILLUSTRATION = "concept_illustration"
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
  params: ImageGenerationParams | InfoOrgParams | ConceptIllustParams;
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
  | GeneratedTimelineDataType;

export type GenerateVisualContentFlowOutput = GeneratedContentType;

// SVG Lab Types
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

export const SvgGenerationOutputSchema = z.object({
  svgCode: z.string(),
});
export type SvgGenerationOutput = z.infer<typeof SvgGenerationOutputSchema>;
