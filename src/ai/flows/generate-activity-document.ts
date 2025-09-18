
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
import type { Activity } from '@/types';

// Define Zod schemas for input and output
const GenerateActivityDocumentInputSchema = z.custom<Activity>();
const GenerateActivityDocumentOutputSchema = z.object({
  docxBase64: z.string().describe('The generated DOCX file as a Base64 encoded string.'),
});

/**
 * Parses a string with markdown-style bolding (**text** or *text:*) into an array of TextRun objects.
 * @param text The input string.
 * @returns An array of TextRun objects with appropriate bolding.
 */
const createTextRunsFromMarkdown = (text: string): TextRun[] => {
    if (!text || typeof text !== 'string') return [];
    
    // Regex to handle **bold**, *bold:* and *Bold:* (case-insensitive for the first letter)
    const parts = text.split(/(\*\*.*?\*\*|\*[a-zA-Z\s]+?:\*)/g).filter(part => part);
    
    return parts.map(part => {
        const isBoldMarkdown = (part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith(':*'));
        
        if (isBoldMarkdown) {
            let cleanText = '';
            if (part.startsWith('**')) {
                cleanText = part.slice(2, -2);
            } else { // Handles *text:* or *Text:*
                cleanText = part.slice(1, -2) + ':';
            }
            
            return new TextRun({
                text: cleanText,
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
 * Creates a bulleted list from a text string.
 * Each item is on a new line and may be preceded by a number, hyphen, or nothing.
 * @param text The text to convert to a bulleted list.
 * @returns An array of Paragraph objects formatted as a bulleted list.
 */
const createBulletedList = (text: string): Paragraph[] => {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split('\n').filter(line => line.trim() !== '');

    return lines.map(line => {
        // Remove any leading numbers or hyphens as we are forcing bullets
        const itemText = line.trim().replace(/^(\d+\.?\s*|-\s*)/, '');
        return new Paragraph({
            children: createTextRunsFromMarkdown(itemText),
            bullet: {
                level: 0,
            },
            spacing: { after: 120 }
        });
    });
};


/**
 * Creates a numbered list for the step-by-step development section.
 * It handles nested "Guion" and "Acciones" and treats time markers as non-numbered headings.
 * @param text - The text to be converted into a list.
 * @param numberingRef - The reference ID for the numbering style.
 * @returns An array of Paragraph objects formatted as a numbered list.
 */
const createStepByStepList = (text: string, numberingRef: string): Paragraph[] => {
    if (!text || typeof text !== 'string') return [];

    const paragraphs: Paragraph[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        const isTimeHeading = /^\(\d+\s*minutos?\)/.test(trimmedLine);
        const isSubItem = /^\*(Guion d|Acciones d)/.test(trimmedLine);
        const isNumberedStep = /^\d+\.?\s*/.test(trimmedLine) && !isTimeHeading;

        if (isTimeHeading) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmedLine, bold: true, font: "Arial", size: 22 })],
                spacing: { after: 120, before: 240 },
            }));
        } else if (isSubItem) {
            paragraphs.push(new Paragraph({
                children: createTextRunsFromMarkdown(trimmedLine),
                indent: { left: 720 }, // Indent sub-items (0.5 inch)
                spacing: { after: 120 },
            }));
        } else if (isNumberedStep) {
            const itemText = trimmedLine.replace(/^\d+\.?\s*/, '');
             paragraphs.push(new Paragraph({
                children: createTextRunsFromMarkdown(itemText),
                numbering: {
                    reference: numberingRef,
                    level: 0,
                },
                spacing: { after: 240 }, // More space after a main step
            }));
        } else {
             // Fallback for any other line
            paragraphs.push(new Paragraph({
                children: createTextRunsFromMarkdown(trimmedLine),
                spacing: { after: 120 }
            }));
        }
    });

    return paragraphs;
};

// Base64 encoded logos
const logoUnicorBase64 = "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";
const logoEscudoBase64 = "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";

// Define the Genkit flow
const generateActivityDocumentFlow = ai.defineFlow(
  {
    name: 'generateActivityDocumentFlow',
    inputSchema: GenerateActivityDocumentInputSchema,
    outputSchema: GenerateActivityDocumentOutputSchema,
  },
  async (activity) => {
    const logoUnicorBuffer = Buffer.from(logoUnicorBase64, 'base64');
    const logoEscudoBuffer = Buffer.from(logoEscudoBase64, 'base64');
    
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
            ...createBulletedList(activity.teacherPreparation),

            new Paragraph({ text: "✅ Materiales Necesarios", style: "section-title" }),
            ...createBulletedList(activity.materials),

            new Paragraph({ text: "👣 Desarrollo Paso a Paso", style: "section-title" }),
            ...createStepByStepList(activity.stepByStepDevelopment, 'numbering-list'),

            new Paragraph({ text: "👀 Ejemplos Visuales Sugeridos", style: "section-title" }),
            ...createBulletedList(activity.visualExamples),

            new Paragraph({ text: "👍 Reflexión y Conexión", style: "section-title" }),
            ...createParagraphsFromText(activity.reflectionQuestion),

            new Paragraph({ text: "🧑‍🏫 Criterios de Evaluación", style: "section-title" }),
            ...createBulletedList(activity.evaluationCriteria),
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
