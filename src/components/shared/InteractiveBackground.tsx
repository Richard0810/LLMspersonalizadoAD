'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CircleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
}

const InteractiveBackground: React.FC = () => {
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))'];

  useEffect(() => {
    const numCircles = 15;
    const initialCircles: CircleProps[] = [];
    for (let i = 0; i < numCircles; i++) {
      initialCircles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 50 + 20, // size between 20 and 70
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: (Math.random() - 0.5) * 0.5, // Slower movement
        dy: (Math.random() - 0.5) * 0.5, // Slower movement
      });
    }
    setCircles(initialCircles);

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animateCircles = () => {
      setCircles(prevCircles =>
        prevCircles.map(circle => {
          let newX = circle.x + circle.dx;
          let newY = circle.y + circle.dy;

          // Boundary check
          if (newX > window.innerWidth + circle.size || newX < -circle.size) newX = Math.random() * window.innerWidth;
          if (newY > window.innerHeight + circle.size || newY < -circle.size) newY = Math.random() * window.innerHeight;
          
          // Interaction with mouse
          const distX = mousePosition.current.x - newX;
          const distY = mousePosition.current.y - newY;
          const distance = Math.sqrt(distX * distX + distY * distY);
          const interactionRadius = 200;
          
          let transform = '';
          if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius;
            transform = `translate(${-distX * force * 0.1}px, ${-distY * force * 0.1}px) scale(${1 + force * 0.1})`;
          }


          return { ...circle, x: newX, y: newY, transform };
        })
      );
      requestAnimationFrame(animateCircles);
    };

    const animationFrameId = requestAnimationFrame(animateCircles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {circles.map(circle => (
        <div
          key={circle.id}
          className="circle"
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            backgroundColor: circle.color,
            left: `${circle.x}px`,
            top: `${circle.y}px`,
            transform: (circle as any).transform || 'translate(0,0) scale(1)',
          }}
        />
      ))}
    </div>
  );
};

export default InteractiveBackground;
