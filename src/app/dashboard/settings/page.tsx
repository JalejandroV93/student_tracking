// src/app/dashboard/settings/page.tsx
"use client";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { SettingsFormSkeleton } from "@/components/settings/SettingsForm.skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateAlertSettings } from "@/lib/apiClient";
import { toast } from "sonner";
import type { AlertSettings } from "@/types/dashboard";

export default function SettingsPage() {
 const queryClient = useQueryClient();
 const {
   data: settingsData, // Contains { configured: boolean, settings: AlertSettings | null }
   isLoading: isLoadingSettings,
   error: settingsError,
   isFetching: isFetchingSettings, // Use for background refresh indicator if needed
 } = useQuery({
   queryKey: ["settings"],
   queryFn: fetchSettings,
   // staleTime: Infinity, // Settings might not change often, consider longer staleTime
 });

 const {
   mutate: saveSettings,
   isPending: isSaving, // Replaces isSaving prop logic
 } = useMutation({
   mutationFn: updateAlertSettings,
   onSuccess: (savedSettings) => {
     toast.success("Configuración guardada exitosamente!");
     // Update the query cache with the saved data
     queryClient.setQueryData(["settings"], { configured: true, settings: savedSettings });
     // Optionally invalidate other queries that depend on settings
     queryClient.invalidateQueries({ queryKey: ["alerts"] }); // Example: invalidate alerts calculation
   },
   onError: (error) => {
     toast.error(`Error guardando configuración: ${error.message}`);
   },
 });


 // Determine configuration status from the query data
 const areSettingsConfigured = settingsData?.configured;
 const currentSettings = settingsData?.settings ?? null; // Extract settings or null
 if (isLoadingSettings) { // Simplified loading check
   return <SettingsFormSkeleton />;
 }
if (settingsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-red-500">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar Configuración</AlertTitle>
          <AlertDescription>
           {settingsError.message}. Intente recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Configuración de Alertas
      </h1>
     {areSettingsConfigured === false && !isLoadingSettings && ( // Check config status from query
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
      <SettingsForm
       currentSettings={currentSettings} // Pass settings directly from query data
       onSave={saveSettings} // Pass the mutate function
       isSaving={isSaving} // Use mutation's pending state
      />
    </div>
  );
}