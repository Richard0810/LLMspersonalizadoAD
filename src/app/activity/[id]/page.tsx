
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, ListChecks, BookOpen, Target, ThumbsUp, Sparkles, Loader2, Clock, ClipboardCheck, Brain, Eye, UserCheck } from 'lucide-react';
import type { Activity, VisualContent } from '@/types';
import { getActivityByIdFromLocalStorage } from '@/lib/localStorageUtils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generateVisualContent } from '@/ai/flows/generate-visual-content';
import Image from 'next/image';

const SectionContent = ({ title, icon, content, generatedContent, className = "" }) => {
  // Helper to convert markdown bold to strong tags
  const createMarkup = (text) => {
    if (!text) return { __html: '' };
    const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: htmlText };
  };

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold flex items-center gap-2 text-accent font-headline mb-2">
        {icon} {title}
      </h3>
      {generatedContent ? (
        <div className="space-y-4">
          {generatedContent.map((item, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg">
              <p
                className="text-muted-foreground whitespace-pre-line mb-2"
                dangerouslySetInnerHTML={createMarkup(item.step)}
              />
              {item.image && (
                <div className="mt-2 text-center">
                  <Image 
                    src={item.image} 
                    alt={`Ilustración para: ${item.step.substring(0, 50)}`} 
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
        <p
          className="text-muted-foreground whitespace-pre-line"
          dangerouslySetInnerHTML={createMarkup(content)}
        />
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
  const [generatedContent, setGeneratedContent] = useState<VisualContent | null>(null);

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
      description: "La IA está creando el contenido visual. Esto puede tardar un momento...",
    });

    try {
      const visualResult = await generateVisualContent({
        materials: activity.materials,
        instructions: activity.stepByStepDevelopment,
        reflection: activity.reflectionQuestion,
      });
      
      setGeneratedContent(visualResult);
      toast({
        title: "¡Contenido Generado!",
        description: "El contenido visual está listo.",
      });

    } catch (error) {
      console.error("Error generando contenido:", error);
      toast({
        title: "Error de Generación",
        description: `No se pudo generar el contenido. ${error instanceof Error ? error.message : 'Error desconocido.'}`,
        variant: "destructive",
      });
    } finally {
        setIsGeneratingContent(false);
    }
  };

  const handleDownload = () => {
    if (!activity) return;

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${activity.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333; }
            h1 { color: #229954; }
            h2 { color: #D94444; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            p { margin-bottom: 10px; white-space: pre-wrap; }
            .section { margin-bottom: 20px; }
            img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${activity.title}</h1>
          
          <div class="section">
            <h2>Objetivo de Aprendizaje</h2>
            <p>${activity.objective}</p>
          </div>

          <div class="section">
            <h2>Concepto de Pensamiento Computacional</h2>
            <p>${activity.computationalConcept}</p>
          </div>

           <div class="section">
            <h2>Tiempo Estimado</h2>
            <p>${activity.estimatedTime}</p>
          </div>

           <div class="section">
            <h2>Preparación Previa del Docente</h2>
            <p>${activity.teacherPreparation}</p>
          </div>
          
          <div class="section">
            <h2>Materiales Necesarios</h2>
            ${generatedContent?.materials.map(item => `<p>${item.step}</p>${item.image ? `<img src="${item.image}" alt="Ilustración">` : ''}`).join('') || `<p>${activity.materials}</p>`}
          </div>
          
          <div class="section">
            <h2>Desarrollo Paso a Paso</h2>
            ${generatedContent?.instructions.map(item => `<p>${item.step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>${item.image ? `<img src="${item.image}" alt="Ilustración">` : ''}`).join('') || `<p>${activity.stepByStepDevelopment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`}
          </div>

           <div class="section">
            <h2>Ejemplos Visuales Sugeridos</h2>
            <p>${activity.visualExamples}</p>
          </div>
          
          <div class="section">
            <h2>Reflexión y Conexión</h2>
             ${generatedContent?.reflection.map(item => `<p>${item.step}</p>${item.image ? `<img src="${item.image}" alt="Ilustración">` : ''}`).join('') || `<p>${activity.reflectionQuestion}</p>`}
          </div>

           <div class="section">
            <h2>Criterios de Evaluación</h2>
            <p>${activity.evaluationCriteria}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${activity.title.replace(/[^a-zA-Z0-9_ ]/g, '') || 'Actividad'}.html`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Descarga Iniciada",
      description: `Se ha descargado "${fileName}". Puedes abrir este archivo HTML con Word o un navegador.`,
    });
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
             <Button onClick={handleGenerateVisualContent} disabled={isGeneratingContent} className="text-lg py-3 px-6">
              {isGeneratingContent ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              {isGeneratingContent ? 'Generando...' : 'Crear Contenido Visual'}
            </Button>
            <Button onClick={() => handleDownload()} variant="secondary" className="text-lg py-3 px-6">
              <Download className="mr-2 h-5 w-5" /> Descargar (HTML)
            </Button>
          </CardFooter>
        </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
