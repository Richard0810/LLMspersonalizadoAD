

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import type { LessonParams } from '@/types';
import { BookOpen, BookOpenCheck, GraduationCap, ImageIcon, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProtectedRoute from '../auth/ProtectedRoute';

interface AppShellProps {
  children: React.ReactNode;
  page?: 'chat' | 'setup';
  lessonParams?: LessonParams | null;
  onResetSetup?: () => void;
  onParameterEdit?: (field: keyof LessonParams) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  page,
  lessonParams,
  onResetSetup,
  onParameterEdit
}) => {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-2">
            <div className="bg-muted/60 p-4 rounded-lg flex flex-col items-center gap-3 text-center">
               <Image
                src="/logo_unicor.png"
                alt="Logo Universidad de Córdoba"
                width={150}
                height={50}
                priority
                className="w-auto h-14"
              />
              <div className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0 flex flex-col items-center">
                 <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary"/>
                    <p className="text-xs font-bold text-foreground">Licenciatura en Informática</p>
                 </div>
                <p className="text-[10px] text-muted-foreground mt-1">Facultad de Educación y Ciencias Humanas</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <SidebarMenuButton asChild isActive={pathname === '/'}>
                    <a>
                      <BookOpen />
                      <span>Generar Actividades</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/visual" legacyBehavior passHref>
                  <SidebarMenuButton asChild isActive={pathname === '/visual'}>
                    <a>
                      <Palette />
                      <span>Generación Visual</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/learn" legacyBehavior passHref>
                  <SidebarMenuButton asChild isActive={pathname === '/learn'}>
                    <a>
                      <BookOpenCheck />
                      <span>Recursos</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <div className="flex items-center gap-2">
                <Image
                  src="/escudo.jpg"
                  alt="Escudo Institucional"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div className='transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0'>
                    <p className="text-xs font-bold text-foreground">I.E. Alfonso Spath Spath</p>
                    <p className="text-xs text-muted-foreground">Martinez - Cereté, Córdoba</p>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className='flex flex-1 flex-col'>
           <AppHeader
              page={page}
              lessonParams={lessonParams}
              onResetSetup={onResetSetup}
              onParameterEdit={onParameterEdit}
            />
          <main className="flex-1 flex flex-col overflow-auto">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};
