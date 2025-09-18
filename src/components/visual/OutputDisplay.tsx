
'use client';

import React, { useRef, useEffect, useCallback, forwardRef, useState } from 'react';
import { VisualFormat } from '@/types';
import type { GeneratedContentType, GeneratedImageType, GeneratedHtmlType, GeneratedConceptMapDataType, GeneratedMindMapDataType, GeneratedFlowchartDataType, GeneratedVennDiagramDataType, GeneratedComparisonTableDataType, GeneratedTimelineDataType } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';


interface OutputDisplayProps {
  content: GeneratedContentType | null;
  format: VisualFormat | null;
}

const RenderConceptMap = forwardRef<HTMLDivElement, { data: GeneratedConceptMapDataType }>(({ data }, ref) => {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({});

  const updateLines = useCallback(() => {
    const container = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    if (!containerRect) return;

    data.connections.forEach((conn, index) => {
      const startElem = nodeRefs.current[conn.from];
      const endElem = nodeRefs.current[conn.to];
      const line = lineRefs.current[`line-${index}`];
      
      if (!startElem || !endElem || !line) return;

      const rectStart = startElem.getBoundingClientRect();
      const rectEnd = endElem.getBoundingClientRect();

      const x1 = rectStart.left + rectStart.width / 2 - containerRect.left;
      const y1 = rectStart.top + rectStart.height / 2 - containerRect.top;
      const x2 = rectEnd.left + rectEnd.width / 2 - containerRect.left;
      const y2 = rectEnd.top + rectEnd.height / 2 - containerRect.top;

      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
    });
  }, [data.connections, ref]);

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    
    const handleFullscreenChange = () => {
        setTimeout(updateLines, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
        window.removeEventListener('resize', updateLines);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [updateLines]);
  
  useEffect(() => {
    const container = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!container) return;
    Object.values(nodeRefs.current).forEach(node => {
      if (!node) return;
      let isDragging = false;
      let offsetX = 0, offsetY = 0;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        offsetX = e.clientX - node.getBoundingClientRect().left;
        offsetY = e.clientY - node.getBoundingClientRect().top;
        node.style.zIndex = '1000';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const containerRect = container.getBoundingClientRect();
        
        let newX = e.clientX - offsetX - containerRect.left;
        let newY = e.clientY - offsetY - containerRect.top;

        newX = Math.max(0, Math.min(newX, containerRect.width - node.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - node.offsetHeight));
        
        node.style.left = `${newX}px`;
        node.style.top = `${newY}px`;
        
        updateLines();
      };

      const onMouseUp = () => {
        isDragging = false;
        node.style.zIndex = '10';
      };

      node.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        node.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    });
  }, [data.nodes, updateLines, ref]);


  return (
    <div 
        ref={ref}
        className="relative border rounded bg-white shadow overflow-hidden" 
        style={{ width: '100%', height: '800px', maxWidth: '1200px', margin: 'auto' }}
    >
        <svg
            className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none"
        >
          {data.connections.map((_, index) => (
            <line
              key={`line-${index}`}
              ref={(el) => { lineRefs.current[`line-${index}`] = el; }}
              className="stroke-gray-600 stroke-[1.5]"
            />
          ))}
        </svg>

        {data.nodes.map(node => (
          <div
            key={node.id}
            ref={el => { nodeRefs.current[node.id] = el; }}
            className={cn(
                "absolute p-2 px-4 rounded-lg cursor-move z-10 text-center select-none text-sm",
                node.type === 'principal' && 'bg-blue-700 text-white border-2 border-blue-400 font-bold p-3 text-base',
                node.type === 'concepto' && 'bg-blue-100 border border-blue-300 shadow-[0_0_0_3px_#e6f3ff]',
                node.type === 'conector' && 'bg-gray-50 border border-gray-300 shadow-md italic'
            )}
            style={{
              top: `${node.position.top}px`,
              left: `${node.position.left}px`,
            }}
          >
            {node.label}
          </div>
        ))}
    </div>
  );
});
RenderConceptMap.displayName = 'RenderConceptMap';

