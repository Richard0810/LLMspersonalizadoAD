
'use server';
/**
 * @fileOverview A flow to generate a DOCX document from an activity object.
 * This flow uses the 'docx' library to build a Word document from scratch,
 * ensuring high-quality formatting and embedding of images.
 *
 * - generateActivityDocument - The main function to trigger the DOCX generation.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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
  VerticalAlign,
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

    const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
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


/**
 * Creates an array of Paragraphs from a given text string, parsing markdown bolding.
 * Each line break in the text results in a new Paragraph.
 * @param text - The text to be converted.
 * @returns An array of Paragraph objects.
 */
const createParagraphsFromText = (text: string): Paragraph[] => {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  return lines.map(line => new Paragraph({
      children: createTextRunsFromMarkdown(line),
      spacing: { after: 120 } // Spacing after paragraph
  }));
};

/**
 * Creates a numbered list (array of Paragraphs) from a text string, parsing markdown bolding.
 * Each line in the text becomes a numbered item.
 * @param text - The text to be converted into a list.
 * @returns An array of Paragraph objects formatted as a numbered list.
 */
const createNumberedList = (text: string): Paragraph[] => {
    if (!text || typeof text !== 'string') return [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    return lines.map((line) =>
        new Paragraph({
            children: createTextRunsFromMarkdown(line),
            numbering: {
                reference: 'default-numbering',
                level: 0,
            },
            spacing: { after: 120 }
        })
    );
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
    const borderStyle = {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "000000",
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
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Licenciatura en Informática", bold: true, size: 22, font: "Arial" })],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Facultad de Educación y Ciencias Humanas", size: 20, font: "Arial" })],
                            }),
                        ],
                        verticalAlign: VerticalAlign.CENTER,
                        borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
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
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "I.E. Alfonso Spath Spath", bold: true, size: 22, font: "Arial" })],
                            }),
                             new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "Martinez - Cereté, Córdoba", size: 20, font: "Arial" })],
                            }),
                        ],
                         verticalAlign: VerticalAlign.CENTER,
                         borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
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
          {
            reference: 'default-numbering',
            levels: [
              {
                level: 0,
                format: 'decimal',
                text: '%1.',
                alignment: AlignmentType.START,
              },
            ],
          },
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
                spacing: { after: 400, before: 200 }
            }),

            new Paragraph({ text: "Objetivo de Aprendizaje", style: "section-title" }),
            ...createParagraphsFromText(activity.objective),

            new Paragraph({ text: "Concepto de Pensamiento Computacional", style: "section-title" }),
            ...createParagraphsFromText(activity.computationalConcept),

            new Paragraph({ text: "Tiempo Estimado", style: "section-title" }),
            ...createParagraphsFromText(activity.estimatedTime),

            new Paragraph({ text: "Preparación Previa del Docente", style: "section-title" }),
            ...createParagraphsFromText(activity.teacherPreparation),

            new Paragraph({ text: "Materiales Necesarios", style: "section-title" }),
            ...createParagraphsFromText(activity.materials),

            new Paragraph({ text: "Desarrollo Paso a Paso", style: "section-title" }),
            ...createNumberedList(activity.stepByStepDevelopment),

            new Paragraph({ text: "Ejemplos Visuales Sugeridos", style: "section-title" }),
            ...createParagraphsFromText(activity.visualExamples),

            new Paragraph({ text: "Reflexión y Conexión", style: "section-title" }),
            ...createParagraphsFromText(activity.reflectionQuestion),

            new Paragraph({ text: "Criterios de Evaluación", style: "section-title" }),
            ...createParagraphsFromText(activity.evaluationCriteria),
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
