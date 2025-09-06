
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { generateEducationalActivities, GenerateEducationalActivitiesInput } from '@/ai/flows/generate-educational-activity';
import { consultAIOnLesson, ConsultAIOnLessonInput } from '@/ai/flows/consult-ai-on-lesson';
import type { ChatMessage, Activity, LessonParams } from '@/types';
import ChatMessageItem from './ChatMessageItem';
import { 
  addActivitiesToHistoryLocalStorage, 
  saveLessonParamsToLocalStorage,
  saveChatHistoryToLocalStorage,
  getChatHistoryFromLocalStorage,
  clearChatHistoryFromLocalStorage
} from '@/lib/localStorageUtils';
import { Send, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  initialParams: LessonParams;
  onResetSetup: () => void;
  handleParameterEdit: (func: (field: keyof LessonParams) => void) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialParams, onResetSetup: externalOnResetSetup, handleParameterEdit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [currentLessonParams, setCurrentLessonParams] = useState<LessonParams>(initialParams);
  const [editingField, setEditingField] = useState<keyof LessonParams | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEditingContent, setCurrentEditingContent] = useState('');
  const [currentEditingTitle, setCurrentEditingTitle] = useState('');
  const [editedContentInModal, setEditedContentInModal] = useState('');


  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };
  
  useEffect(scrollToBottom, [messages, isEditorOpen]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (messages.length > 0) { // Only save if there are messages
      saveChatHistoryToLocalStorage(messages);
    }
  }, [messages]);
  
  const notifyHistoryUpdate = () => {
    window.dispatchEvent(new CustomEvent('activityHistoryUpdated'));
  };
  
  const onResetSetup = () => {
    clearChatHistoryFromLocalStorage();
    externalOnResetSetup();
  }

  const handleGenerateActivities = async (params: LessonParams) => {
    setIsLoadingAi(true);
    addMessage({ id: 'loading-gen', sender: 'ai', type: 'loading', timestamp: Date.now(), isLoading: true });

    try {
      const generateInput: GenerateEducationalActivitiesInput = {
        topicName: params.topicName,
        computationalConcept: params.computationalConcept,
        subjectArea: params.subjectArea,
        gradeLevel: params.gradeLevel,
      };
      const generatedActivities = await generateEducationalActivities(generateInput);
      const activitiesWithIds: Activity[] = generatedActivities.map((act, index) => ({
        ...act,
        id: `${Date.now()}-${index}` 
      }));
      
      addActivitiesToHistoryLocalStorage(activitiesWithIds);
      notifyHistoryUpdate();

      setMessages(prev => prev.filter(m => m.id !== 'loading-gen'));
      addMessage({
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Aquí tienes algunas actividades que he preparado:',
        activities: activitiesWithIds,
        timestamp: Date.now(),
        type: 'activity_cards',
      });
    } catch (error) {
      console.error("Error generando actividades:", error);
      setMessages(prev => prev.filter(m => m.id !== 'loading-gen'));
      addMessage({
        id: Date.now().toString(),
        sender: 'ai',
        error: `Falló la generación de actividades. ${error instanceof Error ? error.message : 'Error desconocido.'}`,
        timestamp: Date.now(),
        type: 'error',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    const savedChat = getChatHistoryFromLocalStorage();
    if (savedChat && savedChat.length > 0) {
      setMessages(savedChat);
    } else {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'system',
        text: `¡Hola ${user?.username}! Parámetros de la actividad establecidos:
- Tema: ${initialParams.topicName}
- Concepto: ${initialParams.computationalConcept}
- Área: ${initialParams.subjectArea}
- Grado: ${initialParams.gradeLevel}
Generando actividades iniciales...`,
        timestamp: Date.now(),
        type: 'text',
      };
      setMessages([systemMessage]);
      handleGenerateActivities(initialParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- EMPTY DEPENDENCY ARRAY. This is crucial.
  
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleConsultAI = async (question: string) => {
    setIsLoadingAi(true);
    addMessage({ id: 'loading-consult', sender: 'ai', type: 'loading', timestamp: Date.now(), isLoading: true });

    const consultInput: ConsultAIOnLessonInput = {
      topicName: currentLessonParams.topicName,
      concept: currentLessonParams.computationalConcept,
      area: currentLessonParams.subjectArea,
      grade: currentLessonParams.gradeLevel,
      question,
    };

    try {
      const response = await consultAIOnLesson(consultInput);
      setMessages(prev => prev.filter(m => m.id !== 'loading-consult'));
      addMessage({
        id: Date.now().toString(),
        sender: 'ai',
        text: response.answer,
        timestamp: Date.now(),
        type: 'text',
      });
    } catch (error) {
      console.error("Error consultando a la IA:", error);
      setMessages(prev => prev.filter(m => m.id !== 'loading-consult'));
      addMessage({
        id: Date.now().toString(),
        sender: 'ai',
        error: `Falló la obtención de respuesta. ${error instanceof Error ? error.message : 'Error desconocido.'}`,
        timestamp: Date.now(),
        type: 'error',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || isLoadingAi) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
      type: 'text',
    };
    addMessage(userMessage);
    const lowerInputValue = inputValue.toLowerCase();

    if (editingField) {
      handleParameterInputChange(editingField, inputValue);
    } else if (lowerInputValue.includes('generar nuevas actividades') || lowerInputValue.includes('generar más actividades')) {
      addMessage({
        id: Date.now().toString(),
        sender: 'system',
        text: '¡Entendido! Generando un nuevo set de actividades con los parámetros actuales.',
        timestamp: Date.now(),
        type: 'text',
      });
      handleGenerateActivities(currentLessonParams);
    } else if (lowerInputValue.includes('cambiar tema')) {
      editFieldHandler('topicName');
    } else if (lowerInputValue.includes('cambiar concepto')) {
       editFieldHandler('computationalConcept');
    } else if (lowerInputValue.includes('cambiar área temática') || lowerInputValue.includes('cambiar área')) {
       editFieldHandler('subjectArea');
    } else if (lowerInputValue.includes('cambiar nivel de grado') || lowerInputValue.includes('cambiar grado')) {
       editFieldHandler('gradeLevel');
    }
    else {
      handleConsultAI(inputValue);
    }
    setInputValue('');
  };

  const handleParameterInputChange = (field: keyof LessonParams, value: string) => {
    const updatedParams = { ...currentLessonParams, [field]: value };
    setCurrentLessonParams(updatedParams);
    saveLessonParamsToLocalStorage(updatedParams); 
    setEditingField(null);
    
    let fieldLabel = '';
    switch(field) {
      case 'topicName': fieldLabel = 'Tema'; break;
      case 'computationalConcept': fieldLabel = 'Concepto computacional'; break;
      case 'subjectArea': fieldLabel = 'Área temática'; break;
      case 'gradeLevel': fieldLabel = 'Nivel de grado'; break;
      default: fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    addMessage({
      id: Date.now().toString(),
      sender: 'system',
      text: `${fieldLabel} actualizado a: "${value}".\nPuedes escribir "generar nuevas actividades" para usar este nuevo parámetro, o hacer otra pregunta.`,
      timestamp: Date.now(),
      type: 'text',
    });
  };
  
  const handleSelectParameterChange = (field: keyof LessonParams, value: string) => {
    setMessages(prev => prev.filter(m => m.type !== 'parameter_select_area' && m.type !== 'parameter_select_grade'));
    handleParameterInputChange(field, value);
  };
  
  const editFieldHandler = useCallback((field: keyof LessonParams) => {
    if (field === 'subjectArea') {
      addMessage({id: Date.now().toString(), sender: 'system', text: "Por favor, selecciona la nueva área temática:", lessonParams: currentLessonParams, timestamp: Date.now(), type: 'parameter_select_area'});
    } else if (field === 'gradeLevel') {
      addMessage({id: Date.now().toString(), sender: 'system', text: "Por favor, selecciona el nuevo nivel de grado:", lessonParams: currentLessonParams, timestamp: Date.now(), type: 'parameter_select_grade'});
    } else {
      let fieldLabel = 'parámetro';
      if (field === 'topicName') fieldLabel = `tema`;
      if (field === 'computationalConcept') fieldLabel = `concepto computacional`;

      addMessage({ id: Date.now().toString(), sender: 'system', text: `¿Cuál es el nuevo ${fieldLabel} que deseas establecer?`, timestamp: Date.now(), type: 'text' });
      setEditingField(field);
      inputRef.current?.focus();
    }
  }, [currentLessonParams]);


  useEffect(() => {
    handleParameterEdit(editFieldHandler);
  }, [editFieldHandler, handleParameterEdit]);


  const handleOpenEditor = (content: string, title: string) => {
    setCurrentEditingContent(content);
    setEditedContentInModal(content); // Initialize textarea content
    setCurrentEditingTitle(title);
    setIsEditorOpen(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editedContentInModal)
      .then(() => {
        toast({ title: "Copiado", description: "El contenido ha sido copiado al portapapeles." });
      })
      .catch(err => {
        toast({ title: "Error", description: "No se pudo copiar el contenido.", variant: "destructive" });
        console.error('Error al copiar al portapapeles:', err);
      });
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <ScrollArea className="flex-grow p-4 w-full max-w-4xl" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem 
              key={msg.id} 
              message={msg} 
              onParameterChange={handleSelectParameterChange} 
              currentLessonParams={currentLessonParams}
              onEditMessage={handleOpenEditor}
            />
          ))}
        </div>
      </ScrollArea>

      <footer className="p-3 border-t bg-card w-full max-w-4xl">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={editingField ? 
              (editingField === 'topicName' ? 'Ingresa el nuevo tema...' : 
               editingField === 'computationalConcept' ? 'Ingresa el nuevo concepto computacional...' : 
               `Ingresa nuevo ${editingField.toLowerCase()}...`) 
              : "Escribe tu mensaje o un comando..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoadingAi && handleSendMessage()}
            disabled={isLoadingAi}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage} disabled={isLoadingAi || inputValue.trim() === ''} size="icon">
            {isLoadingAi ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-1">
          Puedes decir: "cambiar tema", "generar nuevas actividades", o hacer cualquier pregunta.
        </p>
      </footer>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentEditingTitle}</DialogTitle>
            <DialogDescription>
              Puedes editar el siguiente texto y copiarlo al portapapeles.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedContentInModal}
            onChange={(e) => setEditedContentInModal(e.target.value)}
            className="flex-grow w-full h-full resize-none border rounded-md p-2 text-sm"
            placeholder="Contenido editable..."
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={handleCopyToClipboard}>
              <Copy className="mr-2 h-4 w-4" /> Copiar al Portapapeles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;

    
