# Bitácora Técnica: Módulo de Generación de Contenido Visual

Este documento sirve como "fuente de la verdad" y guía de solución de problemas para el módulo de generación de contenido visual. Si se presentan errores como `NOT_FOUND: Model ... not found` o `Image generation failed to return media`, esta bitácora contiene la lógica y los parámetros correctos que deben ser implementados.

## I. Arquitectura General

El módulo funciona en base a una interacción Frontend -> Backend (Genkit)
1.  **Frontend (`/visual/page.tsx`):** El usuario selecciona una categoría y formato, llena un formulario.
2.  **Server Action (`/visual/actions.ts`):** La acción se dispara, validando la entrada del usuario.
3.  **Flujo de Genkit (`/ai/flows/generate-visual-content.ts`):** La Server Action invoca el flujo principal de Genkit, que contiene la lógica de IA.
4.  **Respuesta al Frontend:** El resultado (imagen, JSON, HTML) se devuelve al frontend para ser renderizado por `OutputDisplay.tsx`.

## II. Lógica del Flujo de IA y Modelos Correctos (¡LA PARTE MÁS IMPORTANTE!)

El error más común ha sido el uso incorrecto de los nombres de los modelos de IA. La siguiente es la configuración que ha demostrado funcionar y que debe ser utilizada siempre.

### 1. Para Generación de Imágenes (Texto a Imagen, Ilustraciones)

- **Modelo a Utilizar:** Se debe usar el nombre completo y explícito del modelo.
  - **Correcto:** `model: 'googleai/gemini-2.0-flash-exp'`
  - **Incorrecto:** `model: 'imagen'`, `model: 'gemini'`, `model: googleAI(...)`

- **Parámetros de Configuración Clave:** Para que el modelo devuelva una imagen, es **OBLIGATORIO** especificar las modalidades de respuesta.
  - **Correcto:** `config: { responseModalities: ['TEXT', 'IMAGE'] }`
  - **Incorrecto:** `config: { responseModalities: ['IMAGE'] }` (da error), o no incluir el `config` (devuelve el error `failed to return media`).

**Ejemplo de llamada `ai.generate` correcta para imágenes:**
```javascript
const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-exp',
    prompt: fullPrompt, // El prompt de texto que describe la imagen
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
});
```

### 2. Para Generación de Texto (Resúmenes para diagramas, `alt text`, etc.)

- **Modelo a Utilizar:** Se debe usar el nombre completo y explícito del modelo de texto.
  - **Correcto:** `model: 'googleai/gemini-2.0-flash'`
  - **Incorrecto:** `model: 'gemini'` (daba error `NOT_FOUND`), `model: googleAI(...)`

**Ejemplo de llamada `ai.generate` correcta para texto:**
```javascript
const { text: altText } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: 'Genera un texto alternativo (alt text) para esta imagen.',
    input: { media: { url: media.url } }, // Se le pasa la imagen generada
});
```

## III. Proceso para Diagramas (Mapas Conceptuales, Tablas, etc.)

La generación de diagramas es un proceso robusto de **dos pasos** para asegurar la calidad del resultado.

- **Paso 1: Crear una "Fuente de la Verdad"**:
  - Se realiza una primera llamada al modelo de texto (`googleai/gemini-2.0-flash`) con un prompt genérico para que genere un resumen estructurado y detallado sobre el tema solicitado por el usuario. La complejidad (básico, intermedio, avanzado) ajusta la longitud de este resumen.

- **Paso 2: Convertir a JSON Estructurado**:
  - El resumen del Paso 1 se inyecta en un segundo **prompt muy estricto y detallado**.
  - Este segundo prompt le ordena a la IA que convierta el texto del resumen en una estructura JSON específica para el diagrama solicitado (mapa mental, tabla, etc.).
  - El prompt incluye reglas explícitas sobre el número de nodos, el formato de los IDs, la necesidad de generar coordenadas de posición (`top`, `left`), y exige que la salida sea **únicamente el objeto JSON válido**.

Esta estrategia de dos pasos es crucial para obtener datos consistentes que el frontend pueda renderizar correctamente.
