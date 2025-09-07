'use client';

import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ActivityCard from './ActivityCard';
import type { ChatMessage, LessonParams, Activity } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, Settings2, Sparkles, CheckCircle, Loader2, FileSignature } from 'lucide-react';
import { subjectAreas, gradeLevels } from '@/types';

interface ChatMessageItemProps {
  message: ChatMessage;
  onParameterChange?: (parameter: keyof LessonParams, value: string) => void;
  currentLessonParams?: LessonParams;
  onEditMessage?: (content: string, title: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onParameterChange, currentLessonParams, onEditMessage }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isSystem = message.sender === 'system';

  const createMarkup = (text?: string) => {
    if (!text) return { __html: '' };
    const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: htmlText };
  };

  const formatActivitiesForEditing = (introText?: string, activities?: Activity[]): string => {
    let fullText = introText ? `${introText}\n\n` : "";
    if (activities && activities.length > 0) {
      activities.forEach((activity, index) => {
        fullText += `--- Actividad ${index + 1}: ${activity.title} ---\n`;
        fullText += `Objetivo de Aprendizaje:\n${activity.objective}\n\n`;
        fullText += `Concepto de Pensamiento Computacional:\n${activity.computationalConcept}\n\n`;
        fullText += `Materiales:\n${activity.materials}\n\n`;
        fullText += `Tiempo Estimado:\n${activity.estimatedTime}\n\n`;
        fullText += `Preparación Previa:\n${activity.teacherPreparation}\n\n`;
        fullText += `Desarrollo Paso a Paso:\n${activity.stepByStepDevelopment}\n\n`;
        fullText += `Ejemplos Visuales:\n${activity.visualExamples}\n\n`;
        fullText += `Pregunta de Reflexión:\n${activity.reflectionQuestion}\n\n`;
        fullText += `Criterios de Evaluación:\n${activity.evaluationCriteria}\n\n`;
        if (index < activities.length - 1) {
          fullText += "---\n\n";
        }
      });
    }
    return fullText.trim();
  };

  const handleEditClick = () => {
    if (!onEditMessage) return;

    if (isAI) {
      if (message.type === 'text' && message.text) {
        onEditMessage(message.text, "Editar Respuesta de IA");
      } else if (message.type === 'activity_cards') {
        const content = formatActivitiesForEditing(message.text, message.activities);
        onEditMessage(content, "Editar Actividades como Documento");
      }
    }
  };
  
  if (message.type === 'loading') {
    return (
      <div className="flex items-center space-x-3 py-3 animate-pulse">
        <Avatar className="h-8 w-8 bg-muted">
          <AvatarFallback><Bot className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
        </Avatar>
        <div className="p-3 rounded-lg bg-muted max-w-xs lg:max-w-md">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (message.type === 'error') {
    return (
      <Alert variant="destructive" className="my-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message.error || 'Ocurrió un error desconocido.'}</AlertDescription>
      </Alert>
    );
  }

  const aiMessageContent = (
    <div className="flex flex-col space-y-2">
      {message.text && (
         <Card className={cn("p-3 rounded-lg max-w-lg lg:max-w-2xl shadow", 
            isAI ? "bg-primary/10 text-card-foreground" : "bg-card")}>
            <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={createMarkup(message.text)} />
        </Card>
      )}
      {message.type === 'activity_cards' && message.activities && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {message.activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );

  if (message.type === 'activity_cards' || (isAI && message.type === 'text')) {
    return (
      <div className={cn("flex items-start space-x-3 py-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarFallback><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col items-start">
            {aiMessageContent}
            {isAI && onEditMessage && (message.text || (message.activities && message.activities.length > 0)) && (
              <Button variant="ghost" size="sm" onClick={handleEditClick} className="mt-2 text-xs text-muted-foreground hover:text-primary">
                <FileSignature className="mr-1 h-3 w-3" />
                Editar como Documento
              </Button>
            )}
        </div>
      </div>
    );
  }
  
  if (message.type === 'parameter_select_area' && onParameterChange && currentLessonParams) {
    return (
      <div className="flex items-start space-x-3 py-3">
        <Avatar className="h-8 w-8"><AvatarFallback><Settings2 className="h-4 w-4 text-muted-foreground"/></AvatarFallback></Avatar>
        <Card className="p-3 rounded-lg bg-muted max-w-xs lg:max-w-md shadow">
          <p className="text-sm mb-2">{message.text || "Por favor, selecciona la nueva área temática:"}</p>
          <Select
            value={currentLessonParams.subjectArea}
            onValueChange={(value) => onParameterChange('subjectArea', value)}
          >
            <SelectTrigger><SelectValue placeholder="Selecciona Área Temática" /></SelectTrigger>
            <SelectContent>
              {subjectAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>
      </div>
    );
  }

  if (message.type === 'parameter_select_grade' && onParameterChange && currentLessonParams) {
    return (
      <div className="flex items-start space-x-3 py-3">
         <Avatar className="h-8 w-8"><AvatarFallback><Settings2 className="h-4 w-4 text-muted-foreground"/></AvatarFallback></Avatar>
        <Card className="p-3 rounded-lg bg-muted max-w-xs lg:max-w-md shadow">
          <p className="text-sm mb-2">{message.text || "Por favor, selecciona el nuevo nivel de grado:"}</p>
          <Select
            value={currentLessonParams.gradeLevel}
            onValueChange={(value) => onParameterChange('gradeLevel', value)}
          >
            <SelectTrigger><SelectValue placeholder="Selecciona Nivel de Grado" /></SelectTrigger>
            <SelectContent>
              {gradeLevels.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>
      </div>
    );
  }


  return (
    <div className={cn("flex items-end space-x-3 py-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {isAI && <Bot className="h-5 w-5 text-primary" />}
            {isSystem && <CheckCircle className="h-5 w-5 text-green-500" />}
          </AvatarFallback>
        </Avatar>
      )}
      <Card 
        className={cn("p-3 rounded-lg max-w-xs lg:max-w-md shadow-sm", 
          isUser ? "bg-primary text-black" : 
          isAI ? "bg-card text-card-foreground" : // This case is now handled above mostly
          "bg-accent/20 text-accent"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </Card>
      {isUser && (
         <Avatar className="h-8 w-8">
          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessageItem;
