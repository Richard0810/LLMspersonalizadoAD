
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, BrainCircuit, Puzzle, Youtube } from 'lucide-react';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const InfoSection = ({ title, children, icon: Icon }) => (
    <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Icon className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const VideoEmbed = ({ videoId, title }) => (
    <div className="aspect-w-16 aspect-h-9">
        <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md shadow-md"
        ></iframe>
    </div>
);


export default function LearnPage() {
    const router = useRouter();

    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center min-h-screen bg-background p-4 md:p-8 animate-fade-in">
                <InteractiveBackground />
                <main className="w-full max-w-4xl z-10">
                    <Button onClick={() => router.back()} variant="outline" className="mb-6 self-start">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                    </Button>

                    <div className="space-y-8">
                        <InfoSection title="Pensamiento Computacional (PC) – Conceptos Clave" icon={BrainCircuit}>
                            <div className="text-base text-muted-foreground space-y-4">
                                <p>El Pensamiento Computacional es un proceso cognitivo de resolución de problemas inspirado en la forma en que los ordenadores procesan la información, pero que trasciende la informática. Consiste en analizar, descomponer y formular soluciones estructuradas para problemas de cualquier ámbito, utilizando principios lógicos, matemáticos y algorítmicos.</p>
                                <p>No se trata de “pensar como una máquina”, sino de emplear estrategias computacionales para abordar desafíos complejos, de forma que las soluciones puedan ser comprendidas, ejecutadas y reutilizadas tanto por personas como por sistemas tecnológicos.</p>
                                <p>Este enfoque implica cuatro habilidades fundamentales:</p>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-lg font-semibold">Descomposición</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground space-y-2">
                                        <p>Dividir un problema complejo en partes más pequeñas y manejables.</p>
                                        <p className="italic"><strong>Ejemplo:</strong> Planificar la siembra de un campo dividiéndola en tareas como preparar el suelo, sembrar, regar y cosechar.</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-lg font-semibold">Reconocimiento de patrones</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground space-y-2">
                                        <p>Identificar similitudes, tendencias o elementos que se repiten en datos o problemas.</p>
                                        <p className="italic"><strong>Ejemplo:</strong> Analizar registros climáticos históricos para prever épocas de lluvia y sequía.</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-lg font-semibold">Abstracción</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground space-y-2">
                                        <p>Enfocarse solo en la información esencial del problema y omitir detalles innecesarios.</p>
                                        <p className="italic"><strong>Ejemplo:</strong> Crear un mapa de riego que muestre únicamente las zonas críticas y las fuentes de agua.</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="text-lg font-semibold">Algoritmos</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground space-y-2">
                                        <p>Desarrollar una secuencia lógica y ordenada de pasos para resolver un problema o realizar una tarea.</p>
                                        <p className="italic"><strong>Ejemplo:</strong> Diseñar una rutina diaria para el cuidado de animales: alimentar, limpiar y vacunar.</p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Card className="mt-6 bg-muted/50">
                                <CardHeader className="flex flex-row items-center gap-3">
                                    <Youtube className="w-6 h-6 text-red-600"/>
                                    <CardTitle className="text-xl font-headline">Video Explicativo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <VideoEmbed videoId="ti315UlVtS4" title="¿Qué es el Pensamiento Computacional?" />
                                </CardContent>
                            </Card>
                        </InfoSection>

                        <InfoSection title="Actividades Desconectadas (AD)" icon={Puzzle}>
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="ad-1">
                                     <AccordionTrigger className="text-lg font-semibold">Definición y Beneficios</AccordionTrigger>
                                      <AccordionContent className="text-base text-muted-foreground space-y-3">
                                        <p><strong>Definición:</strong> Son estrategias didácticas para enseñar Pensamiento Computacional sin computadoras ni dispositivos. Usan juegos, dinámicas grupales y simulaciones para practicar conceptos como algoritmos o patrones.</p>
                                        <p><strong>Beneficios:</strong> Muy accesibles (no requieren tecnología), fomentan la creatividad, el trabajo en equipo y la resolución de problemas.</p>
                                      </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="ad-2">
                                     <AccordionTrigger className="text-lg font-semibold">Ejemplos de Actividades</AccordionTrigger>
                                     <AccordionContent className="text-base text-muted-foreground space-y-4">
                                        <div>
                                            <h4 className="font-bold">Programación de Rutas</h4>
                                            <p>Los estudiantes usan flechas y símbolos para crear secuencias de instrucciones que guíen a un compañero a través de un laberinto o mapa. → Trabaja el concepto de algoritmo.</p>
                                        </div>
                                         <div>
                                            <h4 className="font-bold">La Cosecha Más Eficiente</h4>
                                            <p>Los estudiantes, con mapas y fichas que representan cultivos y recolectores, planifican rutas para recolectar la mayor cantidad de productos en el menor tiempo posible. → Trabaja eficiencia algorítmica y optimización.</p>
                                        </div>
                                         <div>
                                            <h4 className="font-bold">El Mercado Vecinal</h4>
                                            <p>Los estudiantes asumen roles de compradores y vendedores, organizan productos, definen precios y gestionan inventario. → Trabaja toma de decisiones algorítmicas.</p>
                                        </div>
                                     </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                              <Card className="mt-6 bg-muted/50">
                                <CardHeader className="flex flex-row items-center gap-3">
                                    <Youtube className="w-6 h-6 text-red-600"/>
                                    <CardTitle className="text-xl font-headline">Video con Ejemplos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <VideoEmbed videoId="s1-bbP1m2sA" title="Actividades Desconectadas para el aula" />
                                </CardContent>
                            </Card>
                        </InfoSection>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
