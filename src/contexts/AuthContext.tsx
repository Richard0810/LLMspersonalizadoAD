
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User as AppUser } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from '@/lib/firebase';
import { clearLessonParamsFromLocalStorage } from '@/lib/localStorageUtils';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  register: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para convertir username a un email compatible con Firebase
const toFirebaseEmail = (username: string) => `${username.toLowerCase()}@eduspark.ai`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const username = firebaseUser.email.split('@')[0];
        const appUser: AppUser = { username, uid: firebaseUser.uid };
        setUser(appUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (!auth) {
      toast({ title: "Error", description: "El servicio de autenticación no está disponible.", variant: "destructive" });
      return false;
    }
    
    setIsLoading(true);
    const email = toFirebaseEmail(username);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Inicio de Sesión Exitoso", description: `¡Bienvenido de nuevo, ${username}!` });
      router.push('/');
      return true;
    } catch (error: any) {
      console.error("Firebase login error:", error);
      const defaultMessage = "Nombre de usuario o contraseña inválidos.";
      let message = defaultMessage;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          message = defaultMessage;
      }
      toast({ title: "Error al Iniciar Sesión", description: message, variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  }, [router, toast]);

  const register = useCallback(async (username: string, pass: string): Promise<boolean> => {
    if (!auth) {
      toast({ title: "Error", description: "El servicio de autenticación no está disponible.", variant: "destructive" });
      return false;
    }

    setIsLoading(true);
    const email = toFirebaseEmail(username);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      toast({ title: "Registro Exitoso", description: `¡Bienvenido, ${username}!` });
      router.push('/');
      return true;
    } catch (error: any) {
        console.error("Firebase register error:", error);
        let message = "Ocurrió un error durante el registro.";
        if (error.code === 'auth/email-already-in-use') {
            message = "El nombre de usuario ya existe.";
        } else if (error.code === 'auth/weak-password') {
            message = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
        }
        toast({ title: "Error de Registro", description: message, variant: "destructive" });
        setIsLoading(false);
        return false;
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      clearLessonParamsFromLocalStorage();
      toast({ title: "Sesión Cerrada", description: "Has cerrado sesión exitosamente." });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Error", description: "No se pudo cerrar la sesión.", variant: "destructive" });
    }
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
