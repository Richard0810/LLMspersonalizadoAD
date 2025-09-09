
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BrainCircuit, Puzzle, Youtube, Presentation, ExternalLink } from 'lucide-react';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const InfoSection = ({ title, children, icon: Icon, className = "" }) => (
    <Card className={`shadow-lg h-full border-l-4 border-primary/50 ${className}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Icon className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-muted-foreground">
            {children}
        </CardContent>
    </Card>
);

const VideoEmbed = ({ videoId, title }) => (
     <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-[250px] md:h-[315px] rounded-md shadow-md"
    ></iframe>
);

const PresentationEmbed = ({ presentationId, title }) => (
    <iframe
        src={`https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`}
        title={title}
        frameBorder="0"
        allowFullScreen={true}
        className="w-full h-[300px] md:h-[450px] rounded-md shadow-md border"
    ></iframe>
);


export default function LearnPage() {
    const router = useRouter();
    const presentationId = "1_Iys9XP0Te5-spn3DO5vhB01vm1OVC5d";
    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit?usp=drive_link&ouid=105808271510700269082&rtpof=true&sd=true`;

    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center min-h-screen bg-background p-4 md:p-8">
                <InteractiveBackground />
                <main className="w-full max-w-5xl z-10 animate-fade-in">
                    <Button onClick={() => router.back()} variant="outline" className="mb-6 self-start animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
                    </Button>

                    <Tabs defaultValue="pc" className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6 h-auto p-2 bg-primary/10 rounded-lg">
                            <TabsTrigger value="pc" className="py-2.5 text-base">
                                <BrainCircuit className="mr-2 h-5 w-5" /> Pensamiento Computacional
                            </TabsTrigger>
                            <TabsTrigger value="ad" className="py-2.5 text-base">
                                <Puzzle className="mr-2 h-5 w-5" /> Actividades Desconectadas
                            </TabsTrigger>
                            <TabsTrigger value="presentation" className="py-2.5 text-base">
                                <Presentation className="mr-2 h-5 w-5" /> Presentación
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pc" className="animate-fade-in">
                            <InfoSection title="Pensamiento Computacional (PC) – Conceptos Clave" icon={BrainCircuit}>
                                <div className="space-y-4">
                                    <p>El Pensamiento Computacional es un proceso cognitivo de resolución de problemas inspirado en la forma en que los ordenadores procesan la información, pero que trasciende la informática. Consiste en analizar, descomponer y formular soluciones estructuradas para problemas de cualquier ámbito, utilizando principios lógicos, matemáticos y algorítmicos.</p>
                                    <p>No se trata de “pensar como una máquina”, sino de emplear estrategias computacionales para abordar desafíos complejos, de forma que las soluciones puedan ser comprendidas, ejecutadas y reutilizadas tanto por personas como por sistemas tecnológicos.</p>
                                    <p>Este enfoque implica cuatro habilidades fundamentales:</p>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:text-primary">Descomposición</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <p>Dividir un problema complejo en partes más pequeñas y manejables.</p>
                                            <p className="italic"><strong>Ejemplo:</strong> Al armar un rompecabezas, primero separas las piezas por colores o si tienen bordes rectos.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:text-primary">Reconocimiento de patrones</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <p>Identificar similitudes, tendencias o elementos que se repiten en datos o problemas.</p>
                                            <p className="italic"><strong>Ejemplo:</strong> Buscas piezas con formas o colores similares (como todas las piezas del cielo azul) para unirlas.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:text-primary">Abstracción</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <p>Enfocarse solo en la información esencial del problema y omitir detalles innecesarios.</p>
                                            <p className="italic"><strong>Ejemplo:</strong> Te concentras en armar el marco del rompecabezas primero, ignorando temporalmente todas las piezas del centro.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-4">
                                        <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:text-primary">Algoritmos</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            <p>Desarrollar una secuencia lógica y ordenada de pasos para resolver un problema o realizar una tarea.</p>
                                            <p className="italic"><strong>Ejemplo:</strong> Creas una serie de pasos: 1. Buscar las esquinas. 2. Armar el borde. 3. Agrupar piezas por color. 4. Armar las secciones de colores.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <Card className="mt-6 bg-muted/30">
                                    <CardHeader className="flex flex-row items-center gap-3">
                                        <Youtube className="w-6 h-6 text-accent"/>
                                        <CardTitle className="text-xl font-headline text-accent">Video Explicativo</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <VideoEmbed videoId="ti315UlVtS4" title="¿Qué es el Pensamiento Computacional?" />
                                    </CardContent>
                                </Card>
                            </InfoSection>
                        </TabsContent>

                        <TabsContent value="ad" className="animate-fade-in">
                            <InfoSection title="Actividades Desconectadas (AD)" icon={Puzzle}>
                                <div className="space-y-3 mb-4">
                                    <p><strong>Definición:</strong> Son estrategias didácticas para enseñar Pensamiento Computacional sin computadoras ni dispositivos. Usan juegos, dinámicas grupales y simulaciones para practicar conceptos como algoritmos o patrones.</p>
                                    <p><strong>Beneficios:</strong> Son muy accesibles ya que no requieren tecnología, fomentan la creatividad, el trabajo en equipo y la resolución de problemas de una manera práctica y tangible.</p>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="ad-1">
                                        <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:text-primary">Ejemplos de Actividades</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div>
                                                <h4 className="font-bold text-foreground">Programación de Rutas</h4>
                                                <p>Los estudiantes usan flechas y símbolos para crear secuencias de instrucciones que guíen a un compañero a través de un laberinto o mapa. → Trabaja el concepto de algoritmo.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">La Cosecha Más Eficiente</h4>
                                                <p>Los estudiantes, con mapas y fichas que representan cultivos y recolectores, planifican rutas para recolectar la mayor cantidad de productos en el menor tiempo posible. → Trabaja eficiencia algorítmica y optimización.</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">El Mercado Vecinal</h4>
                                                <p>Los estudiantes asumen roles de compradores y vendedores, organizan productos, definen precios y gestionan inventario. → Trabaja toma de decisiones algorítmicas.</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <Card className="mt-6 bg-muted/30">
                                    <CardHeader className="flex flex-row items-center gap-3">
                                        <Youtube className="w-6 h-6 text-accent"/>
                                        <CardTitle className="text-xl font-headline text-accent">Video con Ejemplos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <VideoEmbed videoId="5fU2PT03_Gc" title="Actividades Desconectadas para el aula" />
                                    </CardContent>
                                </Card>
                            </InfoSection>
                        </TabsContent>
                        
                        <TabsContent value="presentation" className="animate-fade-in">
                             <InfoSection title="Presentación: PC y AD en el Contexto Rural" icon={Presentation}>
                                <p className="mb-4">
                                    Explora esta presentación de diapositivas para obtener una visión más profunda de cómo aplicar estos conceptos en entornos rurales, con ejemplos y estrategias adaptadas.
                                </p>
                                <PresentationEmbed presentationId={presentationId} title="Presentación sobre PC y AD en el Contexto Rural" />
                                <Link href={presentationUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                                    <Button size="sm" variant="outline">
                                        Abrir en nueva pestaña <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </InfoSection>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </ProtectedRoute>
    );
}

    