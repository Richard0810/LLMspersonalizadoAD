
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inicializa el cliente de Google AI con tu clave de API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    // 1. Obtiene el prompt del cuerpo de la petición
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "El prompt es requerido" },
        { status: 400 }
      );
    }
    
    // Prompt mejorado para pedir también un alt text
    const fullPrompt = [
        { text: prompt },
        { text: "También, genera un texto alternativo (alt text) corto y descriptivo para la imagen."}
    ];

    // 2. Llama al modelo de generación de imágenes correcto y estable
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
    const result = await model.generateContent(fullPrompt);
    
    // 3. Extrae los datos de la imagen y el texto de la respuesta
    const response = result.response;
    const parts = response.candidates?.[0]?.content.parts;

    if (!parts || parts.length === 0) {
        throw new Error("La respuesta del modelo no contiene partes válidas.");
    }
    
    const imagePart = parts.find(p => 'inlineData' in p);
    const textPart = parts.find(p => 'text' in p);

    if (!imagePart || !('inlineData' in imagePart)) {
       throw new Error("No se pudo generar la imagen o la respuesta no tiene el formato esperado.");
    }

    // 4. Devuelve la imagen como un string Base64 y el alt text
    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType;
    const altText = textPart?.text || 'Imagen generada por IA';
    
    return NextResponse.json({ 
      imageData: `data:${mimeType};base64,${imageData}`,
      altText: altText
    });

  } catch (error) {
    console.error("Error en la API route:", error);
    let errorMessage = "Ocurrió un error desconocido al generar la imagen.";
    let status = 500;
    
    if (error instanceof Error && 'message' in error) {
        // Intenta extraer el status code si está disponible (como en el error de cuota)
        if (error.message.includes('429')) {
            errorMessage = "Límite de cuota excedido. Por favor, inténtalo de nuevo más tarde.";
            status = 429;
        } else {
             errorMessage = error.message;
        }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
