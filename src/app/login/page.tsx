
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import InteractiveBackground from '@/components/shared/InteractiveBackground';
import { Eye, EyeOff, LogInIcon } from 'lucide-react';
import Image from 'next/image';
import ProjectInfo from '@/components/auth/ProjectInfo';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    if (!success) {
      setIsLoading(false);
    }
    // La navegación es manejada por AuthContext en caso de éxito
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background animate-fade-in">
      <InteractiveBackground />
      
      <header className="w-full bg-card shadow-md z-10 animate-slide-down-fade">
        <div className="flex items-center justify-between p-3 gap-3 md:gap-4">
            {/* Institucion Educativa */}
            <div className="flex items-center gap-3 md:gap-4">
              <Image
                src="/escudo.jpg"
                alt="Escudo Institucional"
                width={64}
                height={64}
                className="transition-all duration-300 hover:scale-110 w-12 h-12 md:w-16 md:h-16"
              />
              <div className="text-left">
                <h1 className="text-base md:text-xl font-headline font-bold uppercase text-foreground tracking-wider">
                  I.E. Alfonso Spath Spath
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium">Martinez - Cereté, Córdoba</p>
              </div>
            </div>

            {/* Universidad de Cordoba */}
             <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right">
                <h1 className="text-base md:text-xl font-headline font-bold uppercase text-foreground tracking-wider">
                  Universidad de Córdoba
                </h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium">Licenciatura en Informática</p>
              </div>
               <Image
                src={`/logo_unicor.png?t=${new Date().getTime()}`}
                alt="Logo Universidad de Córdoba"
                width={180}
                height={60}
                className="transition-all duration-300 hover:scale-110 w-auto h-10 md:h-12"
              />
            </div>
        </div>
      </header>

      <div className="w-full flex-grow p-4 lg:p-6 flex items-center justify-center">
        <main className="flex flex-col lg:flex-row items-stretch justify-center w-full gap-8 z-10">
          <div className="w-full max-w-lg">
              <Card className="shadow-2xl h-full">
                <CardHeader className="text-center">
                  <div className="inline-block mx-auto p-3 bg-primary/10 rounded-full mb-4">
                    <LogInIcon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-headline text-primary">Bienvenido a EduSpark AI</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Ingresa tus credenciales para acceder a tu cuenta.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Ingresa tu nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="text-base pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                      {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                      Regístrate aquí
                    </Link>
                  </p>
                </CardFooter>
              </Card>
          </div>
          <div className="w-full max-w-md">
              <ProjectInfo />
          </div>
        </main>
      </div>
    </div>
  );
}
