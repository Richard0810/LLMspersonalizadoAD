
'use client';

import { useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVisualContentAction } from './actions';
import OutputDisplay from '@/components/visual/OutputDisplay';

import type {
  VisualCategory,
  VisualFormat,
  ImageGenerationParams,
  InfoOrgParams,
  ConceptIllustParams,
  GeneratedContentType,
  GenerateVisualContentFlowInput
} from '@/types';
import {
  VISUAL_CATEGORIES_LIST,
  VISUAL_FORMATS_BY_CATEGORY,
  ALL_VISUAL_FORMATS_LIST
} from '@/lib/visual-constants';
import { ImageGenerationForm } from '@/components/visual/forms/ImageGenerationForm';
import { InfoOrganizationForm } from '@/components/visual/forms/InfoOrganizationForm';
import { ConceptIllustrationForm } from '@/components/visual/forms/ConceptIllustrationForm';


export default function VisualGeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState<VisualCategory | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VisualFormat | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleCategoryChange = (value: string) => {
    const category = value as VisualCategory;
    setSelectedCategory(category);
    setSelectedFormat(null);
    setGeneratedContent(null);
    setError(null);
  };

  const handleFormatChange = (value: string) => {
    const format = value as VisualFormat;
    setSelectedFormat(format);
    setGeneratedContent(null);
    setError(null);
  };

  const handleSubmit = useCallback(async (params: any) => {
    if (!selectedFormat || !selectedCategory) {
      toast({
        title: "Faltan Campos",
        description: "Por favor, selecciona categoría y formato.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const formatDetail = ALL_VISUAL_FORMATS_LIST.find(f => f.id === selectedFormat);
    const translatedFormatName = formatDetail ? formatDetail.name : selectedFormat.replace(/_/g, ' ');

    const flowInput: GenerateVisualContentFlowInput = {
      category: selectedCategory,
      format: selectedFormat,
      translatedFormatName,
      params: { ...params },
    };

    const result = await generateVisualContentAction(flowInput);
    setIsLoading(false);

    if (result.success && result.data) {
      setGeneratedContent(result.data);
      toast({
        title: "¡Contenido Visual Generado!",
        description: `Tu ${translatedFormatName} está listo.`
      });
    } else {
      setError(result.error || "Ocurrió un error desconocido.");
      toast({
        title: "Error de Generación",
        description: result.error || "No se pudo generar el contenido.",
        variant: "destructive"
      });
    }
  }, [selectedCategory, selectedFormat, toast]);


  const renderForm = () => {
    if (!selectedFormat || !selectedCategory) return null;

    const formatDetail = ALL_VISUAL_FORMATS_LIST.find(f => f.id === selectedFormat);
    const translatedFormatName = formatDetail ? formatDetail.name : selectedFormat.replace(/_/g, ' ');

    switch (selectedCategory) {
      case 'image_generation':
        return (
          <ImageGenerationForm
            onSubmit={handleSubmit as (params: ImageGenerationParams) => Promise<void>}
            isLoading={isLoading}
            format={selectedFormat}
            translatedFormatName={translatedFormatName}
          />
        );
      case 'info_organization':
        return <InfoOrganizationForm
          onSubmit={handleSubmit as (params: InfoOrgParams) => Promise<void>}
          isLoading={isLoading}
          format={selectedFormat}
          translatedFormatName={translatedFormatName}
        />;
      case 'concept_illustration':
        return <ConceptIllustrationForm
          onSubmit={handleSubmit as (params: ConceptIllustParams) => Promise<void>}
          isLoading={isLoading}
          format={selectedFormat}
          translatedFormatName={translatedFormatName}
        />;
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <header className="mb-10 text-center">
          <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-primary">
            Generador de Formatos Visuales
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Crea visualizaciones de alto impacto para tus clases.
          </p>
        </header>

        <Card className="w-full max-w-4xl mx-auto shadow-xl mb-8">
          <CardHeader>
            <CardTitle>Configuración de la Visualización</CardTitle>
            <CardDescription>Elige qué tipo de contenido visual quieres que la IA genere.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category-select">1. Elige una Categoría</Label>
                <Select value={selectedCategory || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category-select" className="w-full mt-1">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISUAL_CATEGORIES_LIST.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div>
                  <Label htmlFor="format-select">2. Elige un Formato</Label>
                  <Select value={selectedFormat || ''} onValueChange={handleFormatChange} disabled={!selectedCategory}>
                    <SelectTrigger id="format-select" className="w-full mt-1">
                      <SelectValue placeholder="Selecciona un formato" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUAL_FORMATS_BY_CATEGORY[selectedCategory]?.map(fmt => (
                        <SelectItem key={fmt.id} value={fmt.id}>{fmt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {selectedFormat && <div className="pt-4 border-t">{renderForm()}</div>}
          </CardContent>
        </Card>
        
        {isLoading && (
          <Card className="w-full max-w-3xl mx-auto shadow-xl mt-8">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Generando contenido. Esto puede tardar un momento...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de Generación</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedContent && !isLoading && selectedFormat && (
          <Card className="w-full max-w-3xl mx-auto shadow-xl mt-10">
            <CardHeader><CardTitle className="text-2xl">Resultado Generado</CardTitle></CardHeader>
            <CardContent>
              <OutputDisplay content={generatedContent} format={selectedFormat} />
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
