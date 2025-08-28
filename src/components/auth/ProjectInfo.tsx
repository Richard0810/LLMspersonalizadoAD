
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Users, Bot, ArrowRight, BookOpenCheck, Brain, GraduationCap } from 'lucide-react';

const InfoCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);


const ProjectInfo = () => {
  return (
    <Card className="shadow-2xl animate-fade-in w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Lightbulb className="h-7 w-7" />
            Acerca de EduSpark AI
        </CardTitle>
        <CardDescription>
            Una plataforma para potenciar la enseñanza con Inteligencia Artificial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="objective" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="objective">
                <Lightbulb className="h-4 w-4 mr-1"/> Objetivo
            </TabsTrigger>
            <TabsTrigger value="audience">
                <Users className="h-4 w-4 mr-1"/> ¿Para Quién?
            </TabsTrigger>
            <TabsTrigger value="what-it-does">
                <Bot className="h-4 w-4 mr-1"/> ¿Qué Hace?
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objective">
            <div className="space-y-4">
                 <Image
                    src="https://picsum.photos/600/300?random=1"
                    alt="Innovación Educativa"
                    width={600}
                    height={300}
                    className="rounded-lg object-cover w-full h-40"
                    data-ai-hint="education innovation"
                />
                <p className="text-muted-foreground text-center italic">
                    Nuestra misión es cerrar la brecha entre la tecnología y la educación, proporcionando herramientas de IA para crear experiencias de aprendizaje desconectadas y efectivas.
                </p>
               
            </div>
          </TabsContent>
          <TabsContent value="audience">
             <div className="space-y-4">
                 <Image
                    src="https://picsum.photos/600/300?random=2"
                    alt="Docentes colaborando"
                    width={600}
                    height={300}
                    className="rounded-lg object-cover w-full h-40"
                    data-ai-hint="teachers collaborating"
                />
                <InfoCard 
                    icon={<Users className="h-6 w-6 text-accent"/>}
                    title="Docentes de Tecnología e Informática"
                    description="Ideal para educadores que buscan innovar en sus clases de pensamiento computacional, incluso en entornos con baja conectividad."
                />
            </div>
          </TabsContent>
          <TabsContent value="what-it-does">
            <div className="space-y-4">
                 <Image
                    src="https://picsum.photos/600/300?random=3"
                    alt="Actividades creativas"
                    width={600}
                    height={300}
                    className="rounded-lg object-cover w-full h-40"
                    data-ai-hint="creative activities"
                />
                <div className="flex items-center justify-center space-x-2 text-muted-foreground font-semibold">
                    <div className="flex items-center gap-1"><BookOpenCheck size={18}/> Configura</div>
                    <ArrowRight size={20} className="text-primary"/>
                    <div className="flex items-center gap-1"><Brain size={18}/> Genera</div>
                    <ArrowRight size={20} className="text-primary"/>
                    <div className="flex items-center gap-1"><GraduationCap size={18}/> Explora</div>
                </div>
                 <p className="text-muted-foreground text-center italic">
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
