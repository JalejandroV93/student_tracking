"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface TrimestreOption {
  id: number;
  name: string;
  order: number;
  schoolYearId: number;
  schoolYearName: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export function useTrimestres() {
  const [trimestresDisponibles, setTrimestresDisponibles] = useState<
    TrimestreOption[]
  >([]);
  const [loadingTrimestres, setLoadingTrimestres] = useState(false);

  const loadTrimestres = useCallback(async () => {
    setLoadingTrimestres(true);
    try {
      const response = await fetch("/api/v1/trimestres");
      if (response.ok) {
        const data = await response.json();
        setTrimestresDisponibles(data.trimestres || []);
      } else {
        console.error("Error loading trimestres");
        toast.error("Error al cargar trimestres");
      }
    } catch (error) {
      console.error("Error loading trimestres:", error);
      toast.error("Error al cargar trimestres");
    } finally {
      setLoadingTrimestres(false);
    }
  }, []);

  const getActiveYearTrimestres = useCallback(() => {
    return trimestresDisponibles.filter((trimestre) => trimestre.isActive);
  }, [trimestresDisponibles]);

  const getInactiveYearTrimestres = useCallback(() => {
    return trimestresDisponibles.filter((trimestre) => !trimestre.isActive);
  }, [trimestresDisponibles]);

  return {
    trimestresDisponibles,
    loadingTrimestres,
    loadTrimestres,
    getActiveYearTrimestres,
    getInactiveYearTrimestres,
  };
}
