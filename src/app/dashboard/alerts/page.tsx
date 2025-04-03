// src/app/dashboard/alerts/page.tsx (and similarly for [section]/page.tsx)
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AlertsList } from "@/components/alerts/AlertsList";
import { useAlertsStore } from "@/stores/alerts.store";
import { useSettingsStore } from "@/stores/settings.store"; // Import settings store
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AlertsAllSectionsPage() {
  const router = useRouter();
  const {
    fetchAlertsData,
    getStudentsWithAlerts,
    loading: alertsLoading,
    error: alertsError,
  } = useAlertsStore();

  const {
    fetchSettings,
    loading: settingsLoading,
    error: settingsError,
    areSettingsConfigured, // Get config status
  } = useSettingsStore();

  // Fetch data on mount
  useEffect(() => {
    if (areSettingsConfigured === null) {
      fetchSettings();
    }
    fetchAlertsData(); // Fetch student/infraction data
  }, [fetchAlertsData, fetchSettings, areSettingsConfigured]);

  const studentsWithAlerts = getStudentsWithAlerts(); // Selector now handles settings check

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const isLoading =
    alertsLoading || (settingsLoading && areSettingsConfigured === null);
  const error = alertsError || settingsError;

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-10 h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <Alert variant="destructive" className="max-w-md mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar Datos</AlertTitle>
          <AlertDescription>
            {error}. Intente recargar la página.
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

  // --- Unconfigured State ---
  if (areSettingsConfigured === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
        <Alert className="max-w-md mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuración Requerida</AlertTitle>
          <AlertDescription>
            Las alertas no pueden mostrarse porque los umbrales no han sido
            configurados.
          </AlertDescription>
        </Alert>
        <Link href="/dashboard/settings" passHref legacyBehavior>
          <Button>Ir a Configuración</Button>
        </Link>
      </div>
    );
  }

  // --- Render Alerts List (only if configured) ---
  if (areSettingsConfigured === true) {
    return (
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Mostrando alertas activas para todas las secciones académicas según la
          configuración actual.
        </p>
        <AlertsList
          studentsWithAlerts={studentsWithAlerts}
          onSelectStudent={handleSelectStudent}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center pt-10">Cargando...</div>
  );
}

// **Apply similar checks for `areSettingsConfigured` in `src/app/dashboard/alerts/[section]/page.tsx`**
