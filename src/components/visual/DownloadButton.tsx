
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Canvg } from 'canvg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DownloadButtonProps {
    svgContent: string;
    fileName: string;
}

type DownloadState = 'idle' | 'downloading' | 'complete';
type DownloadFormat = 'svg' | 'png' | 'jpeg';

export function DownloadButton({ svgContent, fileName }: DownloadButtonProps) {
    const [downloadState, setDownloadState] = useState<DownloadState>('idle');
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Reset state when svgContent changes
    useEffect(() => {
        setDownloadState('idle');
        setFileSize(null);
        setProgress(0);
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
    }, [svgContent]);
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const performDownload = (blob: Blob, format: DownloadFormat) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownload = async (format: DownloadFormat) => {
        setDownloadState('downloading');
        setProgress(0);
        setFileSize(null);
        
        // Start progress interval
        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) {
                    if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return 99;
                }
                return prev + 1;
            });
        }, 30); // 30ms * 100 = 3000ms (3s)

        try {
            let blob: Blob;

            if (format === 'svg') {
                blob = new Blob([svgContent], { type: 'image/svg+xml' });
            } else { // PNG or JPEG
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("No se pudo crear el contexto del canvas.");

                const viewBoxMatch = svgContent.match(/viewBox="0 0 (\d+) (\d+)"/);
                const width = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 200;
                const height = viewBoxMatch ? parseInt(viewBoxMatch[2], 10) : 280;
                
                canvas.width = width * 2; // Render @2x for better quality
                canvas.height = height * 2;
                
                const v = await Canvg.from(ctx, svgContent);
                v.resize(canvas.width, canvas.height, 'xMidYMid meet');
                await v.render();
                
                const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
                const res = await fetch(dataUrl);
                blob = await res.blob();
            }

            setFileSize(formatBytes(blob.size));
            if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setProgress(100);

            // Simulate download progress for animation
            setTimeout(() => {
                performDownload(blob, format);
                setDownloadState('complete');
                toast({
                    title: `¡Descargado como ${format.toUpperCase()}!`,
                    description: `Se ha descargado "${fileName}.${format}".`,
                });

                // Reset after completion animation
                setTimeout(() => {
                    setDownloadState('idle');
                    setProgress(0);
                }, 2000);

            }, 500); // Shorter delay after blob is ready

        } catch (error) {
            if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            console.error("Error al descargar:", error);
            toast({
                title: "Error de Descarga",
                description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
                variant: 'destructive'
            });
            setDownloadState('idle');
            setProgress(0);
        }
    };
    
    const labelClasses = cn('dl-label', {
        'is-downloading': downloadState === 'downloading',
        'is-complete': downloadState === 'complete',
    });

    return (
        <div className="dl-container">
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={downloadState !== 'idle'}>
                     <label className={labelClasses}>
                        <div className="dl-circle">
                            <svg className="dl-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19V5m0 14-4-4m4 4 4-4"></path>
                            </svg>
                            <div className="dl-square"></div>
                        </div>
                        {downloadState === 'downloading' && (
                            <p className="dl-title downloading">
                                {progress}% {fileSize ? `(${fileSize})` : ''}
                            </p>
                        )}
                         <p className="dl-title initial">Descargar</p>
                        <p className="dl-title completed">¡Listo!</p>
                    </label>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleDownload('svg')}>Descargar como SVG</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDownload('png')}>Descargar como PNG</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDownload('jpeg')}>Descargar como JPG</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
