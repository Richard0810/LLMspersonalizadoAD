
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ListChecks, BookOpen, Target, ThumbsUp, Sparkles, Loader2, Clock, ClipboardCheck, Brain, Eye, UserCheck, FileDown, Layers } from 'lucide-react';
import type { Activity, VisualItem } from '@/types';
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
  generatedContent?: VisualItem[];
  className?: string;
}

const SectionContent: React.FC<SectionContentProps> = ({ title, icon, content, generatedContent, className = "" }) => {
  const renderList = (text: string | undefined) => {
    if (!text) return null;
    const items = text.split('\n').filter(line => line.trim() !== '');
    if (items.length === 0) return null;

    return (
      <ul className="space-y-2">
        {items.map((line, index) => (
          <li
            key={index}
            className="text-muted-foreground whitespace-pre-line relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-primary"
            dangerouslySetInnerHTML={{ __html: line.replace(/^\s*-\s*/, '') }}
          />
        ))}
      </ul>
    );
  };

  const hasGeneratedContent = generatedContent && generatedContent.length > 0;

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold flex items-center gap-2 text-accent font-headline mb-4">
        {icon} {title}
      </h3>
      {hasGeneratedContent ? (
        <div className="space-y-6">
          {generatedContent.map((item, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              {item.htmlContent ? (
                <div dangerouslySetInnerHTML={{ __html: item.htmlContent }} />
              ) : (
                <p
                  className="text-muted-foreground whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
         renderList(content)
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
  const [generatedActivityResources, setGeneratedActivityResources] = useState<VisualItem[] | null>(null);

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
      description: "La IA está analizando los recursos de la actividad y creando contenido visual. Esto puede tardar unos minutos...",
    });

    try {
      const visualResult = await generateActivityVisuals(activity.activityResources);
      
      setGeneratedActivityResources(visualResult);

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

        const byteCharacters = atob(result.docxBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

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
            />
            <SectionContent
              title="Desarrollo Paso a Paso"
              icon={<Target className="h-6 w-6" />}
              content={activity.stepByStepDevelopment}
            />
            <SectionContent
              title="Recursos para la Actividad"
              icon={<Layers className="h-6 w-6" />}
              content={activity.activityResources}
              generatedContent={generatedActivityResources}
            />
            <SectionContent
              title="Reflexión y Conexión"
              icon={<ThumbsUp className="h-6 w-6" />}
              content={activity.reflectionQuestion}
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
