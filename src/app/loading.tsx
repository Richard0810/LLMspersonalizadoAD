
'use client';

import InteractiveBackground from '@/components/shared/InteractiveBackground';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <InteractiveBackground />
      <div className="cube-container">
        <div className="cube">
          <div className="face front">Descomposición</div>
          <div className="face back">Abstracción</div>
          <div className="face right">Patrones</div>
          <div className="face left">Algoritmos</div>
          <div className="face top">EduSpark</div>
          <div className="face bottom">AI</div>
        </div>
      </div>
      <p className="mt-8 text-lg text-muted-foreground font-medium animate-pulse">Cargando EduSpark AI...</p>
    </div>
  );
}
