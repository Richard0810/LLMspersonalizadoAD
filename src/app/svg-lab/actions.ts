'use server';

import { generateSvgFromGuide } from '@/ai/flows/generate-svg-code';
import type { SvgGenerationInput, SvgGenerationOutput } from '@/types';

interface ActionResult {
  success: boolean;
  data?: SvgGenerationOutput;
  error?: string;
}

export async function generateSvgAction(
  input: SvgGenerationInput
): Promise<ActionResult> {
  try {
    const result = await generateSvgFromGuide(input);
    return { success: true, data: result };
  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in generateSvgAction:', error.message);
    return { success: false, error: error.message };
  }
}
