
'use server';

import { generateSvgCode, GenerateSvgCodeInput } from '@/ai/flows/generate-svg-code';

interface ActionResult {
  success: boolean;
  svgCode?: string;
  error?: string;
}

export async function generateSvgAction(
  input: GenerateSvgCodeInput
): Promise<ActionResult> {
  try {
    const result = await generateSvgCode(input);
    return { success: true, svgCode: result.svgCode };
  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unexpected error occurred');
    console.error('Error in generateSvgAction:', error.message);
    return { success: false, error: error.message };
  }
}
