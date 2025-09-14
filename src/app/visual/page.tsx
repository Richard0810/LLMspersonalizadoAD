
'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Image as ImageIcon } from 'lucide-react';

export default function VisualContentPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-8">
        <InteractiveBackground />
        <main className="w-full max-w-2xl z-10 animate-fade-in">
          <Card className="w-full shadow-2xl">
            <CardHeader className="text-center">
              <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
                <ImageIcon className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline text-primary">Contenido Visual</CardTitle>
              <CardDescription className="text-muted-foreground">
                Próximamente: Herramientas para generar imágenes, diagramas y más.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Esta sección está en desarrollo. Aquí podrás crear contenido visual para enriquecer tus actividades educativas.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </AppShell>
  );
}
