
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

    // 2. Llama al modelo de generación de imágenes
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent(prompt);
    
    // 3. Extrae los datos de la imagen de la respuesta
    const response = result.response;
    const imagePart = response.candidates?.[0]?.content.parts[0];

    // Esto es un workaround para un problema conocido en el que el modelo no devuelve 'inlineData'
    // sino una función que devuelve los datos. Se revisa si la propiedad existe y si no,
    // se intenta invocar la función para obtener los datos.
    if (!imagePart || (typeof (imagePart as any).inlineData !== 'object' && typeof (imagePart as any).inline_data !== 'function')) {
       throw new Error("No se pudo generar la imagen o la respuesta no tiene el formato esperado.");
    }
    
    let inlineData;
    if (typeof (imagePart as any).inlineData === 'object') {
        inlineData = (imagePart as any).inlineData;
    } else {
        // @ts-ignore
        inlineData = imagePart.inline_data();
    }
    
    // 4. Devuelve la imagen como un string Base64
    const imageData = inlineData.data;
    const mimeType = inlineData.mimeType;
    
    return NextResponse.json({ 
      imageData: `data:${mimeType};base64,${imageData}` 
    });

  } catch (error) {
    console.error("Error en la API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido al generar la imagen.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
