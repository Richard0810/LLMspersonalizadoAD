import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
});

// Define and export models for consistent use across the app
export const gemini = 'googleai/gemini-1.5-flash-latest';
export const imagen = 'googleai/imagen-4.0-fast-generate-001';
