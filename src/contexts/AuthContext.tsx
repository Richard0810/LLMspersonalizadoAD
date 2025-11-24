
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User as AppUser } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import { app } from '@/lib/firebase';
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
const auth = getAuth(app);

// Helper para convertir username a un email compatible con Firebase
const toFirebaseEmail = (username: string) => `${username.toLowerCase()}@eduspark.ai`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        // Extraer el nombre de usuario del email
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username: string, pass: string): Promise<boolean> => {
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
      } else if (error.code === 'auth/invalid-email') {
          message = "El formato del nombre de usuario no es válido."
      } else if (error.code === 'auth/operation-not-allowed') {
          message = "El inicio de sesión por contraseña no está habilitado. Por favor, contacta al administrador."
      }
      toast({ title: "Error al Iniciar Sesión", description: message, variant: "destructive" });
      setIsLoading(false);
      return false;
    }
  }, [router, toast]);

  const register = useCallback(async (username: string, pass: string): Promise<boolean> => {
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
        } else if (error.code === 'auth/invalid-email') {
            message = "El formato del nombre de usuario no es válido."
        } else if (error.code === 'auth/operation-not-allowed') {
            message = "El registro por contraseña no está habilitado en este proyecto. Por favor, activa el proveedor 'Email/Password' en tu consola de Firebase."
        }
        toast({ title: "Error de Registro", description: message, variant: "destructive" });
        setIsLoading(false);
        return false;
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      clearLessonParamsFromLocalStorage(); // También limpia los parámetros de la lección al cerrar sesión
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
