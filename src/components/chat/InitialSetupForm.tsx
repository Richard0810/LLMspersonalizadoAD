'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenCheck, Brain, GraduationCap, Target, Lightbulb, Settings2, Clock, Users, School, Puzzle } from 'lucide-react';
import type { LessonParams } from '@/types';
import { saveLessonParamsToLocalStorage, getLessonParamsFromLocalStorage, clearChatHistoryFromLocalStorage } from '@/lib/localStorageUtils';
import { 
  subjectAreas, 
  gradeLevels, 
  computationalConcepts,
  complexityLevels,
  groupSizes,
  educationalContexts,
  activityTypes,
} from '@/types'; 
import InteractiveBackground from '../shared/InteractiveBackground';

interface InitialSetupFormProps {
  onSetupComplete: (params: LessonParams) => void;
}

const InitialSetupForm: React.FC<InitialSetupFormProps> = ({ onSetupComplete }) => {
  // State for all form fields
  const [topicName, setTopicName] = useState('');
  const [computationalConcept, setComputationalConcept] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState('45');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [complexityLevel, setComplexityLevel] = useState<LessonParams['complexityLevel']>('Intermedio');
  const [groupSize, setGroupSize] = useState<LessonParams['groupSize']>('Grupal');
  const [context, setContext] = useState<LessonParams['context']>('Mixto');
  const [activityType, setActivityType] = useState('Juego');
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedParams = getLessonParamsFromLocalStorage();
    if (savedParams) {
      setTopicName(savedParams.topicName);
      setComputationalConcept(savedParams.computationalConcept);
      setSubjectArea(savedParams.subjectArea);
      setGradeLevel(savedParams.gradeLevel);
      setDuration(savedParams.duration || '45');
      setTeacherNotes(savedParams.teacherNotes || '');
      setComplexityLevel(savedParams.complexityLevel || 'Intermedio');
      setGroupSize(savedParams.groupSize || 'Grupal');
      setContext(savedParams.context || 'Mixto');
      setActivityType(savedParams.activityType || 'Juego');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearChatHistoryFromLocalStorage();
    const params: LessonParams = { 
      topicName, computationalConcept, subjectArea, gradeLevel,
      duration, teacherNotes, complexityLevel, groupSize, context, activityType
    };
    saveLessonParamsToLocalStorage(params);
    onSetupComplete(params);
  };
  
  const isFormValid = topicName && computationalConcept && subjectArea && gradeLevel;

  return (
    <>
      <InteractiveBackground />
      <Card className="w-full max-w-2xl shadow-2xl animate-slide-up z-10">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
             <Lightbulb className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Configuración de la Actividad</CardTitle>
          <CardDescription className="text-muted-foreground">
            Define los conceptos básicos y avanzados para generar actividades a tu medida.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                {/* --- Basic Parameters --- */}
                <div className="space-y-2">
                  <Label htmlFor="topicName" className="flex items-center gap-2"><BookOpenCheck size={18}/>Tema a Tratar</Label>
                  <Input
                    id="topicName"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="Ej: Partes del computador, ¿Qué es un algoritmo?"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="computationalConcept" className="flex items-center gap-2"><Brain size={18}/>Pensamiento Computacional</Label>
                        <Select value={computationalConcept} onValueChange={setComputationalConcept} required>
                            <SelectTrigger id="computationalConcept"><SelectValue placeholder="Selecciona un concepto" /></SelectTrigger>
                            <SelectContent>
                            {computationalConcepts.map(concept => <SelectItem key={concept} value={concept}>{concept}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subjectArea" className="flex items-center gap-2"><Target size={18}/>Área</Label>
                        <Select value={subjectArea} onValueChange={setSubjectArea} required>
                            <SelectTrigger id="subjectArea"><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
                            <SelectContent>
                            {subjectAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel" className="flex items-center gap-2"><GraduationCap size={18}/>Nivel de Grado</Label>
                        <Select value={gradeLevel} onValueChange={setGradeLevel} required>
                            <SelectTrigger id="gradeLevel"><SelectValue placeholder="Selecciona un nivel" /></SelectTrigger>
                            <SelectContent>
                            {gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Advanced Parameters Accordion --- */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-options">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                           <div className="flex items-center gap-2">
                            <Settings2 size={20} className="text-primary"/> 
                            Opciones Avanzadas
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            <div className="space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="duration" className="flex items-center gap-2"><Clock size={16}/>Duración Estimada (minutos)</Label>
                                      <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej: 45" />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="complexityLevel" className="flex items-center gap-2">Nivel de Complejidad</Label>
                                      <Select value={complexityLevel} onValueChange={(v) => setComplexityLevel(v as any)} required>
                                          <SelectTrigger id="complexityLevel"><SelectValue/></SelectTrigger>
                                          <SelectContent>
                                          {complexityLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                   <div className="space-y-2">
                                      <Label htmlFor="groupSize" className="flex items-center gap-2"><Users size={16}/>Tamaño del Grupo</Label>
                                      <Select value={groupSize} onValueChange={(v) => setGroupSize(v as any)} required>
                                          <SelectTrigger id="groupSize"><SelectValue/></SelectTrigger>
                                          <SelectContent>
                                          {groupSizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="context" className="flex items-center gap-2"><School size={16}/>Contexto Educativo</Label>
                                      <Select value={context} onValueChange={(v) => setContext(v as any)} required>
                                          <SelectTrigger id="context"><SelectValue/></SelectTrigger>
                                          <SelectContent>
                                          {educationalContexts.map(ctx => <SelectItem key={ctx} value={ctx}>{ctx}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <Label htmlFor="activityType" className="flex items-center gap-2"><Puzzle size={16}/>Tipo de Actividad</Label>
                                   <Select value={activityType} onValueChange={setActivityType} required>
                                      <SelectTrigger id="activityType"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                                      <SelectContent>
                                        {activityTypes.map(type => (
                                            <SelectItem
                                              key={type.id}
                                              value={type.id}
                                              description={type.description}
                                            >
                                              {type.name}
                                            </SelectItem>
                                        ))}
                                      </SelectContent>
                                  </Select>
                               </div>

                                <div className="space-y-2">
                                    <Label htmlFor="teacherNotes" className="flex items-center gap-2">Indicaciones Adicionales para el Docente</Label>
                                    <Textarea id="teacherNotes" value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} placeholder="Ej: Quiero que sea una actividad al aire libre, usar material reciclado, debe ser colaborativa..." />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !isFormValid}>
                    {isLoading ? 'Guardando...' : 'Comenzar a Generar Actividades'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </>
  );
};

export default InitialSetupForm;
