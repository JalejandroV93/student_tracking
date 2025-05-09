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
    students,
    settings,
    areSettingsConfigured,
    getStudentsWithAlerts,
    getStudentAlertStatus,
  } = useDashboardData();

  // Notificación de alertas activas
  useEffect(() => {
    if (areSettingsConfigured === true) {
      const studentsWithAlerts = getStudentsWithAlerts();
      if (studentsWithAlerts.length > 0) {
        toast.info(
          `Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`
        );
      }
    }
  }, [areSettingsConfigured, getStudentsWithAlerts]);

  // Handler para selección de estudiante
  const handleStudentSelect = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  // Renderizado condicional para el estado de configuración no realizada
  if (areSettingsConfigured === false) {
    return (
      <ContentLayout title="Resumen">
        <UnconfiguredSettings />
      </ContentLayout>
    );
  }

  // Renderizado principal - Solo si las configuraciones están listas
  return (
    <ContentLayout title="Resumen">
      {areSettingsConfigured === true && settings ? (
        <Overview
          students={students}
          settings={settings}
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={handleStudentSelect}
        />
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-muted-foreground">
          Estado inesperado. Intentando cargar datos...
        </div>
      )}
    </ContentLayout>
  );
}
