'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InitialSetupForm from '@/components/chat/InitialSetupForm';
import ChatInterface from '@/components/chat/ChatInterface';
import type { LessonParams } from '@/types';
import { getLessonParamsFromLocalStorage, clearLessonParamsFromLocalStorage, clearChatHistoryFromLocalStorage } from '@/lib/localStorageUtils';
import { Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function HomePage() {
  const [lessonParams, setLessonParams] = useState<LessonParams | null>(null);
  const [isLoadingParams, setIsLoadingParams] = useState(true);

  // Este estado y manejador se pasarán hacia abajo para controlar la edición de parámetros desde la cabecera.
  const [parameterEditRequestHandler, setParameterEditRequestHandler] = useState<(field: keyof LessonParams) => void>(() => () => {});


  const loadParams = useCallback(() => {
    const params = getLessonParamsFromLocalStorage();
    setLessonParams(params);
    setIsLoadingParams(false);
  }, []);
  
  useEffect(() => {
    loadParams();
  }, [loadParams]);

  const handleSetupComplete = (params: LessonParams) => {
    setLessonParams(params);
  };

  const handleResetSetup = () => {
    clearLessonParamsFromLocalStorage();
    clearChatHistoryFromLocalStorage(); // También limpiar el historial de chat
    setLessonParams(null);
  };
  
  if (isLoadingParams) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
       <AppShell
          page={!lessonParams ? 'setup' : 'chat'}
          lessonParams={lessonParams}
          onResetSetup={handleResetSetup}
          // La cabecera llamará a esta función cuando el usuario quiera editar un parámetro
          onParameterEdit={(field) => parameterEditRequestHandler(field)}
        >
        {!lessonParams ? (
            <div className="flex flex-1 justify-center items-center p-4 relative">
              <InitialSetupForm onSetupComplete={handleSetupComplete} />
            </div>
        ) : (
            <ChatInterface 
              initialParams={lessonParams} 
              onResetSetup={handleResetSetup}
              // ChatInterface nos dará la función para manejar la edición
              setParameterEditRequestHandler={setParameterEditRequestHandler}
            />
        )}
       </AppShell>
    </ProtectedRoute>
  );
}