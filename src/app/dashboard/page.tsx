// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Overview } from "@/components/dashboard/Overview";
import { UnconfiguredSettings } from "@/components/dashboard/UnconfiguredSettings";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const router = useRouter();
  const {
    students, // This is studentsWithAlerts from the hook
    allScopedStudents,
    sectionStatsList,
    // settings, // settings is still available from useDashboardData if needed by other parts of this page
    areSettingsConfigured,
    getStudentsWithAlerts, // from alerts store, can be used with or without area code
    getStudentAlertStatus,
    isLoading, // Combined loading state from the hook
  } = useDashboardData();

  // Notificación de alertas activas
  useEffect(() => {
    if (areSettingsConfigured === true && !isLoading) { // Ensure data is loaded before showing toast based on it
      const studentsWithActiveAlerts = getStudentsWithAlerts(); // Use the function to get current alerts
      if (studentsWithActiveAlerts.length > 0) {
        toast.info(
          `Hay ${studentsWithActiveAlerts.length} estudiantes con alertas activas.`
        );
      }
    }
  }, [areSettingsConfigured, getStudentsWithAlerts, isLoading]);

  // Handler para selección de estudiante
  const handleStudentSelect = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  // Renderizado condicional para el estado de configuración no realizada
  if (areSettingsConfigured === false) { // This check happens before isLoading typically
    return (
      <ContentLayout title="Resumen">
        <UnconfiguredSettings />
      </ContentLayout>
    );
  }
  
  if (isLoading) {
    // Optionally, use a more specific skeleton if OverviewSkeleton is too generic or not available
    // For now, a simple loading text or a spinner component could be used.
    // If OverviewSkeleton is designed to be shown here, ensure it's imported and used.
    return (
        <ContentLayout title="Resumen">
            <div className="flex items-center justify-center h-[calc(100vh-250px)] text-muted-foreground">
                Cargando datos del dashboard...
            </div>
        </ContentLayout>
    );
  }

  // Renderizado principal - Solo si las configuraciones están listas y no está cargando
  return (
    <ContentLayout title="Resumen">
      {areSettingsConfigured === true && sectionStatsList && allScopedStudents ? (
        <Overview
          studentsWithAlerts={students} // students from useDashboardData is studentsWithAlerts
          sectionStatsList={sectionStatsList}
          allStudentsCount={allScopedStudents.length} // allScopedStudents is guaranteed by the check above
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={handleStudentSelect}
          // settings prop removed as Overview.tsx likely doesn't need it directly anymore
        />
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-muted-foreground">
          Estado inesperado o datos no disponibles. No se pudieron cargar los componentes del dashboard.
        </div>
      )}
    </ContentLayout>
  );
}
