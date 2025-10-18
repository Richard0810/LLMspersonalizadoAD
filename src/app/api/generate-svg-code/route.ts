
import { NextResponse } from 'next/server';
import { generateSvgFromGuide } from '@/ai/flows/generate-svg-code';
import type { SvgGenerationInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { input }: { input: SvgGenerationInput } = await req.json();

    if (!input) {
      return NextResponse.json({ success: false, error: 'Input no proporcionado.' }, { status: 400 });
    }

    const result = await generateSvgFromGuide(input);

    return NextResponse.json({ success: true, data: result });

  } catch (e: any) {
    console.error('Error en /api/generate-svg-code:', e);
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado en el servidor.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

    