'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

// Carga las variables de entorno desde .env u otros archivos de configuración de dotenv
config();

/**
 * Inicializa y exporta la instancia global de Genkit.
 *
 * Esta instancia está configurada con el plugin de Google AI.
 * Lee la clave de API desde la variable de entorno `GEMINI_API_KEY`.
 * Si la variable de entorno no está definida, el plugin buscará
 * automáticamente la variable `GOOGLE_API_KEY`.
 *
 * Ser explícito con la `apiKey` aquí asegura que se use la clave correcta,
 * especialmente en entornos de despliegue como Vercel.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
