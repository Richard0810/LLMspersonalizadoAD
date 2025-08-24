

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
  id: string;
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
  "Matemáticas", "Ciencias", "Lengua y Literatura", "Ciencias Sociales", 
  "Artes", "Educación Física", "Tecnología", "Ingeniería", "Otro"
];

export const gradeLevels = [
  "Preescolar", "1º Grado", "2º Grado", "3º Grado", "4º Grado", "5º Grado",
  "6º Grado", "7º Grado", "8º Grado", "9º Grado", "10º Grado", "11º Grado", "12º Grado",
  "Educación Superior", "Todas las Edades"
];

export const computationalConcepts = [
  "Algoritmos",
  "Descomposición",
  "Reconocimiento de Patrones",
  "Abstracción",
  "Pensamiento Lógico",
  "Depuración",
  "Todos los conceptos"
];
