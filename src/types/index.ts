

export interface User {
  username: string;
  uid: string;
}

export interface Activity {
  id: string;
  activityName: string;
  learningObjective: string;
  materials: string;
  instructions: string;
  reflectionQuestion: string;
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
  lessonName: string;
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


