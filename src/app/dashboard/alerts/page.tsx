// src/app/dashboard/alerts/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AlertsList } from "@/components/alerts/AlertsList"; // Adjust path
import { useAlertsStore } from "@/stores/alerts.store"; // Adjust path
import { useSettingsStore } from "@/stores/settings.store"; // Adjust path

export default function AlertsAllSectionsPage() {
  const router = useRouter();
  const {
    fetchAlertsData,
    getStudentsWithAlerts, // Use the selector
    loading: alertsLoading,
    error: alertsError,
  } = useAlertsStore();

  const {
      fetchSettings,
      loading: settingsLoading,
      error: settingsError
  } = useSettingsStore();

  // Fetch data on mount
  useEffect(() => {
    fetchAlertsData();
    fetchSettings(); // Fetch settings as well
  }, [fetchAlertsData, fetchSettings]);

  // Get calculated list of students with alerts for ALL sections
  // Pass null or undefined to getStudentsWithAlerts for all sections
  const studentsWithAlerts = getStudentsWithAlerts();

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const isLoading = alertsLoading || settingsLoading;
  const error = alertsError || settingsError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
        {/* SectionSelector could be added here if needed, passing baseRoute="alerts" */}
      </div>

      <p className="text-sm text-muted-foreground">
        Mostrando alertas activas para todas las secciones académicas.
      </p>

      {isLoading && (
         <div className="flex items-center justify-center pt-10">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      )}

      {error && !isLoading && (
          <div className="text-destructive text-center pt-10">{error}</div>
      )}

      {!isLoading && !error && (
        <AlertsList
          studentsWithAlerts={studentsWithAlerts} // Pass the calculated data
          onSelectStudent={handleSelectStudent}
        />
      )}
    </div>
  );
}