
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
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppHeader } from './AppHeader';
import type { LessonParams } from '@/types';
import { BookOpen, HelpCircle } from 'lucide-react';
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
          <SidebarHeader>
            <div className="flex flex-col items-center gap-2 text-center p-2">
               <Image
                src="/logo_unicor.png"
                alt="Logo Universidad de Córdoba"
                width={150}
                height={50}
                priority
                className="w-auto h-12"
              />
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold text-foreground">Licenciatura en Informática</p>
                <p className="text-[10px] text-muted-foreground">Facultad de Educación y Ciencias Humanas</p>
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
                <Link href="/learn" legacyBehavior passHref>
                  <SidebarMenuButton asChild isActive={pathname === '/learn'}>
                    <a>
                      <HelpCircle />
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
                <div className='group-data-[collapsible=icon]:hidden'>
                    <p className="text-xs font-bold text-foreground">I.E. Alfonso Spath Spath</p>
                    <p className="text-xs text-muted-foreground">Martinez - Cereté, Córdoba</p>
                </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className='flex flex-col'>
           <AppHeader
              page={page}
              lessonParams={lessonParams}
              onResetSetup={onResetSetup}
              onParameterEdit={onParameterEdit}
            />
          <main className="flex-1 flex flex-col overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
};
