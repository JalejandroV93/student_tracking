// src/components/dashboard/DashboardContent.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OptimizedOverview } from "./OptimizedOverview";
import { ConfigurationBoundary } from "./ConfigurationBoundary";
import { useDashboardDataSWR } from "@/hooks/useDashboardDataSWR";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";

export function DashboardContent() {
  const router = useRouter();
  const lastAlertCountRef = useRef<number>(0);

  // Obtener filtros de año académico
  const dashboardFilters = useDashboardFilters();
  const { filters } = dashboardFilters;

  // Obtener datos del dashboard filtrados por año académico
  const {
    students,
    infractions,
    settings,
    areSettingsConfigured,
    getStudentsWithAlerts,
    getStudentAlertStatus,
    getTotalStudentsCount,
    getTotalStudentsByLevel,
    isLoading,
    error,
  } = useDashboardDataSWR({ schoolYearId: filters.schoolYearId });

  // Manejar errores - lanzar para que sea capturado por error.tsx
  if (error) {
    throw error;
  }

  const studentsWithAlertsCount = useMemo(() => {
    if (areSettingsConfigured === true && students.length > 0) {
      return getStudentsWithAlerts().length;
    }
    return 0;
  }, [areSettingsConfigured, students, getStudentsWithAlerts]);


  // Notificación de alertas activas
  useEffect(() => {
    if (
      studentsWithAlertsCount > 0 &&
      studentsWithAlertsCount !== lastAlertCountRef.current
    ) {
      toast.info(
        `Hay ${studentsWithAlertsCount} estudiantes con alertas activas.`
      );
      lastAlertCountRef.current = studentsWithAlertsCount;
    }
  }, [studentsWithAlertsCount]);

  useEffect(() => {
    lastAlertCountRef.current = 0;
  }, [filters.schoolYearId]);

  // Handler para selección de estudiante
  const handleStudentSelect = useMemo(
    () => (studentId: string) => {
      router.push(`/dashboard/students/${studentId}`);
    },
    [router]
  );

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return null; // loading.tsx se encarga del skeleton
  }

  return (
    <ConfigurationBoundary
      isConfigured={areSettingsConfigured}
      isLoading={isLoading}
    >
      {settings ? (
        <OptimizedOverview
          students={students}
          infractions={infractions}
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={handleStudentSelect}
          getTotalStudentsCount={getTotalStudentsCount}
          getTotalStudentsByLevel={getTotalStudentsByLevel}
          dashboardFilters={{
            filters: dashboardFilters.filters,
            setSchoolYear: dashboardFilters.setSchoolYear,
            setTrimestre: dashboardFilters.setTrimestre,
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-muted-foreground">
          Configuraciones no encontradas
        </div>
      )}
    </ConfigurationBoundary>
  );
}
