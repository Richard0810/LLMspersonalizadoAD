
'use server';

import { generateVisualContent } from '@/ai/flows/generate-visual-content';
import type { GenerateVisualContentFlowInput, GenerateVisualContentFlowOutput } from '@/types';

interface ActionResult {
  success: boolean;
  data?: GenerateVisualContentFlowOutput;
  error?: string;
}

export async function generateVisualContentAction(
  input: GenerateVisualContentFlowInput
): Promise<ActionResult> {
  try {
    const result = await generateVisualContent(input);
    return { success: true, data: result };
  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in generateVisualContentAction:', error.message);
    return { success: false, error: error.message };
  }
}
