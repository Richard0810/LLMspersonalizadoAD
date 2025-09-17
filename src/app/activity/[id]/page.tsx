
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, ListChecks, BookOpen, Target, ThumbsUp, Sparkles, Loader2, Clock, ClipboardCheck, Brain, Eye, UserCheck, FileDown } from 'lucide-react';
import type { Activity, GeneratedActivityVisuals } from '@/types';
import { getActivityByIdFromLocalStorage } from '@/lib/localStorageUtils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generateActivityVisuals } from '@/ai/flows/generate-activity-visuals';
import { generateActivityDocument } from '@/ai/flows/generate-activity-document';
import Image from 'next/image';
import WordIcon from '@/components/icons/WordIcon';

interface SectionContentProps {
  title: string;
  icon: ReactNode;
  content?: string;
  generatedContent?: { text: string; imageUrl: string | null }[];
  className?: string;
}

const SectionContent: React.FC<SectionContentProps> = ({ title, icon, content, generatedContent, className = "" }) => {
  const formatWithBold = (text: string) => {
    // Handles both **word** and *word:* and cleans up leading hyphens
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?):\*/g, '<strong>$1:</strong>')
      .replace(/^\s*-\s*/, '');
  };

  const formatContent = (text: string | undefined, listType: 'bullet' | 'numeric' | 'paragraph') => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return null;

    if (listType === 'bullet') {
      return (
        <ul className="list-none pl-5 space-y-1">
          {lines.map((line, index) => (
            <li 
              key={index} 
              className="text-muted-foreground whitespace-pre-line relative before:content-['-_'] before:absolute before:left-[-1.25rem] before:top-0 before:text-primary before:font-bold"
              dangerouslySetInnerHTML={{ __html: formatWithBold(line) }} 
            />
          ))}
        </ul>
      );
    }
    
    if (listType === 'numeric') {
        const stepRegex = /^\(?\d+\.?|^\(\d+.*?\)/; // Matches "1.", "1", "(1...)"
        
        // For Criterios, just split by lines
        if (title === "Criterios de Evaluación") {
          return (
             <ol className="list-decimal list-outside pl-5 space-y-2">
                {lines.map((line, index) => (
                  <li key={index} className="text-muted-foreground whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: formatWithBold(line) }} 
                  />
                ))}
            </ol>
          );
        }

      // For Step by Step Development
      const groupedLines: string[][] = [];
      let currentGroup: string[] = [];

      lines.forEach(line => {
        if (stepRegex.test(line.trim())) {
          if (currentGroup.length > 0) {
            groupedLines.push(currentGroup);
          }
          currentGroup = [line];
        } else {
          if (currentGroup.length > 0) {
            currentGroup.push(line);
          } else {
             // Handle case where first line is not a step
             currentGroup = [line];
          }
        }
      });
      if (currentGroup.length > 0) {
        groupedLines.push(currentGroup);
      }

      return (
        <ol className="list-decimal list-outside pl-5 space-y-4">
          {groupedLines.map((group, groupIndex) => (
            <li key={groupIndex} className="text-muted-foreground whitespace-pre-line">
              {group.map((line, lineIndex) => {
                 const formattedLine = formatWithBold(line.replace(stepRegex, '').trim());
                 return <p key={lineIndex} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
              })}
            </li>
          ))}
        </ol>
      );
    }

    // Default paragraph rendering
    return lines.map((line, index) => (
        <p 
          key={index} 
          className="text-muted-foreground whitespace-pre-line" 
          dangerouslySetInnerHTML={{ __html: formatWithBold(line) }} 
        />
    ));
  };
  
  const getListType = (title: string): 'bullet' | 'numeric' | 'paragraph' => {
      const bulletSections = ["Materiales Necesarios", "Preparación Previa del Docente", "Ejemplos Visuales Sugeridos", "Criterios de Evaluación"];
      const numericSections = ["Desarrollo Paso a Paso"];
      if (bulletSections.includes(title)) return 'bullet';
      if (numericSections.includes(title)) return 'numeric';
      return 'paragraph';
  }

  const listType = getListType(title);

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold flex items-center gap-2 text-accent font-headline mb-2">
        {icon} {title}
      </h3>
      {generatedContent && generatedContent.length > 0 ? (
        <div className="space-y-4">
          {generatedContent.map((item, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg border border-primary/20">
              <p
                className="text-muted-foreground whitespace-pre-line mb-3"
                dangerouslySetInnerHTML={{ __html: formatWithBold(item.text) }}
              />
              {item.imageUrl && (
                <div className="mt-2 text-center border-t border-dashed pt-3">
                  <Image 
                    src={item.imageUrl} 
                    alt={`Ilustración para: ${item.text.substring(0, 50)}`} 
                    width={400} 
                    height={400} 
                    className="rounded-md shadow-md mx-auto"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        formatContent(content, listType)
      )}
    </div>
  );
};


export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedActivityVisuals | null>(null);

  useEffect(() => {
    if (params.id) {
      const activityId = Array.isArray(params.id) ? params.id[0] : params.id;
      const fetchedActivity = getActivityByIdFromLocalStorage(activityId);
      setActivity(fetchedActivity);
    }
    setIsLoading(false);
  }, [params.id]);

  const handleGenerateVisualContent = async () => {
    if (!activity) return;
    setIsGeneratingContent(true);

    toast({
      title: "Generación en Proceso",
      description: "La IA está analizando la actividad y creando contenido visual. Esto puede tardar unos minutos...",
    });

    try {
      const visualResult = await generateActivityVisuals({
        materials: activity.materials,
        instructions: activity.stepByStepDevelopment,
        reflection: activity.reflectionQuestion,
        visualExamples: activity.visualExamples,
      });
      
      setGeneratedContent(visualResult);
      toast({
        title: "¡Contenido Visual Generado!",
        description: "Los recursos visuales para tu actividad están listos.",
        className: 'bg-green-100 border-green-400 text-green-800'
      });

    } catch (error) {
      console.error("Error generando contenido visual de la actividad:", error);
      toast({
        title: "Error de Generación",
        description: `No se pudo generar el contenido. ${error instanceof Error ? error.message : 'Error desconocido.'}`,
        variant: "destructive",
      });
    } finally {
        setIsGeneratingContent(false);
    }
  };

  const handleDownload = async () => {
    if (!activity) return;

    setIsDownloading(true);
    toast({
        title: "Preparando Descarga...",
        description: "El documento de Word se está generando en el servidor. Esto puede tardar unos segundos.",
    });

    try {
        const result = await generateActivityDocument(activity);
        
        if (!result.docxBase64) {
            throw new Error("El servidor no devolvió un archivo.");
        }

        // Convert Base64 to a Blob
        const byteCharacters = atob(result.docxBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        // Create a link and trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${activity.title.replace(/[^a-zA-Z0-9_ ]/g, '') || 'Actividad'}.docx`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "¡Descarga Exitosa!",
            description: `Se ha descargado "${fileName}".`,
        });

    } catch (error) {
        console.error("Error al descargar el documento:", error);
        toast({
            title: "Error de Descarga",
            description: `No se pudo generar el documento. ${error instanceof Error ? error.message : 'Error desconocido.'}`,
            variant: "destructive",
        });
    } finally {
        setIsDownloading(false);
    }
  };
  
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8 animate-fade-in">
          <InteractiveBackground />
          <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!activity) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <InteractiveBackground />
          <Card className="w-full max-w-md text-center shadow-xl">
            <CardHeader>
                <Sparkles className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle className="text-2xl font-headline text-destructive">Actividad No Encontrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">La actividad que estás buscando no existe o no pudo ser cargada.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Chat
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center min-h-screen bg-background p-4 md:p-8 animate-fade-in">
        <InteractiveBackground />
        <main className="w-full max-w-3xl z-10">
        <Button onClick={() => router.back()} variant="outline" className="mb-6 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
        </Button>
        <Card className="w-full shadow-2xl">
          <CardHeader className="bg-primary/5 p-6 rounded-t-lg">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline text-primary">{activity.title}</CardTitle>
             </div>
            <CardDescription className="text-base text-foreground/80 whitespace-pre-line">{activity.objective}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            
            <SectionContent
                title="Concepto de Pensamiento Computacional"
                icon={<Brain className="h-6 w-6" />}
                content={activity.computationalConcept}
              />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SectionContent
                title="Tiempo Estimado"
                icon={<Clock className="h-6 w-6" />}
                content={activity.estimatedTime}
              />
              <SectionContent
                title="Preparación Previa del Docente"
                icon={<ClipboardCheck className="h-6 w-6" />}
                content={activity.teacherPreparation}
              />
            </div>

            <SectionContent
              title="Materiales Necesarios"
              icon={<ListChecks className="h-6 w-6" />}
              content={activity.materials}
              generatedContent={generatedContent?.materials}
            />
            <SectionContent
              title="Desarrollo Paso a Paso"
              icon={<Target className="h-6 w-6" />}
              content={activity.stepByStepDevelopment}
              generatedContent={generatedContent?.instructions}
            />
            <SectionContent
              title="Ejemplos Visuales Sugeridos"
              icon={<Eye className="h-6 w-6" />}
              content={activity.visualExamples}
              generatedContent={generatedContent?.visualExamples}
            />
            <SectionContent
              title="Reflexión y Conexión"
              icon={<ThumbsUp className="h-6 w-6" />}
              content={activity.reflectionQuestion}
              generatedContent={generatedContent?.reflection}
            />
            <SectionContent
              title="Criterios de Evaluación"
              icon={<UserCheck className="h-6 w-6" />}
              content={activity.evaluationCriteria}
            />
          </CardContent>
          <CardFooter className="border-t p-6 flex-wrap gap-2 justify-between">
             <Button onClick={handleGenerateVisualContent} disabled={isGeneratingContent || isDownloading} className="text-lg py-3 px-6">
              {isGeneratingContent ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {isGeneratingContent ? 'Generando...' : 'Crear Contenido Visual'}
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading || isGeneratingContent} variant="secondary" className="text-lg py-3 px-6 text-primary hover:text-primary/90">
              {isDownloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WordIcon className="mr-2 h-5 w-5" />}
              {isDownloading ? 'Generando DOCX...' : 'Descargar (DOCX)'}
            </Button>
          </CardFooter>
        </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
