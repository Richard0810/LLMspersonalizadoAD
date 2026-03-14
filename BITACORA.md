# Bitácora Técnica: Módulo de Generación de Contenido Visual

Este documento sirve como "fuente de la verdad" y guía de solución de problemas para el módulo de generación de contenido visual.

## I. Arquitectura General

El módulo funciona en base a una interacción Frontend -> Backend (Genkit)
1.  **Frontend (`/visual/page.tsx`):** El usuario selecciona una categoría y formato, llena un formulario.
2.  **Server Action (`/visual/actions.ts`):** La acción se dispara, validando la entrada del usuario.
3.  **Flujo de Genkit (`/ai/flows/generate-visual-content.ts`):** La Server Action invoca el flujo principal de Genkit, que contiene la lógica de IA.
4.  **Respuesta al Frontend:** El resultado (imagen, JSON, HTML) se devuelve al frontend para ser renderizado por `OutputDisplay.tsx`.

## II. Lógica del Flujo de IA y Modelos Correctos

**ACTUALIZACIÓN MARZO 2026:** Se ha migrado a la familia de modelos Gemini 2.5 debido a la descontinuación de las versiones 2.0.

### 1. Para Generación de Imágenes y Texto

- **Modelo a Utilizar:** Se utiliza el modelo estable y de alta disponibilidad.
  - **Correcto:** `model: 'gemini-2.5-flash'`
  - **Inmportante:** Al usar el plugin `@genkit-ai/google-genai`, el identificador directo es suficiente.

- **Parámetros de Configuración Clave:** Para que el modelo devuelva una imagen, es **OBLIGATORIO** especificar las modalidades de respuesta.
  - **Correcto:** `config: { responseModalities: ['TEXT', 'IMAGE'] }`

**Ejemplo de llamada `ai.generate` correcta:**
```javascript
const { media } = await ai.generate({
    model: 'gemini-2.5-flash',
    prompt: fullPrompt,
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
});
```

## III. Proceso para Diagramas

La generación de diagramas utiliza una estrategia de dos pasos con `gemini-2.5-flash` para asegurar que el resumen sea preciso y el JSON resultante sea válido y compatible con los componentes de visualización del frontend.
