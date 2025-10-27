
'use server';
/**
 * @fileOverview A flow to generate a DOCX document from an array of VisualItem objects.
 * This flow is designed to handle both HTML content and image URLs, converting them
 * into a structured Word document.
 *
 * - generateVisualsDocument - The main function to trigger the DOCX generation for visual aids.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import type { VisualItem } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// Define Zod schemas for input and output
const GenerateVisualsDocumentInputSchema = z.array(z.custom<VisualItem>());
const GenerateVisualsDocumentOutputSchema = z.object({
  docxBase64: z.string().describe('The generated DOCX file as a Base64 encoded string.'),
});

/**
 * Parses a string with markdown-style bolding into an array of TextRun objects for docx.
 * This handles simple cases and ensures text is always valid.
 * @param text The input string.
 * @returns An array of TextRun objects.
 */
const createTextRunsFromText = (text: string | null): TextRun[] => {
    if (!text) return [];
    
    // Simple split for demonstration. For real markdown, a more complex parser is needed.
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    
    return parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({
                text: part.slice(2, -2),
                bold: true,
                font: 'Arial',
                size: 22, // 11pt
            });
        }
        return new TextRun({
            text: part,
            font: 'Arial',
            size: 22, // 11pt
        });
    });
};

const generateVisualsDocumentFlow = ai.defineFlow(
  {
    name: 'generateVisualsDocumentFlow',
    inputSchema: GenerateVisualsDocumentInputSchema,
    outputSchema: GenerateVisualsDocumentOutputSchema,
  },
  async (visualItems) => {
    // --- 1. Load logo assets from the filesystem ---
    let logoUnicorBuffer: Buffer;
    let logoEdusparkBuffer: Buffer;
    const fallbackImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'); // 1x1 transparent pixel

    try {
        const unicorPath = path.join(process.cwd(), 'public', 'logo_unicor.png');
        logoUnicorBuffer = await fs.readFile(unicorPath);
    } catch (error) {
        console.error("Could not read Unicor logo, using fallback.", error);
        logoUnicorBuffer = fallbackImage;
    }

    try {
        const edusparkPath = path.join(process.cwd(), 'public', 'Logo Eduspark.jpg');
        logoEdusparkBuffer = await fs.readFile(edusparkPath);
    } catch (error) {
        console.error("Could not read EduSpark logo, using fallback.", error);
        logoEdusparkBuffer = fallbackImage;
    }
    
    // --- 2. Create Header Table (Consistent with the other document generator) ---
    const invisibleBorderStyle = {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    };

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    // Left Cell: Unicor Logo and Text
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: logoUnicorBuffer,
                                        transformation: { width: 180, height: 60 },
                                    }),
                                ],
                                spacing: { after: 120 },
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Licenciatura en Informática", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 120 },
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Facultad de Educación y Ciencias Humanas", size: 20, font: "Arial" })],
                                spacing: { after: 120 },
                            }),
                        ],
                        borders: invisibleBorderStyle,
                        width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    // Right Cell: EduSpark Logo and Text
                    new TableCell({
                        children: [
                           new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: logoEdusparkBuffer,
                                        transformation: { width: 64, height: 64 },
                                    }),
                                ],
                                spacing: { after: 120 },
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "EduSpark AI", bold: true, size: 24, font: "Arial", color: "229954" })],
                                spacing: { after: 120 },
                            }),
                        ],
                         borders: invisibleBorderStyle,
                         width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                ],
            }),
        ],
    });

    const documentChildren: (Paragraph | Table)[] = [
        headerTable,
        new Paragraph({ text: "Recursos y Apoyos Visuales para la Actividad", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 480, before: 480 } }),
    ];

    // --- 3. Process each visual item robustly ---
    for (const item of visualItems) {
        // We only process items that have some content to render.
        if (!item.text && !item.imageUrl) {
            continue; 
        }

        // Add the original resource text as a subtitle. This is safer than parsing HTML.
        if (item.text) {
             documentChildren.push(
                new Paragraph({
                    children: createTextRunsFromText(item.text),
                    style: "section-title",
                    spacing: { before: 400, after: 200 }
                })
            );
        }
        
        // If there's an image, fetch and embed it safely
        if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image/')) {
            try {
                // Find the comma that separates metadata from base64 data
                const commaIndex = item.imageUrl.indexOf(',');
                if (commaIndex === -1 || commaIndex + 1 >= item.imageUrl.length) {
                    throw new Error("Invalid Data URI format: missing comma or data.");
                }

                const base64Data = item.imageUrl.substring(commaIndex + 1);
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                documentChildren.push(
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: imageBuffer,
                                transformation: {
                                    width: 400,
                                    height: 300,
                                },
                            }),
                        ],
                        spacing: { after: 200 }
                    })
                );
            } catch (error) {
                console.error("Failed to process image data URI:", item.imageUrl, error);
                documentChildren.push(new Paragraph({ text: "[Error al incrustar la imagen. El formato de datos podría ser inválido.]", style: "section-title" }));
            }
        }
        
        // Add a separator between items
        documentChildren.push(new Paragraph({ text: '', spacing: { after: 200 }}));
    }

    // --- 4. Build Document ---
    const doc = new Document({
      creator: "EduSpark AI",
      title: "Apoyo Visual de Actividad",
      styles: {
        default: { document: { run: { font: "Arial", size: 22 }}},
        paragraphStyles: [
            {
                id: "section-title",
                name: "Section Title",
                basedOn: "Normal",
                next: "Normal",
                run: { size: 24, bold: true, color: "2E7D32" },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
        ],
      },
      sections: [{ children: documentChildren }],
    });

    // --- 5. Pack and Encode ---
    const buffer = await Packer.toBuffer(doc);
    const docxBase64 = buffer.toString('base64');

    return { docxBase64 };
  }
);

// Export the wrapper function to be called from the client
export async function generateVisualsDocument(
  input: VisualItem[]
): Promise<z.infer<typeof GenerateVisualsDocumentOutputSchema>> {
  return generateVisualsDocumentFlow(input);
}