const RenderMindMap = forwardRef<HTMLDivElement, { data: GeneratedMindMapDataType }>(({ data }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const drawBranches = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const mapContainer = (ref as React.RefObject<HTMLDivElement>)?.current;
        
        if (!canvas || !ctx || !mapContainer) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#94a3b8'; // slate-400
        ctx.lineWidth = 2;
        
        const centralNode = nodeRefs.current['central'];
        if (!centralNode) return;

        const mapContainerRect = mapContainer.getBoundingClientRect();
        const centralRect = centralNode.getBoundingClientRect();
        const centralX = centralRect.left + centralRect.width / 2 - mapContainerRect.left;
        const centralY = centralRect.top + centralRect.height / 2 - mapContainerRect.top;

        data.branches.forEach(branch => {
            const node = nodeRefs.current[branch.id];
            if (!node) return;

            const rect = node.getBoundingClientRect();
            const nodeX = rect.left + rect.width / 2 - mapContainerRect.left;
            const nodeY = rect.top + rect.height / 2 - mapContainerRect.top;
            
            ctx.beginPath();
            ctx.moveTo(centralX, centralY);
            ctx.bezierCurveTo(centralX, nodeY, nodeX, centralY, nodeX, nodeY);
            ctx.stroke();
        });
    }, [data.branches, ref]);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (canvas && container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            drawBranches();
        }
    }, [ref, drawBranches]);


    const handleFullscreenChange = useCallback(() => {
        setTimeout(resizeCanvas, 100);
    }, [resizeCanvas]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [resizeCanvas, handleFullscreenChange]);

    useEffect(() => {
        const allNodes = { ...nodeRefs.current };
        const mapContainer = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!mapContainer) return;

        Object.values(allNodes).forEach(node => {
            if (!node) return;
            
            let offsetX: number, offsetY: number;
            let isDragging = false;

            const onMouseDown = (e: MouseEvent) => {
                isDragging = true;
                node.style.cursor = 'grabbing';
                node.style.zIndex = '1000';
                
                const rect = node.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
            };

            const onMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                
                const containerRect = mapContainer.getBoundingClientRect();
                let newX = e.clientX - containerRect.left - offsetX;
                let newY = e.clientY - containerRect.top - offsetY;

                newX = Math.max(0, Math.min(newX, containerRect.width - node.offsetWidth));
                newY = Math.max(0, Math.min(newY, containerRect.height - node.offsetHeight));

                node.style.left = `${newX}px`;
                node.style.top = `${newY}px`;
                drawBranches();
            };

            const onMouseUp = () => {
                isDragging = false;
                node.style.cursor = 'move';
                node.style.zIndex = '10';
            };

            node.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            return () => {
                node.removeEventListener('mousedown', onMouseDown);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
        });
    }, [data.branches, data.title, drawBranches, ref]);

    return (
        <div 
            ref={ref}
            className="relative border rounded bg-slate-50 shadow-inner overflow-hidden text-center"
            style={{ width: '100%', height: '800px', maxWidth: '1200px', margin: 'auto' }}
        >
            <canvas ref={el => { canvasRef.current = el; }} className="absolute top-0 left-0 pointer-events-none z-[1]"></canvas>
            <div 
                id="central" 
                ref={el => { nodeRefs.current['central'] = el; }}
                className="node-draggable absolute bg-primary text-primary-foreground p-4 rounded-xl shadow-lg cursor-move z-[10] text-lg font-bold flex items-center justify-center"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', minWidth: '150px', minHeight: '60px' }}
            >
                {data.title}
            </div>
            {data.branches.map(branch => (
                <div
                    key={branch.id}
                    id={branch.id}
                    ref={el => { nodeRefs.current[branch.id] = el; }}
                    className="node-draggable absolute bg-card text-card-foreground p-3 rounded-lg shadow-md cursor-move z-[10] w-48 text-left border border-border"
                    style={{ top: branch.position.top, left: branch.position.left }}
                >
                    <strong className="text-base text-accent font-semibold">{branch.title}</strong>
                    <ul className="list-none p-0 mt-2 text-sm text-muted-foreground space-y-1">
                        {branch.children.map((child, i) => (
                           <li key={i} className="flex items-start">
                             <span className="text-primary mr-2 mt-1">&#8226;</span>
                             <span>{child}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
});
RenderMindMap.displayName = 'RenderMindMap';

const RenderFlowchart = forwardRef<HTMLDivElement, { data: GeneratedFlowchartDataType }>(({ data }, ref) => {
    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const lineRefs = useRef<Record<string, SVGPathElement | null>>({});

    const updateLines = useCallback(() => {
        const container = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();

        data.connections.forEach(conn => {
            const fromNode = nodeRefs.current[conn.from];
            const toNode = nodeRefs.current[conn.to];
            const line = lineRefs.current[`line-${conn.from}-${conn.to}`];

            if (fromNode && toNode && line) {
                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();
                
                const startX = fromRect.left + fromRect.width / 2 - containerRect.left;
                const startY = fromRect.bottom - containerRect.top;
                const endX = toRect.left + toRect.width / 2 - containerRect.left;
                const endY = toRect.top - containerRect.top;

                const path = `M${startX},${startY} L${endX},${endY}`;
                line.setAttribute('d', path);
            }
        });
    }, [data.connections, ref]);

    const handleFullscreenChange = useCallback(() => {
        setTimeout(updateLines, 100);
    }, [updateLines]);

    useEffect(() => {
        updateLines();
        window.addEventListener('resize', updateLines);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            window.removeEventListener('resize', updateLines);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [updateLines, handleFullscreenChange]);

    useEffect(() => {
        const container = (ref as React.RefObject<HTMLDivElement>)?.current;
        if (!container) return;

        let draggedNode: HTMLDivElement | null = null;
        let offsetX = 0;
        let offsetY = 0;

        const onMouseDown = (e: MouseEvent | TouchEvent) => {
            const target = e.target as HTMLElement;
            const node = target.closest('.flowchart-node') as HTMLDivElement | null;
            if (!node) return;

            if (e.type === 'touchstart') e.preventDefault();
            
            draggedNode = node;
            const rect = node.getBoundingClientRect();
            const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            offsetX = startX - rect.left;
            offsetY = startY - rect.top;
            
            node.style.zIndex = '1000';
        };

        const onMouseMove = (e: MouseEvent | TouchEvent) => {
            if (draggedNode) {
                if (e.type === 'touchmove') e.preventDefault();

                const containerRect = container.getBoundingClientRect();
                const moveX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                const moveY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                
                let newX = moveX - containerRect.left - offsetX;
                let newY = moveY - containerRect.top - offsetY;

                newX = Math.max(0, Math.min(newX, containerRect.width - draggedNode.offsetWidth));
                newY = Math.max(0, Math.min(newY, containerRect.height - draggedNode.offsetHeight));

                draggedNode.style.left = `${newX}px`;
                draggedNode.style.top = `${newY}px`;
                updateLines();
            }
        };

        const onMouseUp = () => {
            if (draggedNode) {
                draggedNode.style.zIndex = '10';
            }
draggedNode = null;
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('touchstart', onMouseDown, { passive: false });
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchend', onMouseUp);

        return () => {
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('touchstart', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchend', onMouseUp);
        };
    }, [updateLines, ref]);

    return (
        <div 
            ref={ref}
            className="relative border rounded bg-white shadow overflow-hidden" 
            style={{ width: '100%', height: '800px', maxWidth: '1200px', margin: 'auto' }}
        >
            <svg className="absolute top-0 left-0 w-full h-full z-[1] pointer-events-none">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                    </marker>
                </defs>
                {data.connections.map(conn => (
                    <path
                        key={`line-${conn.from}-${conn.to}`}
                        id={`line-${conn.from}-${conn.to}`}
                        ref={el => { lineRefs.current[`line-${conn.from}-${conn.to}`] = el; }}
                        stroke="#333"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                        fill="none"
                    />
                ))}
            </svg>

            {data.nodes.map(node => (
                <div
                    key={node.id}
                    ref={el => { nodeRefs.current[node.id] = el; }}
                    className={cn(
                        "flowchart-node absolute p-2 px-4 rounded-lg cursor-move z-10 text-center select-none text-sm border-2 border-gray-700 bg-white",
                        node.type === 'start-end' && 'rounded-full bg-pink-200 border-pink-500',
                        node.type === 'process' && 'bg-blue-100 border-blue-400',
                        node.type === 'decision' && 'transform rotate-45 w-32 h-32 flex items-center justify-center bg-green-100 border-green-400'
                    )}
                    style={{
                        top: `${node.position.top}px`,
                        left: `${node.position.left}px`,
                    }}
                >
                    <span className={cn(node.type === 'decision' && 'transform -rotate-45 block')}>
                        {node.label}
                    </span>
                </div>
            ))}
        </div>
    );
});
RenderFlowchart.displayName = 'RenderFlowchart';

const RenderVennDiagram = forwardRef<HTMLDivElement, { data: GeneratedVennDiagramDataType }>(({ data }, ref) => {
  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto p-8 bg-white" style={{ minHeight: '400px' }}>
      <div className="relative h-80">
        {/* Circle A */}
        <div 
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-52 h-52 rounded-full bg-blue-500/20 border-2 border-blue-600 flex items-center justify-center"
        >
          <h3 className="font-bold text-lg text-blue-800 -translate-x-12">{data.circleA.label}</h3>
        </div>
        
        {/* Circle B */}
        <div 
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-52 h-52 rounded-full bg-red-500/20 border-2 border-red-600 flex items-center justify-center"
        >
          <h3 className="font-bold text-lg text-red-800 translate-x-12">{data.circleB.label}</h3>
        </div>

        {/* Content */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[calc(25%-1rem)] text-center text-sm space-y-1">
          {data.circleA.items.map((item, i) => <div key={i} className="bg-blue-100 p-1 rounded text-black">{item}</div>)}
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[calc(25%-1rem)] text-center text-sm space-y-1">
          {data.circleB.items.map((item, i) => <div key={i} className="bg-red-100 p-1 rounded text-black">{item}</div>)}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 text-center text-sm space-y-1">
           {data.intersection.label && <h4 className="font-semibold text-purple-800">{data.intersection.label}</h4>}
          {data.intersection.items.map((item, i) => <div key={i} className="bg-purple-200 p-1 rounded text-black">{item}</div>)}
        </div>
      </div>
    </div>
  );
});
RenderVennDiagram.displayName = 'RenderVennDiagram';

const RenderComparisonTable = forwardRef<HTMLDivElement, { data: GeneratedComparisonTableDataType }>(({ data }, ref) => {
    return (
        <div ref={ref} className="w-full max-w-4xl mx-auto p-4 font-sans bg-white">
            <table className="w-full border-collapse">
                <caption className="p-2.5 font-bold text-lg text-black">{data.title}</caption>
                <thead>
                    <tr>
                        {data.headers.map((header, index) => (
                            <th key={index} className="border border-[#ddd] p-3 text-center bg-primary text-primary-foreground">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="even:bg-muted/50 hover:bg-muted">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-[#ddd] p-3 text-center text-foreground">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
RenderComparisonTable.displayName = 'RenderComparisonTable';

const RenderTimeline = forwardRef<HTMLDivElement, { data: GeneratedTimelineDataType }>(({ data }, ref) => {
    return (
      <div ref={ref} className="w-full h-full max-w-4xl mx-auto font-sans bg-white flex flex-col">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8 pt-4 sm:pt-6 px-4 sm:px-6 flex-shrink-0">{data.title}</h2>
        <div className="flex-grow overflow-y-auto px-4 sm:px-6 pb-6">
            <div className="relative">
            {/* Central Line */}
            <div className="absolute left-1/2 h-full w-0.5 bg-border -translate-x-1/2"></div>

            {data.events.map((event, index) => (
                <div key={index} className="relative mb-8 flex items-center justify-between w-full">
                {/* Event Content */}
                <div className={cn(
                    "w-[calc(50%-2rem)]",
                    index % 2 === 0 ? "text-right" : "order-1 text-left"
                )}>
                    <div className={cn(
                    "p-4 rounded-lg shadow-lg border-l-4",
                    index % 2 === 0 ? "border-primary" : "border-accent"
                    )}>
                    <p className="text-sm font-semibold text-muted-foreground">{event.date}</p>
                    <h3 className="text-lg font-bold text-foreground mt-1">{event.title}</h3>
                    <p className="text-sm text-foreground/80 mt-2">{event.description}</p>
                    </div>
                </div>
                
                {/* Milestone Icon */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    index % 2 === 0 ? "bg-primary" : "bg-accent"
                    )}>
                    <Calendar className="w-5 h-5 text-white" />
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    );
});
RenderTimeline.displayName = 'RenderTimeline';


const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, format }) => {
  const displayContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!content) {
    return <p className="text-center text-muted-foreground">Aún no se ha generado contenido.</p>;
  }

  const handleImageDownload = (imageContent: GeneratedImageType) => {
    const link = document.createElement('a');
    link.href = imageContent.url;
    
    let filename = "imagen_generada_eduspark";
    if (imageContent.alt && typeof imageContent.alt === 'string') {
        const sanitizedAlt = imageContent.alt.substring(0, 100).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "_");
        if (sanitizedAlt) filename = sanitizedAlt;
    }

    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHtmlDownloadAsPdf = async (htmlContent: GeneratedHtmlType) => {
    // Dynamic import for client-side library
    const { default: html2pdf } = await import('html2pdf.js');

    const element = document.createElement('div');
    element.innerHTML = htmlContent.content;

    const opt = {
      margin:       0.5,
      filename:     `${htmlContent.title || 'infografia'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();

    toast({
      title: "Descargando PDF",
      description: "La descarga de tu infografía comenzará en breve.",
    });
  };


  const handleFullscreen = () => {
    const elementToFullscreen = displayContainerRef.current;
    if (elementToFullscreen && 'requestFullscreen' in elementToFullscreen) {
        (elementToFullscreen as HTMLElement).requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        toast({
          title: "Error de Pantalla Completa",
          description: "No se pudo activar la pantalla completa. Es posible que tu navegador no lo soporte.",
          variant: "destructive",
        });
      });
    }
  };
  
  const renderContent = () => {
    switch (content.type) {
      case 'image':
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={content.url} 
              alt={content.alt || 'Imagen Generada'} 
              className="max-w-full h-auto rounded-lg shadow-lg border" 
              style={{maxHeight: '70vh'}}
            />
          </div>
        );
      case 'html':
        return (
            <div className="w-full aspect-video max-h-[70vh]">
              <iframe
                ref={displayContainerRef as React.RefObject<HTMLIFrameElement>}
                srcDoc={content.content}
                title={content.title || "Contenido HTML Generado"}
                className="w-full h-full border-0 rounded bg-background shadow"
                sandbox="allow-scripts allow-same-origin" 
              />
            </div>
        );
      case 'concept-map-data':
        return <RenderConceptMap ref={displayContainerRef} data={content} />;
      case 'mind-map-data':
        return <RenderMindMap ref={displayContainerRef} data={content} />;
      case 'flowchart-data':
        return <RenderFlowchart ref={displayContainerRef} data={content} />;
      case 'venn-diagram-data':
        return <RenderVennDiagram ref={displayContainerRef} data={content} />;
      case 'comparison-table-data':
        return <RenderComparisonTable ref={displayContainerRef} data={content} />;
      case 'timeline-data':
        return <RenderTimeline ref={displayContainerRef} data={content} />;
      default:
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Tipo de contenido desconocido.</AlertDescription></Alert>;
    }
  };

  const showFullscreenButton = [
    'html', 'concept-map-data', 'mind-map-data', 'flowchart-data', 
    'venn-diagram-data', 'comparison-table-data', 'timeline-data'
  ].includes(content.type);

  return (
    <div className="w-full space-y-4">
      {'title' in content && content.title && <h3 className="text-lg font-semibold text-primary mb-2 text-center">{content.title}</h3>}
      {renderContent()}
      <div className="flex justify-center items-center gap-4 mt-4">
        {content.type === 'image' && (
             <Button onClick={() => handleImageDownload(content as GeneratedImageType)} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Descargar Imagen
            </Button>
        )}
        {content.type === 'html' && (
             <Button onClick={() => handleHtmlDownloadAsPdf(content as GeneratedHtmlType)} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Descargar como PDF
            </Button>
        )}
        {showFullscreenButton && (
           <Button onClick={handleFullscreen} variant="outline">
                <Maximize className="mr-2 h-4 w-4" /> Pantalla Completa
            </Button>
        )}
      </div>
    </div>
  );
};

export default OutputDisplay;
