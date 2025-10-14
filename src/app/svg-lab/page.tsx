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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Canvg } from 'canvg';

const componentTypes = [
  { id: 'carta_pregunta', name: 'Carta de Pregunta' },
  { id: 'carta_accion', name: 'Carta de Acción' },
  { id: 'tabla_personalizada', name: 'Tabla Personalizada' },
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [numRows, setNumRows] = useState(3);
  const [numCols, setNumCols] = useState(3);
  const [headers, setHeaders] = useState('');

  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('0 Bytes');
  const { toast } = useToast();
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleComponentTypeChange = (value: SvgGenerationInput['componentType']) => {
    setComponentType(value);
    setTitle('');
    setContent('');
    setNumRows(3);
    setNumCols(3);
    setHeaders('');
  };

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
      numRows: componentType === 'tabla_personalizada' ? numRows : undefined,
      numCols: componentType === 'tabla_personalizada' ? numCols : undefined,
      headers: componentType === 'tabla_personalizada' ? headers : undefined,
    };
    
    const result = await generateSvgAction(input);
    setIsLoading(false);

    if (result.success && result.data) {
      setGeneratedSvg(result.data.svgCode);
      const svgBlob = new Blob([result.data.svgCode], { type: 'image/svg+xml' });
      setFileSize(formatBytes(svgBlob.size));
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

  const getFileName = () => {
    return `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || componentType || 'componente'}`;
  };
  
  const performDownload = (blob: Blob, format: 'svg' | 'png' | 'jpeg') => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getFileName()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: `¡Descargado como ${format.toUpperCase()}!`,
        description: `Se ha descargado "${getFileName()}.${format}".`,
      });
  };

  const handleDownload = async (format: 'svg' | 'png' | 'jpeg') => {
      if (!generatedSvg) return;

      try {
          if (format === 'svg') {
              const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
              performDownload(blob, 'svg');
          } else {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error("No se pudo crear el contexto del canvas.");

              const viewBoxMatch = generatedSvg.match(/viewBox="0 0 (\d+\.?\d*) (\d+\.?\d*)"/);
              const width = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 400;
              const height = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 300;
              
              canvas.width = width * 2;
              canvas.height = height * 2;
              
              const v = await Canvg.from(ctx, generatedSvg);
              v.resize(canvas.width, canvas.height, 'xMidYMid meet');
              await v.render();
              
              const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
              const res = await fetch(dataUrl);
              const blob = await res.blob();
              performDownload(blob, format);
          }
      } catch (error) {
          console.error("Error al descargar:", error);
          toast({
              title: "Error de Descarga",
              description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
              variant: 'destructive'
          });
      }
  };

  const getTitlePlaceholder = () => {
    if (componentType === 'carta_pregunta') return 'Ej: Pregunta de Ciencias, Reto Matemático';
    if (componentType === 'carta_accion') return 'Ej: Avanzar, Retroceder';
    if (componentType === 'tabla_personalizada') return 'Ej: Tabla de Puntuaciones';
    return 'Título Personalizado';
  }

  const getContentPlaceholder = () => {
    if (componentType === 'carta_pregunta') return 'Ej: ¿Qué son los ecosistemas?';
    if (componentType === 'carta_accion') return 'Ej: Avanza 2 casillas';
    return 'Contenido Personalizado';
  }


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
                  <Select value={componentType} onValueChange={handleComponentTypeChange as any}>
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
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={getTitlePlaceholder()} />
                </div>
                
                {(componentType === 'carta_pregunta' || componentType === 'carta_accion') && (
                  <div className="space-y-2">
                      <Label htmlFor="content">Contenido</Label>
                      <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder={getContentPlaceholder()} />
                  </div>
                )}

                {componentType === 'tabla_personalizada' && (
                   <div className="space-y-4 pt-4 border-t">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <Label htmlFor="numRows">Filas</Label>
                               <Input id="numRows" type="number" min="1" value={numRows} onChange={(e) => setNumRows(parseInt(e.target.value, 10))} />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor="numCols">Columnas</Label>
                               <Input id="numCols" type="number" min="1" value={numCols} onChange={(e) => setNumCols(parseInt(e.target.value, 10))} />
                           </div>
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="headers">Encabezados (separados por comas)</Label>
                           <Input id="headers" value={headers} onChange={(e) => setHeaders(e.target.value)} placeholder="Ej: Nombre, Puntos, Nivel" />
                       </div>
                   </div>
                )}


                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Generar SVG'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle>2. Resultado</CardTitle>
              <CardDescription>Aquí puedes ver la vista previa y el código del SVG generado.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              {isLoading && (
                <div className="flex justify-center items-center h-full">
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
                <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <TabsList>
                            <TabsTrigger value="preview"><Eye className="mr-2" />Vista Previa</TabsTrigger>
                            <TabsTrigger value="code"><Code className="mr-2" />Código SVG</TabsTrigger>
                        </TabsList>

                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="outline">
                                   Descargar
                                   <svg className="ml-2 h-4 w-4" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
                               </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => handleDownload('svg')}>Descargar como SVG</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDownload('png')}>Descargar como PNG</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDownload('jpeg')}>Descargar como JPG</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                    <TabsContent value="preview" className="mt-4 p-4 border rounded-md bg-muted/30 flex justify-center items-center flex-grow">
                      <div className="w-full max-w-md" style={{ color: color }} dangerouslySetInnerHTML={{ __html: generatedSvg }} />
                    </TabsContent>
                    <TabsContent value="code" className="mt-4 flex-grow">
                      <pre className="p-4 border rounded-md bg-gray-900 text-green-300 text-xs overflow-auto h-96">
                        <code>
                          {generatedSvg}
                        </code>
                      </pre>
                    </TabsContent>
                </Tabs>
              )}
               {!generatedSvg && !isLoading && !error && (
                  <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground border-2 border-dashed rounded-lg">
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
