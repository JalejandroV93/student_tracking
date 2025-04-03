// src/app/dashboard/alerts/[section]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertsList } from "@/components/alerts/AlertsList"; // Adjust path
import { SectionSelector } from "@/components/shared/SectionSelector"; // Adjust path
import { useAlertsStore } from "@/stores/alerts.store"; // Adjust path
import { useSettingsStore } from "@/stores/settings.store"; // Adjust path
import { AlertsListSkeleton } from "@/components/alerts/AlertsList.skeleton";
// Helper to get section title
const getSectionTitle = (sectionId: string | string[] | undefined): string => {
    const id = Array.isArray(sectionId) ? sectionId[0] : sectionId;
    const titles: Record<string, string> = {
      preschool: "Preescolar",
      elementary: "Primaria",
      middle: "Secundaria",
      high: "Bachillerato",
    };
    return id ? titles[id] || "Desconocida" : "Todas";
};

export default function AlertsSpecificSectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = params.section as string; // Expecting a single string param

  const {
    fetchAlertsData,
    getStudentsWithAlerts,
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
    fetchSettings();
  }, [fetchAlertsData, fetchSettings]);

  // Get calculated list of students with alerts for the CURRENT section
  const studentsWithAlerts = getStudentsWithAlerts(section);
  const sectionTitle = getSectionTitle(section);

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const isLoading = alertsLoading || settingsLoading;
  const error = alertsError || settingsError;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Alertas - {sectionTitle}
        </h1>
        <SectionSelector
          currentSection={section}
          baseRoute="dashboard/alerts" // Correct base route for navigation
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Mostrando alertas activas para la sección de {sectionTitle}.
      </p>

       {isLoading && (
         <AlertsListSkeleton/>
      )}

      {error && !isLoading && (
          <div className="text-destructive text-center pt-10">{error}</div>
      )}

      {!isLoading && !error && (
         <AlertsList
           studentsWithAlerts={studentsWithAlerts}
           onSelectStudent={handleSelectStudent}
         />
      )}
    </div>
  );
}