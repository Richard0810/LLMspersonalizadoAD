
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

  return (
    <header className="flex flex-wrap items-center justify-between p-3 border-b bg-card shadow-sm z-20 gap-x-4 gap-y-2">
      {/* Wrapper for both institutions */}
      <div className="flex flex-wrap items-center justify-between w-full lg:w-auto lg:flex-nowrap lg:flex-1 gap-4">
          {/* Universidad de Cordoba */}
          <div className="flex items-center gap-2 min-w-0">
             <Image
              src="/logo_unicor.png"
              alt="Logo Universidad de Córdoba"
              width={150}
              height={50}
              priority
              className="transition-all duration-300 hover:scale-105 w-auto h-8 md:h-12 flex-shrink-0"
            />
            <div className="text-left min-w-0">
              <h1 className="text-xs md:text-sm font-headline font-bold uppercase text-foreground tracking-wider truncate">
                Licenciatura en Informática
              </h1>
              <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">Facultad de Educación y Ciencias Humanas</p>
            </div>
          </div>
          
          {/* Institucion Educativa */}
          <div className="flex items-center gap-2 min-w-0 justify-end">
            <div className="text-right min-w-0">
              <h1 className="text-xs md:text-sm font-headline font-bold uppercase text-foreground tracking-wider truncate">
                I.E. Alfonso Spath Spath
              </h1>
              <p className="text-[10px] md:text-sm text-muted-foreground font-medium truncate">
                 Martinez - Cereté, Córdoba
              </p>
            </div>
            <Image
              src="/escudo.jpg"
              alt="Escudo Institucional"
              width={60}
              height={60}
              priority
              className="transition-all duration-300 hover:scale-105 w-10 h-10 md:w-16 md:h-16 flex-shrink-0"
            />
          </div>
      </div>


      {/* Action buttons */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        {page === 'chat' && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" /> <span className="hidden md:inline">Modificar</span>
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
              <History className="h-4 w-4" /> <span className="hidden md:inline">Historial</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Historial de Actividades (Últimas 10)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activityHistory.length > 0 ? (
              activityHistory.map(activity => (
                <DropdownMenuItem key={activity.id} onClick={() => router.push(`/activity/${activity.id}`)}>
                  {activity.title}
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
