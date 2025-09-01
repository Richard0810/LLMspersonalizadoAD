
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpenCheck, Brain, GraduationCap, Target, Lightbulb } from 'lucide-react';
import type { LessonParams } from '@/types';
import { saveLessonParamsToLocalStorage, getLessonParamsFromLocalStorage, clearChatHistoryFromLocalStorage } from '@/lib/localStorageUtils';
import { subjectAreas, gradeLevels, computationalConcepts } from '@/types'; 

interface InitialSetupFormProps {
  onSetupComplete: (params: LessonParams) => void;
}

const InitialSetupForm: React.FC<InitialSetupFormProps> = ({ onSetupComplete }) => {
  const [topicName, setTopicName] = useState('');
  const [computationalConcept, setComputationalConcept] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedParams = getLessonParamsFromLocalStorage();
    if (savedParams) {
      setTopicName(savedParams.topicName);
      setComputationalConcept(savedParams.computationalConcept);
      setSubjectArea(savedParams.subjectArea);
      setGradeLevel(savedParams.gradeLevel);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Clear any previous chat history when starting a new setup
    clearChatHistoryFromLocalStorage();
    const params: LessonParams = { topicName, computationalConcept, subjectArea, gradeLevel };
    saveLessonParamsToLocalStorage(params);
    onSetupComplete(params);
  };

  return (
      <Card className="w-full max-w-lg shadow-2xl animate-slide-up">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
             <Lightbulb className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Configuración de la Actividad</CardTitle>
          <CardDescription className="text-muted-foreground">
            Definamos los conceptos básicos para tus actividades educativas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="space-y-2">
              <Label htmlFor="computationalConcept" className="flex items-center gap-2"><Brain size={18}/>Pensamiento Computacional</Label>
              <Select value={computationalConcept} onValueChange={setComputationalConcept} required>
                <SelectTrigger id="computationalConcept">
                  <SelectValue placeholder="Selecciona un concepto" />
                </SelectTrigger>
                <SelectContent>
                  {computationalConcepts.map(concept => (
                    <SelectItem key={concept} value={concept}>{concept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectArea" className="flex items-center gap-2"><Target size={18}/>Área</Label>
              <Select value={subjectArea} onValueChange={setSubjectArea} required>
                <SelectTrigger id="subjectArea">
                  <SelectValue placeholder="Selecciona un área temática" />
                </SelectTrigger>
                <SelectContent>
                  {subjectAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradeLevel" className="flex items-center gap-2"><GraduationCap size={18}/>Nivel de Grado</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel} required>
                <SelectTrigger id="gradeLevel">
                  <SelectValue placeholder="Selecciona un nivel de grado" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !topicName || !computationalConcept || !subjectArea || !gradeLevel}>
              {isLoading ? 'Guardando...' : 'Comenzar a Generar Actividades'}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
};

export default InitialSetupForm;

    