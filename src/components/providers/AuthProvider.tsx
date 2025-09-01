// app/_components/AuthProvider.tsx
"use client";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SWRConfig } from "swr";
import { useOptimizedAuth } from "@/hooks/useAuth";
import { UserPayload } from "@/types/user";

interface AuthContextProps {
  user: UserPayload | null | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error?: Error | null;
  refetchUser: () => Promise<UserPayload | null | undefined>;
  clearAuthCache: () => Promise<UserPayload | null | undefined>;
  validateSession: () => Promise<UserPayload | null | undefined>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Componente interno que usa el hook optimizado
const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    isLoading,
    error,
    isValidating,
    refetchUser,
    clearAuthCache,
    validateSession,
  } = useOptimizedAuth();

  // Solo redirigir si estamos en login y hay usuario autenticado
  useEffect(() => {
    if (pathname === "/login" && user && !isLoading) {
      router.push("/");
    }
  }, [pathname, user, isLoading, router]);

  // Manejar cambios en el estado de autenticación
  useEffect(() => {
    // Si hay error de autenticación y no estamos en login, limpiar caché
    if (error && pathname !== "/login" && pathname !== "/access") {
      console.log("Authentication error detected, clearing cache");
      clearAuthCache();
    }
  }, [error, pathname, clearAuthCache]);

  const contextValue: AuthContextProps = {
    user,
    isLoading,
    isValidating,
    error,
    refetchUser,
    clearAuthCache,
    validateSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Proveedor principal que incluye configuración SWR
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  return (
    <SWRConfig
      value={{
        // Configuración global de SWR para optimizar rendimiento
        onError: (error, key) => {
          console.warn(`SWR Error for ${key}:`, error);
        },
        onSuccess: (data, key) => {
          // Solo log en desarrollo
          if (process.env.NODE_ENV === "development") {
            console.log(`SWR Success for ${key}`);
          }
        },
      }}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </SWRConfig>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
