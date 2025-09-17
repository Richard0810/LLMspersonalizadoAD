import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const ai = genkit({
  plugins: [googleAI()],
});

// Define and export models for consistent use across the app
export const geminiPro = 'googleai/gemini-1.5-pro-latest';
export const geminiFlash = 'googleai/gemini-1.5-flash-latest';
// Model that supports image inputs
export const geminiProVision = 'googleai/gemini-pro-vision';
