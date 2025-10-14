
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Wand2, Copy, Check, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSvgAction } from './actions';
import { GenerateSvgCodeInput } from '@/ai/flows/generate-svg-code';

const formSchema = z.object({
  prompt: z.string().min(5, 'La descripción debe tener al menos 5 caracteres.'),
  style: z.enum(['outline', 'solid', 'duotone']).default('outline'),
  complexity: z.enum(['simple', 'detailed']).default('simple'),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SvgLabPage() {
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      style: 'outline',
      complexity: 'simple',
      color: '#3b82f6', // blue-500
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setGeneratedSvg(null);

    const input: GenerateSvgCodeInput = values;
    const result = await generateSvgAction(input);

    setIsLoading(false);
    if (result.success && result.svgCode) {
      setGeneratedSvg(result.svgCode);
      toast({ title: '¡SVG Generado!', description: 'Tu icono SVG está listo.' });
    } else {
      const errorMessage = result.error || 'Ocurrió un error desconocido.';
      setError(errorMessage);
      toast({ title: 'Error de Generación', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    if (generatedSvg) {
      navigator.clipboard.writeText(generatedSvg);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };
  
  const selectedColor = form.watch('color');

  return (
    <AppShell>
      <div className="container mx-auto p-4 md:p-8 animate-fade-in">
        <header className="text-center mb-10">
            <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
              <Wand2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline animate-background-shine bg-[length:200%_auto] bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Laboratorio SVG
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
              Genera iconos y gráficos SVG únicos a partir de texto utilizando IA.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Describe tu Icono</CardTitle>
              <CardDescription>Proporciona los detalles para que la IA cree tu SVG.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Icono</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ej: Un cohete despegando, con humo y estrellas" {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estilo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="outline">Contorno (Outline)</SelectItem>
                              <SelectItem value="solid">Sólido (Solid)</SelectItem>
                              <SelectItem value="duotone">Dos Tonos (Duotone)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complejidad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="detailed">Detallado</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Previsualización</FormLabel>
                           <FormControl>
                               <Input type="color" {...field} className="p-1 h-10 w-full" />
                           </FormControl>
                        </FormItem>
                      )}
                    />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Generando...' : 'Generar SVG'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>Previsualización del SVG y su código fuente.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="relative flex-grow border-2 border-dashed rounded-lg flex items-center justify-center p-4 bg-muted/30" style={{ minHeight: '200px' }}>
                    {isLoading && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
                    {error && !isLoading && <AlertCircle className="h-10 w-10 text-destructive" />}
                    {!isLoading && !error && !generatedSvg && <p className="text-muted-foreground">Aquí aparecerá tu SVG...</p>}
                    {generatedSvg && (
                        <div
                        className="w-48 h-48"
                        style={{ color: selectedColor || 'currentColor' }}
                        dangerouslySetInnerHTML={{ __html: generatedSvg }}
                        />
                    )}
                </div>

              {generatedSvg && (
                <div className="relative">
                  <div className="flex items-center mb-2">
                     <Code className="h-4 w-4 mr-2" />
                     <h4 className="font-semibold">Código Fuente SVG</h4>
                  </div>
                  <pre className="bg-gray-900 text-white p-4 rounded-md text-xs overflow-x-auto max-h-48">
                    <code>{generatedSvg}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-1 h-7 w-7 text-gray-400 hover:text-white"
                    onClick={handleCopy}
                  >
                    {hasCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
