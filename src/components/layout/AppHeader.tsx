
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import type { Activity, LessonParams } from '@/types';
import { getActivityHistoryFromLocalStorage } from '@/lib/localStorageUtils';
import { LogOut, History, Edit3, Settings, Brain, BookOpen, Target, GraduationCap, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  page: 'chat' | 'setup';
  lessonParams?: LessonParams | null;
  onResetSetup?: () => void;
  onParameterEdit?: (field: keyof LessonParams) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ page, lessonParams, onResetSetup, onParameterEdit }) => {
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const { logout, user } = useAuth();
  const router = useRouter();

  const loadHistory = useCallback(() => {
    const history = getActivityHistoryFromLocalStorage();
    setActivityHistory(history);
  }, []);

  useEffect(() => {
    loadHistory();
    // Set up a listener for when activities are updated in another component
    const handleStorageChange = () => loadHistory();
    window.addEventListener('storage', handleStorageChange);
    // Also listen for a custom event
    window.addEventListener('activityHistoryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activityHistoryUpdated', handleStorageChange);
    };
  }, [loadHistory]);

  const ParameterEditButton = ({ field, label, icon: IconComp }: { field: keyof LessonParams, label: string, icon: React.ElementType }) => (
    <Button variant="outline" size="sm" onClick={() => onParameterEdit?.(field)} className="flex items-center gap-2 w-full justify-start">
      <IconComp className="h-4 w-4" /> {label}
    </Button>
  );

  return (
    <header className="flex items-center justify-between p-3 border-b bg-card shadow-sm z-20">
      <div className="flex-1">
        <div className="flex items-center gap-4 bg-gradient-to-r from-green-500 via-white to-red-500 p-4 rounded-2xl shadow-lg">
            <Image 
              src="/escudo.jpg"
              alt="Escudo Institucional IE Alfonso Spath Spath"
              width={56}
              height={56}
              className="transition-transform duration-300 hover:scale-110"
            />
            <div className="text-left">
              <h1 className="text-xl font-bold text-black">
                Institucion Educativa Alfonso Spath Spath
              </h1>
              <h2 className="text-base text-gray-700">
                {page === 'chat' ? 'Asistente EduSpark AI' : 'Configuración de Actividad'}
              </h2>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {page === 'chat' && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Modificar Parámetros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Editar Parámetros de Actividad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onParameterEdit?.('topicName')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Tema a Tratar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onParameterEdit?.('computationalConcept')}>
                  <Brain className="mr-2 h-4 w-4" />
                  <span>Concepto</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onParameterEdit?.('subjectArea')}>
                  <Target className="mr-2 h-4 w-4" />
                  <span>Área Temática</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onParameterEdit?.('gradeLevel')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>Nivel de Grado</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onResetSetup} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Edit3 className="mr-2 h-4 w-4" /> Reiniciar Config. Inicial
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        
         <DropdownMenu onOpenChange={(open) => { if(open) loadHistory(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <History className="h-4 w-4" /> Historial
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Historial de Actividades (Últimas 10)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activityHistory.length > 0 ? (
              activityHistory.map(activity => (
                <DropdownMenuItem key={activity.id} onClick={() => router.push(`/activity/${activity.id}`)}>
                  {activity.activityName}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Aún no hay historial.</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p>Sesión iniciada como</p>
              <p className="font-medium text-primary">{user?.username}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
