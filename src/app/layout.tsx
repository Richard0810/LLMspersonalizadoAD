
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduSpark AI',
  description: 'Genera actividades educativas con IA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="min-h-screen">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AuthProvider>
          {children}
          <Toaster />
           <Link href="/learn" passHref>
            <Button variant="outline" size="icon" className="fixed bottom-4 right-16 z-50 shadow-lg rounded-full h-12 w-12">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="sr-only">Aprende Más</span>
            </Button>
          </Link>
        </AuthProvider>
      </body>
    </html>
  );
}
