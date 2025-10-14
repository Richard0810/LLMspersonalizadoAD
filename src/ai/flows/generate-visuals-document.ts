
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

// A simple regex-based HTML to text converter.
const htmlToText = (html: string | null): string => {
    if (!html) return '';
    return html
        .replace(/<style([\s\S]*?)<\/style>/gi, '')
        .replace(/<script([\s\S]*?)<\/script>/gi, '')
        .replace(/<[^>]+>/g, '\n') // Replace tags with newlines
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with a single one
        .trim();
};


const generateVisualsDocumentFlow = ai.defineFlow(
  {
    name: 'generateVisualsDocumentFlow',
    inputSchema: GenerateVisualsDocumentInputSchema,
    outputSchema: GenerateVisualsDocumentOutputSchema,
  },
  async (visualItems) => {
    // --- 1. Load logo assets ---
    let logoUnicorBuffer: Buffer;
    let logoEscudoBuffer: Buffer;
    const fallbackImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

    try {
        const unicorPath = path.join(process.cwd(), 'public', 'logo_unicor.png');
        logoUnicorBuffer = await fs.readFile(unicorPath);
    } catch (error) {
        logoUnicorBuffer = fallbackImage;
    }

    try {
        const escudoPath = path.join(process.cwd(), 'public', 'escudo.jpg');
        logoEscudoBuffer = await fs.readFile(escudoPath);
    } catch (error) {
        logoEscudoBuffer = fallbackImage;
    }
    
    // --- 2. Create Header ---
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
                    new TableCell({
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: logoUnicorBuffer, transformation: { width: 180, height: 60 } })] })],
                        borders: invisibleBorderStyle, width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: logoEscudoBuffer, transformation: { width: 64, height: 64 } })] })],
                         borders: invisibleBorderStyle, width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                ],
            }),
        ],
    });

    const documentChildren: (Paragraph | ImageRun | Table)[] = [
        headerTable,
        new Paragraph({ text: "Recursos y Apoyos Visuales para la Actividad", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 480, before: 480 } }),
    ];

    // --- 3. Process each visual item ---
    for (const item of visualItems) {
        if (!item.htmlContent && !item.imageUrl) {
            continue; // Skip empty items
        }

        // Add the original resource text as a subtitle
        documentChildren.push(
            new Paragraph({
                children: [new TextRun({ text: item.text, bold: true, italics: true, color: "555555" })],
                style: "section-title",
                spacing: { before: 400, after: 200 }
            })
        );
        
        // If there's an image, fetch and embed it
        if (item.imageUrl) {
            try {
                // Assuming imageUrl is a data URI
                const base64Data = item.imageUrl.split(',')[1];
                if (base64Data) {
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
                }
            } catch (error) {
                console.error("Failed to process image data URI:", error);
                documentChildren.push(new Paragraph({ text: "[Error al incrustar la imagen]", style: "section-title" }));
            }
        }
        
        // If there's HTML content, convert it to simple text paragraphs
        if (item.htmlContent) {
            const textFromHtml = htmlToText(item.htmlContent);
            const lines = textFromHtml.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                documentChildren.push(new Paragraph({ text: line, spacing: { after: 120 } }));
            });
        }
        
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
                run: { size: 24, bold: true, color: "229954" },
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
