// src/app/dashboard/page.tsx
"use client";

import { Overview } from "@/components/dashboard/Overview";
import { useAlertsStore } from "@/stores/alerts.store";
import { useSettingsStore } from "@/stores/settings.store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OverviewSkeleton } from "@/components/dashboard/Overview.skeleton";
export default function DashboardPage() {
  const router = useRouter();

  const {
    students, // From alerts store now
    fetchAlertsData,
    getStudentsWithAlerts,
    loading: alertsLoading,
    error: alertsError,
  } = useAlertsStore();

  const {
    settings,
    fetchSettings,
    loading: settingsLoading,
    error: settingsError,
    areSettingsConfigured, // Use the configuration status
  } = useSettingsStore();

  // Fetch data on mount
  useEffect(() => {
    // Fetch settings first or concurrently
    if (areSettingsConfigured === null) {
      fetchSettings(); // Trigger fetch if status unknown
    }
    // Fetch alert data (which includes students/infractions needed for alerts)
    fetchAlertsData();
  }, [fetchAlertsData, fetchSettings, areSettingsConfigured]);

  const getStudentAlertStatus = (studentId: string) => {
    // Delegate entirely to the alert store's selector which now handles settings check
    const studentWithPossibleAlert = getStudentsWithAlerts().find(
      (s) => s.id === studentId
    );
    return studentWithPossibleAlert?.alertStatus ?? null;
  };

  // Effect for showing alert toast (only if settings are configured)
  useEffect(() => {
    if (areSettingsConfigured === true && !alertsLoading && !settingsLoading) {
      const studentsWithAlerts = getStudentsWithAlerts();
      if (studentsWithAlerts.length > 0) {
        toast.info(
          `Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`
        );
      }
    }
  }, [
    areSettingsConfigured,
    getStudentsWithAlerts,
    alertsLoading,
    settingsLoading,
  ]);

  // --- Loading and Error Handling ---
  const isLoading =
    alertsLoading || (settingsLoading && areSettingsConfigured === null); // Loading if either is loading initially
  const error = alertsError || settingsError;

  if (isLoading) {
    return (
      <div className="w-[900px]">
        <OverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <Alert variant="destructive" className="max-w-md mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar Datos</AlertTitle>
          <AlertDescription>
            {error}. Intente recargar o contacte soporte.
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            fetchSettings({ force: true });
            fetchAlertsData({ force: true });
          }}
          variant="outline"
        >
          Reintentar Carga
        </Button>
      </div>
    );
  }

  // --- Handle Unconfigured State ---
  if (areSettingsConfigured === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <Alert className="max-w-md mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuración Requerida</AlertTitle>
          <AlertDescription>
            Los umbrales de alerta no han sido configurados. Algunas
            funcionalidades del dashboard (como las alertas) no estarán
            disponibles hasta que se configuren.
          </AlertDescription>
        </Alert>
        <Link href="/dashboard/settings" passHref legacyBehavior>
          <Button>Ir a Configuración</Button>
        </Link>
      </div>
    );
  }

  // --- Render Overview ---
  // Only render Overview if settings ARE configured and data is loaded
  if (areSettingsConfigured === true && settings) {
    return (
      <div className="space-y-6 w-full">
        {" "}
        {/* Ensure overview takes width */}
        <Overview
          students={students} // Pass students fetched by alerts store
          settings={settings} // Pass the loaded settings
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={(studentId) => {
            router.push(`/dashboard/students/${studentId}`);
          }}
        />
      </div>
    );
  }

  // Fallback if something unexpected happens (e.g., configured but settings are null)
  return (
    <div className="flex items-center justify-center h-[calc(100vh-150px)] text-muted-foreground">
      Estado inesperado. Intentando cargar datos...
    </div>
  );
}
