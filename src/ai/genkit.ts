
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

// Inicialización de Genkit con validación de API Key para el entorno de build
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  ],
});
