// src/app/dashboard/alerts/[section]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertsList } from "@/components/alerts/AlertsList";
import { SectionSelector } from "@/components/shared/SectionSelector";
import { useAlertsStore } from "@/stores/alerts.store";
import { useSettingsStore } from "@/stores/settings.store";
import { AlertsListSkeleton } from "@/components/alerts/AlertsList.skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";

// Helper to get section title
const getSectionTitle = (sectionId: string | string[] | undefined): string => {
  const id = Array.isArray(sectionId) ? sectionId[0] : sectionId;
  const titles: Record<string, string> = {
    preschool: "Preschool",
    elementary: "Elementary",
    middle: "Middle School",
    high: "High School",
  };
  return id ? titles[id] || "Desconocida" : "Todas";
};

export default function AlertsSpecificSectionPage() {
  const router = useRouter();
  const params = useParams();
  const section = params.section as string; // Expecting a single string param
  const sectionTitle = getSectionTitle(section);

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
  } = useSettingsStore();

  // Fetch data on mount
  useEffect(() => {
    fetchAlertsData();
    fetchSettings();
  }, [fetchAlertsData, fetchSettings]);

  // Get calculated list of students with alerts for the CURRENT section
  const studentsWithAlerts = getStudentsWithAlerts(section);

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const isLoading = alertsLoading || settingsLoading;
  const error = alertsError || settingsError;

  return (
    <ContentLayout title={`Alertas - ${sectionTitle}`}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <SectionSelector
            currentSection={section}
            baseRoute="dashboard/alerts" // Correct base route for navigation
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Mostrando alertas activas para la sección de {sectionTitle}.
        </p>

        {isLoading && <AlertsListSkeleton />}

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
    </ContentLayout>
  );
}
