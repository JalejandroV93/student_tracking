// src/app/dashboard/settings/page.tsx
"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { useSettingsStore } from "@/stores/settings.store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { Terminal } from "lucide-react"; // Example icon
import type { AlertSettings } from "@/types/dashboard";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    fetchSettings,
    loading,
    error,
    areSettingsConfigured,
  } = useSettingsStore();

  useEffect(() => {
    // Fetch settings when the component mounts if status is unknown or forced
    if (areSettingsConfigured === null) {
      fetchSettings();
    }
  }, [fetchSettings, areSettingsConfigured]); // Depend on areSettingsConfigured

  const handleSave = async (updatedSettingsData: AlertSettings) => {
    await updateSettings(updatedSettingsData);
    // Optionally trigger refetch of other data if needed after settings change
    // useAlertsStore.getState().fetchAlertsData({ force: true });
  };

  // --- Loading State ---
  if (loading && areSettingsConfigured === null) {
    // Show loader only on initial check
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span>Verificando configuración...</span>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-red-500">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar Configuración</AlertTitle>
          <AlertDescription>
            {error} Intente recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- Render Content ---
  return (
    <div className="space-y-6 w-full max-w-4xl">
      {" "}
      {/* Ensure content takes width */}
      <h1 className="text-3xl font-bold tracking-tight">
        Configuración de Alertas
      </h1>
      {/* Show prompt if settings are explicitly not configured */}
      {areSettingsConfigured === false && !loading && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuración Inicial Requerida</AlertTitle>
          <AlertDescription>
            Parece que es la primera vez que utiliza esta sección o la
            configuración no se encontró. Por favor, defina los umbrales de
            alerta primarios y secundarios para continuar.
          </AlertDescription>
        </Alert>
      )}
      {/* Render Form - always render if not erroring,
                pass null if not configured, or the settings if configured */}
      <SettingsForm
        // Pass null if not configured, otherwise pass settings.
        // The form component needs to handle the null case for initial values.
        currentSettings={areSettingsConfigured === true ? settings : null}
        onSave={handleSave}
        // Use loading state from store to disable button during save
        isSaving={loading && areSettingsConfigured !== null} // Indicate saving when loading is true AFTER initial check
      />
    </div>
  );
}
