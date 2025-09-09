
'use server';
/**
 * @fileOverview A flow to generate a DOCX document from an activity object.
 * This flow uses the 'docx' library to build a Word document from scratch,
 * ensuring high-quality formatting and embedding of images.
 *
 * - generateActivityDocument - The main function to trigger the DOCX generation.
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
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
  BorderStyle,
} from 'docx';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Activity } from '@/types';

// Define Zod schemas for input and output
const GenerateActivityDocumentInputSchema = z.custom<Activity>();
const GenerateActivityDocumentOutputSchema = z.object({
  docxBase64: z.string().describe('The generated DOCX file as a Base64 encoded string.'),
});

/**
 * Parses a string with markdown-style bolding (**text**) into an array of TextRun objects.
 * @param text The input string.
 * @returns An array of TextRun objects with appropriate bolding.
 */
const createTextRunsFromMarkdown = (text: string): TextRun[] => {
    if (!text || typeof text !== 'string') return [];
    
    // Unified regex to handle **bold** and *bold:*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*:)/g).filter(part => part);
    return parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({
                text: part.slice(2, -2),
                bold: true,
                font: 'Arial',
                size: 22, // 11pt
            });
        }
        if (part.startsWith('*') && part.endsWith('*:')) {
            return new TextRun({
                text: part.slice(1, -1),
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


/**
 * Creates an array of Paragraphs from a given text string, parsing markdown bolding.
 * Each line break in the text results in a new Paragraph.
 * @param text - The text to be converted.
 * @returns An array of Paragraph objects.
 */
const createParagraphsFromText = (text: string): Paragraph[] => {
  if (!text || typeof text !== 'string') return [];
  // Split by newline, but also handle the case where the AI might add a hyphen for reflection questions
  const lines = text.split('\n').map(line => line.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
  if (lines.length === 0) return [];
  return lines.map(line => new Paragraph({
      children: createTextRunsFromMarkdown(line),
      spacing: { after: 120 } // Spacing after paragraph
  }));
};

/**
 * Creates a numbered list (array of Paragraphs) from a text string, parsing markdown bolding.
 * It intelligently splits items and handles nested bullet points starting with a hyphen.
 * @param text - The text to be converted into a list.
 * @param numberingRef - The reference ID for the numbering style to use.
 * @returns An array of Paragraph objects formatted as a numbered list.
 */
const createIntelligentList = (text: string, numberingRef: string): Paragraph[] => {
    if (!text || typeof text !== 'string') return [];

    const paragraphs: Paragraph[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const trimmedLine = line.trim();
        const isSubItem = trimmedLine.startsWith('-');

        if (isSubItem) {
            // It's a sub-item, render as a bullet point with indentation
            paragraphs.push(new Paragraph({
                children: createTextRunsFromMarkdown(trimmedLine.substring(1).trim()),
                bullet: {
                    level: 0,
                },
                indent: { left: 720 }, // Indent sub-items (720 dxa = 0.5 inch)
                spacing: { after: 120 }
            }));
        } else {
            // It's a main numbered item
            const itemText = trimmedLine.replace(/^\d+\.?\s*/, '');
             paragraphs.push(new Paragraph({
                children: createTextRunsFromMarkdown(itemText),
                numbering: {
                    reference: numberingRef,
                    level: 0,
                },
                spacing: { after: 120 }
            }));
        }
    });

    return paragraphs;
};

// Define the Genkit flow
const generateActivityDocumentFlow = ai.defineFlow(
  {
    name: 'generateActivityDocumentFlow',
    inputSchema: GenerateActivityDocumentInputSchema,
    outputSchema: GenerateActivityDocumentOutputSchema,
  },
  async (activity) => {
    // --- 1. Load Logo Images ---
    const logoUnicorPath = path.join(process.cwd(), 'public', 'logo_unicor.png');
    const logoEscudoPath = path.join(process.cwd(), 'public', 'escudo.jpg');

    const [logoUnicorBuffer, logoEscudoBuffer] = await Promise.all([
        fs.readFile(logoUnicorPath),
        fs.readFile(logoEscudoPath)
    ]);
    
    // --- 2. Create Header Table ---
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
                    // Right Cell: School Logo and Text
                    new TableCell({
                        children: [
                           new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new ImageRun({
                                        data: logoEscudoBuffer,
                                        transformation: { width: 64, height: 64 },
                                    }),
                                ],
                                spacing: { after: 120 },
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "I.E. Alfonso Spath Spath", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 120 },
                            }),
                             new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Martinez - Cereté, Córdoba", size: 20, font: "Arial" })],
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
    
    // --- 3. Build Document Content ---
    const doc = new Document({
      creator: "EduSpark AI",
      title: activity.title,
      styles: {
        default: {
            document: {
                run: {
                    font: "Arial",
                },
            },
        },
        paragraphStyles: [
            {
                id: "section-title",
                name: "Section Title",
                basedOn: "Normal",
                next: "Normal",
                run: {
                    size: 24, // 12pt
                    bold: true,
                    color: "229954",
                    font: "Arial",
                },
                paragraph: {
                    spacing: { before: 240, after: 120 },
                },
            },
        ],
      },
      numbering: {
        config: [
          { reference: 'numbering-list', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START }] },
        ],
      },
      sections: [
        {
          children: [
            headerTable,
            new Paragraph({ 
                children: [new TextRun({ text: activity.title, size: 30, bold: true, font: "Arial" })], 
                heading: HeadingLevel.TITLE, 
                alignment: AlignmentType.CENTER,
                spacing: { after: 480, before: 480 }
            }),

            new Paragraph({ text: "🎯 Objetivo de Aprendizaje", style: "section-title" }),
            ...createParagraphsFromText(activity.objective),

            new Paragraph({ text: "🧠 Concepto de Pensamiento Computacional", style: "section-title" }),
            ...createParagraphsFromText(activity.computationalConcept),

            new Paragraph({ text: "⏰ Tiempo Estimado", style: "section-title" }),
            ...createParagraphsFromText(activity.estimatedTime),

            new Paragraph({ text: "📋 Preparación Previa del Docente", style: "section-title" }),
            ...createIntelligentList(activity.teacherPreparation, 'numbering-list'),

            new Paragraph({ text: "✅ Materiales Necesarios", style: "section-title" }),
            ...createIntelligentList(activity.materials, 'numbering-list'),

            new Paragraph({ text: "👣 Desarrollo Paso a Paso", style: "section-title" }),
            ...createIntelligentList(activity.stepByStepDevelopment, 'numbering-list'),

            new Paragraph({ text: "👀 Ejemplos Visuales Sugeridos", style: "section-title" }),
            ...createParagraphsFromText(activity.visualExamples),

            new Paragraph({ text: "👍 Reflexión y Conexión", style: "section-title" }),
            ...createParagraphsFromText(activity.reflectionQuestion),

            new Paragraph({ text: "🧑‍🏫 Criterios de Evaluación", style: "section-title" }),
            ...createIntelligentList(activity.evaluationCriteria, 'numbering-list'),
          ],
        },
      ],
    });

    // --- 4. Pack and Encode Document ---
    const buffer = await Packer.toBuffer(doc);
    const docxBase64 = buffer.toString('base64');

    return { docxBase64 };
  }
);

// Export the wrapper function to be called from the client
export async function generateActivityDocument(
  input: Activity
): Promise<z.infer<typeof GenerateActivityDocumentOutputSchema>> {
  return generateActivityDocumentFlow(input);
}
