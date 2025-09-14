
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ConceptIllustParams, VisualFormat } from '@/types';

const formSchema = z.object({
  concept: z.string().min(1, 'El concepto es obligatorio.'),
  visualStyle: z.string().min(1, 'El estilo visual es obligatorio.'),
  specificElements: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (params: ConceptIllustParams) => Promise<void>;
  isLoading: boolean;
  format: VisualFormat;
  translatedFormatName: string;
}

export function ConceptIllustrationForm({ onSubmit, isLoading, translatedFormatName, format }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: '',
      visualStyle: format === 'photo_realistic' ? 'Fotorrealista' : 'Ilustración Estilizada',
      specificElements: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="concept"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto a Ilustrar</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Gravedad, Democracia, Fotosíntesis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificElements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Elementos Específicos (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Para 'Gravedad', mostrar una manzana cayendo hacia la Tierra con flechas indicando la fuerza." {...field} />
              </FormControl>
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
