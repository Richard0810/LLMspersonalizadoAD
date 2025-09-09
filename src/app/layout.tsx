
'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { GraduationCap, HelpCircle } from 'lucide-react';
import './globals.css';
import { HelpModal } from '@/components/shared/HelpModal';

// Metadata can still be exported from a client component layout
// export const metadata: Metadata = {
//   title: 'EduSpark AI',
//   description: 'Genera actividades educativas con IA',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showLearnButton = pathname !== '/learn';

  return (
    <html lang="es" className="min-h-screen">
      <head>
        <title>EduSpark AI</title>
        <meta name="description" content="Genera actividades educativas con IA" />
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
          {showLearnButton && (
             <Link href="/learn" passHref>
                <Button size="lg" className="fixed bottom-4 right-4 z-50 shadow-lg rounded-full h-14 px-5 transition-transform duration-200 ease-in-out hover:scale-105">
                  <GraduationCap className="mr-2 h-6 w-6" />
                  <span className="font-bold">Aprende Más</span>
                </Button>
            </Link>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
