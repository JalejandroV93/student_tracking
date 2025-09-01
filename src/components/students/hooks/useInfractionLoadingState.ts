import { useState, useCallback } from "react";
import type { InfractionLoadingState } from "../types";

/**
 * Hook para manejar el estado de carga por ID de infracción
 * Resuelve el problema de UX donde el loading afectaba todas las filas
 */
export function useInfractionLoadingState() {
  const [loadingStates, setLoadingStates] = useState<InfractionLoadingState>(
    {}
  );

  const setLoading = useCallback((infractionId: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [infractionId]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (infractionId: string) => {
      return loadingStates[infractionId] || false;
    },
    [loadingStates]
  );

  const clearAllLoadingStates = useCallback(() => {
    setLoadingStates({});
  }, []);

  const clearLoadingState = useCallback((infractionId: string) => {
    setLoadingStates((prev) => {
      const newState = { ...prev };
      delete newState[infractionId];
      return newState;
    });
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    clearAllLoadingStates,
    clearLoadingState,
  };
}
