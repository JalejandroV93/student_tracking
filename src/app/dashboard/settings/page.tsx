// src/app/dashboard/settings/page.tsx
"use client";

import { SettingsForm } from "@/components/settings/alerts/SettingsForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { SettingsFormSkeleton } from "@/components/settings/alerts/SettingsForm.skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateAlertSettings } from "@/lib/apiClient";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";


export default function SettingsPage() {
  const queryClient = useQueryClient();
  const {
    data: settingsData, // Contains { configured: boolean, settings: AlertSettings | null }
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updateAlertSettings,
    onSuccess: (savedSettings) => {
      toast.success("Configuración guardada exitosamente!");
      queryClient.setQueryData(["settings"], {
        configured: true,
        settings: savedSettings,
      });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      toast.error(`Error guardando configuración: ${error.message}`);
    },
  });

  const areSettingsConfigured = settingsData?.configured;
  const currentSettings = settingsData?.settings ?? null;

  if (isLoadingSettings) {
    return (
      <ContentLayout title="Configuración General">
        <SettingsFormSkeleton />
      </ContentLayout>
    );
  }

  if (settingsError) {
    return (
      <ContentLayout title="Configuración General">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-red-500">
          <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al Cargar Configuración</AlertTitle>
            <AlertDescription>
              {settingsError.message}. Intente recargar la página.
            </AlertDescription>
          </Alert>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Configuración General">
        
          {areSettingsConfigured === false && !isLoadingSettings && (
            <Alert className="mb-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuración Inicial Requerida</AlertTitle>
              <AlertDescription>
                Parece que es la primera vez que utiliza esta sección o la
                configuración no se encontró. Por favor, defina los umbrales de
                alerta primarios y secundarios para continuar.
              </AlertDescription>
            </Alert>
          )}
          <SettingsForm
            currentSettings={currentSettings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        
    </ContentLayout>
  );
}
