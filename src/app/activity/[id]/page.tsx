
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, ListChecks, BookOpen, Target, ThumbsUp, Sparkles } from 'lucide-react';
import type { Activity } from '@/types';
import { getActivityByIdFromLocalStorage } from '@/lib/localStorageUtils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const activityId = Array.isArray(params.id) ? params.id[0] : params.id;
      const fetchedActivity = getActivityByIdFromLocalStorage(activityId);
      setActivity(fetchedActivity);
    }
    setIsLoading(false);
  }, [params.id]);

  const handleDownload = () => {
    if (!activity) return;

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${activity.activityName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; }
            h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            p { margin-bottom: 10px; white-space: pre-wrap; }
            .section { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${activity.activityName}</h1>
          
          <div class="section">
            <h2>Objetivo de Aprendizaje</h2>
            <p>${activity.learningObjective}</p>
          </div>
          
          <div class="section">
            <h2>Materiales Necesarios</h2>
            <p>${activity.materials}</p>
          </div>
          
          <div class="section">
            <h2>Instrucciones</h2>
            <p>${activity.instructions}</p>
          </div>
          
          <div class="section">
            <h2>Reflexión</h2>
            <p>${activity.reflectionQuestion}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Limpiar el nombre del archivo para evitar caracteres no válidos
    const fileName = `${activity.activityName.replace(/[^a-zA-Z0-9_ ]/g, '') || 'Actividad'}.html`;
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
                <CardTitle className="text-3xl font-headline text-primary">{activity.activityName}</CardTitle>
             </div>
            <CardDescription className="text-base text-foreground/80">{activity.learningObjective}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-accent font-headline">
                <ListChecks className="h-6 w-6" /> Materiales Necesarios
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{activity.materials}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-accent font-headline">
                <Target className="h-6 w-6" /> Instrucciones
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{activity.instructions}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-accent font-headline">
                <ThumbsUp className="h-6 w-6" /> Reflexión
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{activity.reflectionQuestion}</p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-6">
            <Button onClick={handleDownload} className="w-full md:w-auto text-lg py-3 px-6">
              <Download className="mr-2 h-5 w-5" /> Descargar (HTML para Word)
            </Button>
          </CardFooter>
        </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
