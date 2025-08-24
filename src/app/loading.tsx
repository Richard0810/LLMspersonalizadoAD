
'use client';

import { Loader2 } from 'lucide-react';
import InteractiveBackground from '@/components/shared/InteractiveBackground';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <InteractiveBackground />
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground font-medium">Cargando EduSpark AI...</p>
    </div>
  );
}
