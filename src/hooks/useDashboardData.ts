// src/hooks/useDashboardData.ts
import { useEffect } from "react";
import { useAlertsStore } from "@/stores/alerts.store";
import { useSettingsStore } from "@/stores/settings.store";

export const useDashboardData = () => {
  const {
    students,
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
    areSettingsConfigured,
  } = useSettingsStore();

  // Fetch data on mount
  useEffect(() => {
    if (areSettingsConfigured === null) {
      fetchSettings();
    }
    fetchAlertsData();
  }, [fetchAlertsData, fetchSettings, areSettingsConfigured]);

  // Error handling - importante para el Next.js error boundary
  if (alertsError || settingsError) {
    throw new Error(
      alertsError?.toString() ||
        settingsError?.toString() ||
        "An unknown error occurred"
    );
  }

  // Función para obtener el estado de alerta de un estudiante
  const getStudentAlertStatus = (studentId: string) => {
    const studentWithPossibleAlert = getStudentsWithAlerts().find(
      (s) => s.id === studentId
    );
    return studentWithPossibleAlert?.alertStatus ?? null;
  };

  return {
    students,
    settings,
    isLoading: alertsLoading || settingsLoading,
    areSettingsConfigured,
    getStudentsWithAlerts,
    getStudentAlertStatus,
  };
};
