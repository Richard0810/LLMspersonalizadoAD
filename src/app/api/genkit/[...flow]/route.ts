
/**
 * @fileoverview This file creates a Next.js API route handler for Genkit flows.
 *
 * It imports all the defined flows from 'ai/dev' and creates a handler
 * using `createApiHandler`. This ensures all flows are registered and
 * executable as API endpoints in a Next.js application.
 */

import { createApiHandler } from '@genkit-ai/next';
import '@/ai/dev'; // CRITICAL: This imports and registers all defined flows.

export const { GET, POST } = createApiHandler();
