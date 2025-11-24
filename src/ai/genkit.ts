
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Genkit leerá automáticamente la variable de entorno GEMINI_API_KEY.
// No es necesario pasarla explícitamente si está definida en el entorno.
export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
});
