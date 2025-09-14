
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InfoOrgParams, VisualFormat } from '@/types';

const formSchema = z.object({
  topic: z.string().min(1, 'El tema es obligatorio.'),
  level: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (params: InfoOrgParams) => Promise<void>;
  isLoading: boolean;
  format: VisualFormat;
  translatedFormatName: string;
}

export function InfoOrganizationForm({ onSubmit, isLoading, translatedFormatName }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      level: 'intermediate',
      details: '',
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
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema Principal</FormLabel>
              <FormControl>
                <Input placeholder="Ej: El ciclo del agua" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalles y Contexto Adicional</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Enfocarse en la evaporación, condensación y precipitación. Mencionar el rol del sol." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de Complejidad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
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
