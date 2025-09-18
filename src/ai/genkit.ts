
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const ai = genkit({
  plugins: [googleAI({
      // Si la clave de API no está establecida, el plugin la buscará 
      // automáticamente en la variable de entorno GOOGLE_API_KEY.
      // Ser explícitos aquí asegura que se use la clave correcta de Gemini.
      apiKey: process.env.GEMINI_API_KEY,
  })],
});
