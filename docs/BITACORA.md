# Bitácora Técnica: Módulo de Generación de Contenido Visual

Este documento sirve como "fuente de la verdad" y guía de solución de problemas para el módulo de generación de contenido visual. Si se presentan errores como `NOT_FOUND: Model ... not found`, `Image generation failed to return media` o un error de JSON inválido, esta bitácora contiene la lógica y los parámetros correctos que deben ser implementados.

## I. Arquitectura General (Modelo Tradicional API)

El módulo funciona en base a una interacción Frontend -> Backend (Genkit) a través de rutas de API explícitas, lo cual ha demostrado ser el enfoque más estable.

1.  **Frontend (`/visual/page.tsx` o `/svg-lab/page.tsx`)**:
    *   El usuario llena un formulario con los parámetros deseados.
    *   Al enviar, el cliente construye un objeto `input` con los datos.
    *   Se realiza una llamada `fetch` con el método `POST` a una ruta de API específica (ej: `/api/generate-visual-content` o `/api/generate-svg-code`).
    *   El `body` de la solicitud `fetch` es el objeto `input` convertido a una cadena JSON (`JSON.stringify({ input })`).

2.  **Ruta de API (`/app/api/.../route.ts`)**:
    *   Un archivo `route.ts` dedicado recibe la solicitud `POST`.
    *   Extrae el objeto `input` del cuerpo de la solicitud (`await req.json()`).
    *   Importa y llama a la función del flujo de Genkit correspondiente, pasándole el `input`.
    *   Espera la respuesta del flujo.
    *   Devuelve la respuesta final al frontend usando `NextResponse.json()`.

3.  **Flujo de Genkit (`/ai/flows/...`):**
    *   El flujo (ej: `generateVisualContentFlow`) contiene toda la lógica de IA.
    *   Recibe el `input` desde la ruta de API.
    *   Llama a los modelos de Genkit (`ai.generate`) con los prompts adecuados.
    *   Devuelve el resultado final (URL de imagen, objeto JSON, código HTML/SVG).

4.  **Respuesta al Frontend:**
    *   El `fetch` en el cliente recibe la respuesta JSON.
    *   Si la respuesta es exitosa, el contenido se muestra en la interfaz.
    *   Si la ruta de API falla, el `fetch` puede recibir una página de error HTML, causando un error de tipo `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`. Esto indica un problema en el backend (ruta no encontrada, error interno del servidor, etc.).

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

### 2. Para Generación de Texto (Resúmenes para diagramas, `alt text`, código SVG)

- **Modelo a Utilizar:** Se debe usar el nombre completo y explícito del modelo de texto.
  - **Correcto:** `model: 'googleai/gemini-2.0-flash'`
  - **Incorrecto:** `model: 'gemini'` (daba error `NOT_FOUND`), `model: googleAI(...)`

**Ejemplo de llamada `ai.generate` correcta para texto:**
```javascript
const { text: altText } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: 'Genera un texto alternativo (alt text) para esta imagen.',
});
```

## III. Proceso para Diagramas (Mapas Conceptuales, Tablas, etc.)

La generación de diagramas es un proceso robusto de **dos pasos** para asegurar la calidad del resultado.

- **Paso 1: Crear una "Fuente de la Verdad"**:
  - Se realiza una primera llamada al modelo de texto (`googleai/gemini-2.0-flash`) con un prompt genérico para que genere un resumen estructurado y detallado sobre el tema solicitado por el usuario. La complejidad (básico, intermedio, avanzado) ajusta la longitud de este resumen.

- **Paso 2: Convertir a JSON Estructurado**:
  - El resumen del Paso 1 se inyecta en un segundo **prompt muy estricto y detallado**.
  - Este segundo prompt le ordena a la IA que convierta el texto del resumen en una estructura JSON específica para el diagrama solicitado (mapa mental, tabla, etc.), usando `output: { schema: ... }`.
  - El prompt incluye reglas explícitas sobre el número de nodos, el formato de los IDs, la necesidad de generar coordenadas de posición (`top`, `left`), y exige que la salida sea **únicamente el objeto JSON válido**.

Esta estrategia de dos pasos es crucial para obtener datos consistentes que el frontend pueda renderizar correctamente.
