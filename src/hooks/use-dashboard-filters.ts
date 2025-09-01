// src/hooks/use-dashboard-filters.ts
import { useState } from "react";
import { useSchoolYearSettings } from "./use-school-year-settings";

export interface DashboardFilters {
  schoolYearId: string | null; // "active", number as string, or null
  trimestre: string; // trimestre ID as string or "all"
}

export function useDashboardFilters() {
  const { settings: schoolYearSettings, loading: schoolYearLoading } =
    useSchoolYearSettings();

  const [filters, setFilters] = useState<DashboardFilters>({
    schoolYearId: "active", // Por defecto usar el año académico activo
    trimestre: "all",
  });

  // Funciones para actualizar filtros
  const setSchoolYear = (schoolYearId: string) => {
    setFilters((prev) => ({ ...prev, schoolYearId }));
  };

  const setTrimestre = (trimestre: string) => {
    setFilters((prev) => ({ ...prev, trimestre }));
  };

  // Obtener el año académico activo
  const activeSchoolYear = schoolYearSettings.activeSchoolYear;

  // Determinar el ID del año académico actual para las APIs
  const getEffectiveSchoolYearId = (): number | null => {
    if (filters.schoolYearId === "active" && activeSchoolYear) {
      return activeSchoolYear.id;
    }

    if (filters.schoolYearId && filters.schoolYearId !== "active") {
      return parseInt(filters.schoolYearId);
    }

    return null;
  };

  return {
    filters,
    setSchoolYear,
    setTrimestre,
    setFilters,
    activeSchoolYear,
    allSchoolYears: schoolYearSettings.allSchoolYears,
    getEffectiveSchoolYearId,
    isLoading: schoolYearLoading,
  };
}
