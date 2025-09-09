
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb } from "lucide-react";

export function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 left-4 z-50 shadow-lg rounded-full h-12 w-12">
          <HelpCircle className="h-6 w-6 text-primary" />
          <span className="sr-only">Ayuda y Funcionalidad</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Funcionalidad de EduSpark AI
          </DialogTitle>
          <DialogDescription className="text-base">
            ¡Bienvenido a EduSpark AI! Aquí tienes una guía rápida para usar la aplicación:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">1. Autenticación de Usuario</h4>
            <p className="text-muted-foreground">Regístrate para una nueva cuenta o inicia sesión si ya tienes una. Tu sesión se recuerda en tu navegador.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">2. Configuración Inicial</h4>
            <p className="text-muted-foreground">Antes de comenzar, proporcionarás detalles básicos para tu lección: Nombre, Concepto Computacional, Área Temática y Nivel de Grado.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">3. Generación de Actividades</h4>
            <p className="text-muted-foreground">La IA generará tres actividades educativas offline basadas en tu configuración. Estas aparecerán como tarjetas en el chat.</p>
          </div>
           <div className="space-y-2">
            <h4 className="font-semibold text-foreground">4. Consulta a la IA</h4>
            <p className="text-muted-foreground">Haz preguntas sobre pensamiento computacional, tu lección actual o actividades generadas. La IA te ayudará.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">5. Modificar Parámetros</h4>
            <p className="text-muted-foreground">Puedes cambiar los parámetros de la lección (nombre, concepto, área, grado) directamente en el chat para nuevas generaciones de actividades.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">6. Ver y Gestionar Actividades</h4>
            <p className="text-muted-foreground">Haz clic en "Ver Actividad Completa" en una tarjeta para ver los detalles. Tus últimas 10 actividades generadas se guardan en el menú desplegable "Historial de Actividades".</p>
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" variant="primary">¡Entendido!</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
