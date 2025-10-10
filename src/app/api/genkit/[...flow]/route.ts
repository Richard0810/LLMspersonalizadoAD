/**
 * @fileoverview This file creates a Next.js API route handler for Genkit flows.
 *
 * It imports all the defined flows and creates a handler using `createNextApiHandler`.
 * This allows Genkit flows to be executed as API endpoints in a Next.js application.
 */

import { createNextApiHandler } from '@genkit-ai/next';
import '@/ai/flows/consult-ai-on-lesson';
import '@/ai/flows/generate-educational-activity';
import '@/ai/flows/generate-visual-content';
import '@/ai/flows/generate-activity-document';
import '@/ai/flows/generate-activity-visuals';

export const { GET, POST } = createNextApiHandler();
