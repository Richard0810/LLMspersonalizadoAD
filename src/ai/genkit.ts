import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })],
  models: {
    'gemini': 'googleai/gemini-2.0-flash',
    'imagen': 'googleai/imagen-4.0-fast-generate-001',
  },
  model: 'googleai/gemini-2.0-flash',
});
