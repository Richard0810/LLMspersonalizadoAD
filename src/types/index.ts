import { z } from 'zod';

export interface User {
  username: string;
  uid: string;
}

export const EducationalActivitySchema = z.object({
  title: z.string().describe('Título de la actividad.'),
  objective: z.string().describe('Un objetivo de aprendizaje claro, medible, específico y en coherencia con los lineamientos del MEN de Colombia.'),
  computationalConcept: z.string().describe('El concepto o conceptos de pensamiento computacional trabajados en la actividad.'),
  materials: z.string().describe('Una lista de materiales simples y accesibles (no electrónicos), donde cada material está en una nueva línea.'),
  estimatedTime: z.string().describe('El tiempo estimado para la realización completa de la actividad (ej: "45 minutos", "2 horas de clase").'),
  teacherPreparation: z.string().describe('Los pasos o materiales que el docente debe preparar antes de la clase, donde cada paso está en una nueva línea.'),
  stepByStepDevelopment: z.string().describe('Guion de clase para el docente, detallando qué decir y hacer. Debe ser una guía numerada con acciones específicas para estudiantes, gestión de tiempos y ejemplos prácticos. Cada paso debe estar en una nueva línea.'),
  activityResources: z.string().describe("Una lista de recursos tangibles y específicos que el docente debe crear o dibujar. No deben ser ejemplos, sino el contenido final. Para tablas, se deben definir columnas y filas exactas. Para tarjetas, se debe describir su contenido (acción, descripción, símbolo). Cada recurso debe estar en una nueva línea."),
  reflectionQuestion: z.string().describe("Una explicación detallada y clara que demuestre cómo la actividad evidencia el concepto de pensamiento computacional, conectando las acciones específicas del ejercicio con la teoría. A continuación, debe incluir preguntas para guiar la reflexión del estudiante, con cada pregunta en una nueva línea y precedida por un guion."),
  evaluationCriteria: z.string().describe('Los criterios de evaluación o evidencias de aprendizaje que el docente puede usar para valorar el desempeño de los estudiantes, donde cada criterio está en una nueva línea.')
});

export const GenerateEducationalActivitiesOutputSchema = z.array(EducationalActivitySchema).length(3).describe('Tres actividades desconectadas, muy detalladas y listas para ser implementadas por un docente con poca experiencia en el tema.');
export type GenerateEducationalActivitiesOutput = z.infer<typeof GenerateEducationalActivitiesOutputSchema>;

export const GenerateEducationalActivitiesInputSchema = z.object({
  topicName: z.string().describe('El tema a tratar en la actividad.'),
  computationalConcept: z.string().describe('The key computational thinking concept.'),
  subjectArea: z.string().describe('The subject area or discipline.'),
  gradeLevel: z.string().describe('The grade level for the activities.'),
});
export type GenerateEducationalActivitiesInput = z.infer<typeof GenerateEducationalActivitiesInputSchema>;


export const ConsultAIOnLessonInputSchema = z.object({
  topicName: z.string().describe('The name of the current lesson topic.'),
  concept: z.string().describe('The key computational thinking concept for the lesson.'),
  area: z.string().describe('The subject area of the lesson.'),
  grade: z.string().describe('The grade level of the lesson.'),
  question: z.string().describe('The user question about the lesson or computational thinking.'),
});
export type ConsultAIOnLessonInput = z.infer<typeof ConsultAIOnLessonInputSchema>;


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
  title:string;
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
