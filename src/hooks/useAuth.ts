import useSWR, { SWRConfiguration } from "swr";
import { fetchUserClient } from "@/lib/auth-client";
import { UserPayload } from "@/types/user";

// Configuración optimizada para autenticación
const AUTH_CONFIG: SWRConfiguration = {
  // Revalidar cada 5 minutos en lugar de en cada interacción
  refreshInterval: 5 * 60 * 1000, // 5 minutos

  // No revalidar automáticamente al hacer foco en la ventana
  revalidateOnFocus: false,

  // No revalidar al reconectar la red (lo haremos manualmente si es necesario)
  revalidateOnReconnect: false,

  // Tiempo que los datos se consideran "frescos" - durante este tiempo no se revalida
  dedupingInterval: 2 * 60 * 1000, // 2 minutos

  // Mantener datos previos mientras se revalida
  keepPreviousData: true,

  // Configuración de retry para errores de red
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Solo revalidar si hay error
  revalidateOnMount: true,

  // Configuración de caché para persistencia
  provider: () => {
    // Cache en memoria mejorado con localStorage como respaldo
    const map = new Map();

    // Restaurar cache desde localStorage al inicializar
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("auth-cache");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Solo restaurar si no han pasado más de 10 minutos
          if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
            map.set("/api/v1/auth/me", parsed.data);
          }
        }
      } catch (error) {
        console.warn("Error loading auth cache:", error);
      }
    }

    return map;
  },
};

// Hook optimizado para autenticación
export function useOptimizedAuth() {
  const { data, error, isLoading, mutate, isValidating } =
    useSWR<UserPayload | null>("/api/v1/auth/me", fetchUserClient, AUTH_CONFIG);

  // Guardar en localStorage cuando los datos cambian
  if (typeof window !== "undefined" && data !== undefined) {
    try {
      localStorage.setItem(
        "auth-cache",
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Error saving auth cache:", error);
    }
  }

  // Función para refetch manual (para uso en login/logout)
  const refetchUser = async () => {
    return await mutate();
  };

  // Función para limpiar caché (útil en logout)
  const clearAuthCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-cache");
    }
    return mutate(null, false); // Set to null without revalidating
  };

  // Función para validar sesión manualmente (útil para acciones críticas)
  const validateSession = async () => {
    return await mutate(undefined, { revalidate: true });
  };

  return {
    user: data,
    isLoading,
    error,
    isValidating,
    refetchUser,
    clearAuthCache,
    validateSession,
  };
}

// Hook con debouncing para evitar llamadas excesivas
export function useDebouncedAuth() {
  const authData = useOptimizedAuth();

  // Implementar debouncing simple para refetch
  let refetchTimeout: NodeJS.Timeout | null = null;

  const debouncedRefetch = () => {
    if (refetchTimeout) {
      clearTimeout(refetchTimeout);
    }

    refetchTimeout = setTimeout(() => {
      authData.refetchUser();
    }, 500); // 500ms debounce
  };

  return {
    ...authData,
    debouncedRefetch,
  };
}
