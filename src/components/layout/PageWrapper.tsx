// src/components/layout/PageWrapper.tsx
'use client';

import React from 'react';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { AppHeader } from './AppHeader';
import type { LessonParams } from '@/types';

interface PageWrapperProps {
  children: React.ReactNode;
  page: 'chat' | 'setup';
  lessonParams?: LessonParams | null;
  onResetSetup?: () => void;
  onParameterEdit?: (field: keyof LessonParams) => void;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, page, lessonParams, onResetSetup, onParameterEdit }) => {
  return (
    <div className="flex flex-col h-screen max-h-screen">
      <InteractiveBackground />
      <AppHeader 
        page={page} 
        lessonParams={lessonParams}
        onResetSetup={onResetSetup}
        onParameterEdit={onParameterEdit}
      />
      <main className="flex-grow flex flex-col justify-center items-center z-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};
