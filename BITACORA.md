# Bitácora Técnica: Módulo de Generación de Contenido Visual

Este documento sirve como "fuente de la verdad" y guía de solución de problemas para el módulo de generación de contenido visual.

## I. Arquitectura General

El módulo funciona en base a una interacción Frontend -> Backend (Genkit)
1.  **Frontend (`/visual/page.tsx`):** El usuario selecciona una categoría y formato, llena un formulario.
2.  **Server Action (`/visual/actions.ts`):** La acción se dispara, validando la entrada del usuario.
3.  **Flujo de Genkit (`/ai/flows/...`):** La Server Action invoca el flujo correspondiente.
4.  **Respuesta al Frontend:** El resultado (imagen, JSON, HTML) se devuelve al frontend.

## II. Lógica del Flujo de IA y Modelos Correctos

**ACTUALIZACIÓN MARZO 2026:** Se ha migrado a la arquitectura de Genkit 1.x con el plugin `@genkit-ai/google-genai`.

### 1. Generación de Texto y JSON (Actividades, Chat, Resúmenes)

- **Modelo a Utilizar:** `googleai/gemini-2.5-flash`
- **Importante:** Siempre debe llevar el prefijo `googleai/`.

### 2. Generación de Imágenes (Ilustraciones y Apoyos Visuales)

- **Modelo a Utilizar:** `googleai/imagen-3.0-generate-002`
- **Nota:** Este modelo es el motor especializado de dibujo de Google. No requiere `responseModalities` ya que su salida nativa es imagen.

**Ejemplo de llamada correcta para dibujo:**
```javascript
const { media } = await ai.generate({
    model: 'googleai/imagen-3.0-generate-002',
    prompt: fullPrompt,
});
```

## III. Proceso para Diagramas

La generación de diagramas utiliza una estrategia de dos pasos con `googleai/gemini-2.5-flash` para asegurar que el resumen sea preciso y el JSON resultante sea válido y compatible con los componentes de visualización del frontend.
