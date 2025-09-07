
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
    <header className="flex items-center justify-between p-3 border-b bg-card shadow-sm z-20 gap-3 md:gap-4">
      {/* Universidad de Cordoba */}
      <div className="flex items-center gap-3 md:gap-4">
         <Image
          src={`/logo_unicor.png?t=${new Date().getTime()}`}
          alt="Logo Universidad de Córdoba"
          width={180}
          height={60}
          className="transition-all duration-300 hover:scale-110 w-auto h-10 md:h-12"
        />
        <div className="hidden md:block text-left">
          <h1 className="text-base md:text-xl font-headline font-bold uppercase text-foreground tracking-wider">
            Universidad de Córdoba
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Licenciatura en Informática</p>
        </div>
      </div>
      
      {/* Institucion Educativa */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right">
          <h1 className="text-base md:text-xl font-headline font-bold uppercase text-foreground tracking-wider">
            I.E. Alfonso Spath Spath
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">
             {page === 'chat' ? 'Asistente EduSpark AI' : 'Configuración de Actividad'}
          </p>
        </div>
        <Image
          src="/escudo.jpg"
          alt="Escudo Institucional"
          width={64}
          height={64}
          className="transition-all duration-300 hover:scale-110 w-12 h-12 md:w-16 md:h-16"
        />
      </div>

      <div className="flex items-center gap-2">
        {page === 'chat' && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" /> <span className="hidden md:inline">Modificar Parámetros</span>
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
