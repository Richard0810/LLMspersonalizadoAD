
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Users, Bot, ArrowRight, BookOpenCheck, Brain, GraduationCap, Target, Rocket, Handshake, Globe } from 'lucide-react';
import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-primary">{icon}</div>
        <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const audienceData = [
  { name: 'Doc. Tecnología', value: 70, fill: 'hsl(var(--chart-1))' },
  { name: 'Otros Docentes', value: 20, fill: 'hsl(var(--chart-2))' },
  { name: 'Estudiantes', value: 10, fill: 'hsl(var(--chart-4))' },
];

const chartConfig = {
   'Doc. Tecnología': {
    label: 'Docentes de Tecnología',
    color: 'hsl(var(--chart-1))',
  },
  'Otros Docentes': {
    label: 'Otros Docentes',
    color: 'hsl(var(--chart-2))',
  },
  'Estudiantes': {
    label: 'Estudiantes',
    color: 'hsl(var(--chart-4))',
  },
};


const ProjectInfo = () => {
  return (
    <Card className="shadow-2xl animate-fade-in w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Lightbulb className="h-7 w-7" />
            Acerca de EduSpark AI
        </CardTitle>
        <CardDescription>
            Una plataforma para potenciar la enseñanza con Inteligencia Artificial.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Tabs defaultValue="objective" className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="objective">
                <Target className="h-4 w-4 mr-1"/> Objetivo
            </TabsTrigger>
            <TabsTrigger value="audience">
                <Users className="h-4 w-4 mr-1"/> ¿Para Quién?
            </TabsTrigger>
            <TabsTrigger value="what-it-does">
                <Bot className="h-4 w-4 mr-1"/> ¿Qué Hace?
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objective" className="flex-grow">
            <div className="space-y-6 h-full flex flex-col justify-around">
                <InfoCard
                    icon={<Rocket size={24} />}
                    title="Innovación Pedagógica"
                    description="Asesorar a docentes en el diseño de actividades desconectadas que desarrollen el pensamiento computacional de forma creativa."
                />
                <InfoCard
                    icon={<Handshake size={24} />}
                    title="Apoyo Docente"
                    description="Crear recursos didácticos efectivos y adaptados a las necesidades de los educadores en entornos con y sin conectividad."
                />
                 <InfoCard
                    icon={<Globe size={24} />}
                    title="Acceso Equitativo"
                    description="Implementar y validar la herramienta en contextos reales para asegurar su efectividad y mejorarla con retroalimentación."
                />
            </div>
          </TabsContent>
          <TabsContent value="audience" className="flex-grow">
             <div className="space-y-4 h-full flex flex-col justify-around">
                <ChartContainer config={chartConfig} className="w-full h-[150px]">
                    <PieChart>
                         <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={audienceData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} />
                    </PieChart>
                </ChartContainer>
                <InfoCard 
                    icon={<Users className="h-6 w-6 text-accent"/>}
                    title="Docentes de Tecnología e Informática"
                    description="Ideal para educadores que buscan innovar en sus clases de pensamiento computacional, incluso en entornos con baja conectividad."
                />
            </div>
          </TabsContent>
          <TabsContent value="what-it-does" className="flex-grow">
            <div className="space-y-6 text-center h-full flex flex-col justify-around">
                 <div className="flex items-center justify-center space-x-2 text-muted-foreground font-semibold">
                    <div className="flex flex-col items-center gap-1 p-2 bg-primary/10 rounded-lg">
                        <BookOpenCheck size={24} className="text-primary"/> 
                        <span className="text-xs">Configura</span>
                    </div>
                    <ArrowRight size={20} className="text-primary shrink-0"/>
                    <div className="flex flex-col items-center gap-1 p-2 bg-primary/10 rounded-lg">
                        <Brain size={24} className="text-primary"/> 
                        <span className="text-xs">Genera</span>
                    </div>
                    <ArrowRight size={20} className="text-primary shrink-0"/>
                    <div className="flex flex-col items-center gap-1 p-2 bg-primary/10 rounded-lg">
                        <GraduationCap size={24} className="text-primary"/> 
                        <span className="text-xs">Explora</span>
                    </div>
                </div>
                 <p className="text-muted-foreground italic">
                    Define un tema, selecciona un concepto y un nivel, y deja que la IA genere tres actividades offline únicas y detalladas para tus estudiantes.
                </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProjectInfo;
