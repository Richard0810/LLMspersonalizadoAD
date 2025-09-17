import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const ai = genkit({
  plugins: [googleAI()],
});

// Define and export models for consistent use across the app
export const gemini = 'googleai/gemini-1.5-flash-latest';
export const geminiFlash = 'googleai/gemini-2.0-flash';
export const geminiFlashExp = 'googleai/gemini-2.0-flash-exp';
export const geminiFlashImagePreview = 'googleai/gemini-2.5-flash-image-preview';
export const imagen = 'googleai/imagen-4.0-fast-generate-001';
