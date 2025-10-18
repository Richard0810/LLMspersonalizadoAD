
import { NextResponse } from 'next/server';
import { generateVisualContent } from '@/ai/flows/generate-visual-content';
import type { GenerateVisualContentFlowInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { input }: { input: GenerateVisualContentFlowInput } = await req.json();

    if (!input) {
      return NextResponse.json({ success: false, error: 'Input no proporcionado.' }, { status: 400 });
    }

    const result = await generateVisualContent(input);

    return NextResponse.json({ success: true, data: result });

  } catch (e: any) {
    console.error('Error en /api/generate-visual-content:', e);
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado en el servidor.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

    