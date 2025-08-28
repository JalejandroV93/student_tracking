// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Overview } from "@/components/dashboard/Overview";
import { UnconfiguredSettings } from "@/components/dashboard/UnconfiguredSettings";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useDashboardDataSWR } from "@/hooks/useDashboardDataSWR";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const {
    students,
    infractions,
    settings,
    areSettingsConfigured,
    getStudentsWithAlerts,
    getStudentAlertStatus,
    isLoading,
    error,
  } = useDashboardDataSWR();

  // Notificación de alertas activas
  useEffect(() => {
    if (areSettingsConfigured === true && students.length > 0) {
      const studentsWithAlerts = getStudentsWithAlerts();
      if (studentsWithAlerts.length > 0) {
        toast.info(
          `Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`
        );
      }
    }
  }, [areSettingsConfigured, students, getStudentsWithAlerts]);

  // Handler para selección de estudiante
  const handleStudentSelect = useMemo(
    () => (studentId: string) => {
      router.push(`/dashboard/students/${studentId}`);
    },
    [router]
  );

  // Error handling
  if (error) {
    return (
      <ContentLayout title="Resumen">
        <div className="flex items-center justify-center h-[calc(100vh-250px)]">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-destructive">
                Error al cargar datos
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {error.message || "Ocurrió un error inesperado"}
              </p>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout title="Resumen">
        <div className="space-y-6">
          {/* Loading skeleton for KPI cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading skeleton for charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </ContentLayout>
    );
  }

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
      {settings ? (
        <Overview
          students={students}
          infractions={infractions}
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={handleStudentSelect}
        />
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-muted-foreground">
          Configuraciones no encontradas
        </div>
      )}
    </ContentLayout>
  );
}
