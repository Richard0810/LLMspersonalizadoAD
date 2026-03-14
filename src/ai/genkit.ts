import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env (o .env.local)
config();

// Genkit leerá automáticamente la variable de entorno GEMINI_API_KEY.
// Usamos el plugin oficial unificado para acceso a modelos 2.5 y superiores.
export const ai = genkit({
  plugins: [googleAI()],
});