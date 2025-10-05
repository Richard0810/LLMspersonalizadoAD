
'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Beaker, Code, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSvgAction } from './actions';
import type { SvgGenerationInput } from '@/types';

const componentTypes = [
  { id: 'carta_pregunta', name: 'Carta de Pregunta' },
  { id: 'carta_accion', name: 'Carta de Acción' },
  { id: 'diagrama_ciclo_agua', name: 'Diagrama: Ciclo del Agua' },
  { id: 'diagrama_flujo_simple', name: 'Diagrama: Flujo Simple' },
];

const colors = [
  { id: '#e74c3c', name: 'Rojo' },
  { id: '#28a745', name: 'Verde' },
  { id: '#17a2b8', name: 'Azul' },
  { id: '#ffc107', name: 'Amarillo' },
  { id: '#6f42c1', name: 'Morado' },
  { id: '#fd7e14', name: 'Naranja' },
  { id: '#20c997', name: 'Menta' },
];

export default function SvgLabPage() {
  const [componentType, setComponentType] = useState<SvgGenerationInput['componentType']>('carta_pregunta');
  const [color, setColor] = useState<SvgGenerationInput['color']>('#28a745');
  const [title, setTitle] = useState('Pregunta de Ciencias');
  const [content, setContent] = useState('¿Qué es la fotosíntesis?');
  const [icon, setIcon] = useState('❓');

  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedSvg(null);

    const input: SvgGenerationInput = {
      componentType,
      color,
      title,
      content,
      icon,
    };
    
    const result = await generateSvgAction(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setGeneratedSvg(result.data.svgCode);
      toast({
        title: "¡SVG Generado!",
        description: `Tu componente SVG está listo.`
      });
    } else {
      const errorMessage = result.error || "Ocurrió un error desconocido durante la generación.";
      setError(errorMessage);
      toast({
        title: "Error de Generación",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 animate-fade-in">
        <header className="text-center w-full mb-10">
          <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
            <Beaker className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline">
            Laboratorio de Creación SVG
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
            Genera componentes SVG dinámicamente con IA, basados en la guía de diseño.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 shadow-lg">
            <CardHeader>
              <CardTitle>1. Parámetros de Generación</CardTitle>
              <CardDescription>Configura las opciones para tu componente SVG.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="componentType">Tipo de Componente</Label>
                  <Select value={componentType} onValueChange={(v) => setComponentType(v as any)}>
                    <SelectTrigger id="componentType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {componentTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color Principal</Label>
                  <Select value={color} onValueChange={(v) => setColor(v as any)}>
                    <SelectTrigger id="color"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {colors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="title">Título Personalizado</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Pregunta de Ciencias" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="content">Contenido Personalizado</Label>
                    <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ej: ¿Qué es la fotosíntesis?" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="icon">Icono / Símbolo</Label>
                    <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ej: ❓, 🚀, estrella, flecha" />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Generar SVG'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle>2. Resultado</CardTitle>
              <CardDescription>Aquí puedes ver la vista previa y el código del SVG generado.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {generatedSvg && !isLoading && (
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview"><Eye className="mr-2" />Vista Previa</TabsTrigger>
                    <TabsTrigger value="code"><Code className="mr-2" />Código SVG</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4 p-4 border rounded-md bg-muted/30 flex justify-center items-center">
                    <div className="w-full max-w-md" dangerouslySetInnerHTML={{ __html: generatedSvg }} />
                  </TabsContent>
                  <TabsContent value="code" className="mt-4">
                    <pre className="p-4 border rounded-md bg-gray-900 text-green-300 text-xs overflow-auto h-96">
                      <code>
                        {generatedSvg}
                      </code>
                    </pre>
                  </TabsContent>
                </Tabs>
              )}
               {!generatedSvg && !isLoading && !error && (
                  <div className="flex flex-col justify-center items-center h-64 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <Beaker className="h-12 w-12 mb-2" />
                      <p>El resultado de tu experimento aparecerá aquí.</p>
                  </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
