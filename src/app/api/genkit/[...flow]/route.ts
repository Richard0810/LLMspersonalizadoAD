
/**
 * @fileoverview This file creates a Next.js API route handler for Genkit flows.
 *
 * It imports all the defined flows and creates a handler using `createNextApiHandler`.
 * This allows Genkit flows to be executed as API endpoints in a Next.js application.
 */

import { createNextApiHandler } from '@genkit-ai/next';
import '@/ai/dev';

export const { GET, POST } = createNextApiHandler();
