
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImageGenerationParams, VisualFormat } from '@/types';
import { ART_STYLES, ART_TYPES } from '@/lib/visual-constants';

const formSchema = z.object({
  theme: z.string().optional(),
  prompt: z.string().min(1, 'El prompt es obligatorio.'),
  artStyle: z.string().optional(),
  artType: z.string().optional(),
  negativePrompt: z.string().optional(),
  aspectRatio: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (params: ImageGenerationParams) => Promise<void>;
  isLoading: boolean;
  format: VisualFormat;
  translatedFormatName: string;
}

export function ImageGenerationForm({ onSubmit, isLoading, translatedFormatName }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      theme: '',
      artStyle: 'Ninguno',
      artType: 'Ninguno',
      negativePrompt: '',
      aspectRatio: '16:9',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values as ImageGenerationParams);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada (Prompt)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Un astronauta explorando un bosque alienígena con plantas bioluminiscentes." {...field} />
              </FormControl>
              <FormDescription>Describe con el mayor detalle posible la imagen que quieres crear.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="artStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estilo Artístico</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona un estilo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ART_STYLES.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="artType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Arte</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ART_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="negativePrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Negativo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: desenfocado, de baja calidad, texto, marcas de agua" {...field} />
              </FormControl>
              <FormDescription>Describe lo que NO quieres que aparezca en la imagen.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="aspectRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relación de Aspecto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecciona relación de aspecto" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                    <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Generando...' : `Generar ${translatedFormatName}`}
        </Button>
      </form>
    </Form>
  );
}
