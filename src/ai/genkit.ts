
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env
config();

// Genkit leerá automáticamente la variable de entorno GEMINI_API_KEY.
// No es necesario pasarla explícitamente si está definida en el entorno del servidor.
export const ai = genkit({
  plugins: [googleAI()],
});
