
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
    
    const fullPrompt = [
        { text: prompt },
        { text: "También, genera un texto alternativo (alt text) corto y descriptivo para la imagen."}
    ];

    // 2. Llama al modelo de generación de imágenes validado y estable
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent({
        contents: [{ parts: fullPrompt }],
        // @ts-ignore - Este parámetro es necesario para este modelo específico
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    image: {
                        type: "string",
                        description: "La imagen generada, como un string en formato base64."
                    },
                    altText: {
                        type: "string",
                        description: "Un texto alternativo corto y descriptivo para la imagen."
                    }
                }
            }
        }
    });
    
    // 3. Extrae los datos de la imagen y el texto de la respuesta
    const response = result.response;
    const responseText = response.text();
    
    if (!responseText) {
        throw new Error("La respuesta del modelo vino vacía.");
    }

    const parsedResponse = JSON.parse(responseText);
    
    const imageData = parsedResponse.image;
    const altText = parsedResponse.altText || 'Imagen generada por IA';

    if (!imageData) {
       throw new Error("No se pudo generar la imagen o la respuesta no tiene el formato esperado.");
    }
    
    return NextResponse.json({ 
      imageData: `data:image/png;base64,${imageData}`,
      altText: altText
    });

  } catch (error) {
    console.error("Error en la API route:", error);
    let errorMessage = "Ocurrió un error desconocido al generar la imagen.";
    let status = 500;
    
    if (error instanceof Error && 'message' in error) {
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
