
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

  // This state and handler will be passed down to control chat messages from the header
  let handleParameterEdit = (field: keyof LessonParams) => {};

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
    clearChatHistoryFromLocalStorage(); // Also clear chat history
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
          onParameterEdit={(field) => handleParameterEdit(field)}
        >
        {!lessonParams ? (
            <div className="flex flex-1 justify-center items-center p-4">
              <InitialSetupForm onSetupComplete={handleSetupComplete} />
            </div>
        ) : (
            <ChatInterface 
              initialParams={lessonParams} 
              onResetSetup={handleResetSetup}
              // This prop is a bit of a workaround to lift the function up from ChatInterface
              handleParameterEdit={(func) => { handleParameterEdit = func; }} 
            />
        )}
       </AppShell>
    </ProtectedRoute>
  );
}
