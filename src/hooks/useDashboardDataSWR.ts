// src/hooks/useDashboardDataSWR.ts
import useSWR from "swr";
import { Student, Infraction, AlertSettings } from "@/types/dashboard";
import { AlertStatus } from "@/lib/utils";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error(`HTTP error! status: ${res.status}`) as Error & {
      status: number;
    };
    // Attach status code to error for better error handling
    error.status = res.status;
    throw error;
  }
  return res.json();
};

interface StudentWithAlert extends Student {
  alertStatus: AlertStatus | null;
  typeICount?: number;
  typeIICount: number;
}

export const useDashboardDataSWR = () => {
  // Fetch alerts data (includes students with their grade/level information)
  const {
    data: students = [],
    error: alertsError,
    isLoading: alertsLoading,
    mutate: mutateAlerts,
  } = useSWR<StudentWithAlert[]>("/api/v1/alerts", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch infractions data
  const {
    data: infractions = [],
    error: infractionsError,
    isLoading: infractionsLoading,
    mutate: mutateInfractions,
  } = useSWR<Infraction[]>("/api/v1/infractions", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch settings data
  const {
    data: settingsResponse,
    error: settingsError,
    isLoading: settingsLoading,
    mutate: mutateSettings,
  } = useSWR<{ configured: boolean; settings?: AlertSettings }>(
    "/api/v1/alert-settings",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Extract settings and configuration state
  const settings = settingsResponse?.settings;
  const areSettingsConfigured = settingsResponse?.configured ?? false;
  // Calculate derived data
  const isLoading = alertsLoading || infractionsLoading || settingsLoading;
  const error = alertsError || infractionsError || settingsError;

  // Function to get students with alerts
  const getStudentsWithAlerts = (section?: string | null) => {
    if (!students.length) {
      return [];
    }

    // If a section is provided, filter the students
    if (section) {
      return students.filter((student) => {
        const sectionMap: Record<string, string> = {
          preschool: "Preschool",
          elementary: "Elementary",
          middle: "Middle School",
          high: "High School",
        };
        const targetSection = sectionMap[section];
        // Note: This filtering logic might need adjustment based on how grado is now handled
        return targetSection && student.level === targetSection;
      });
    }

    return students;
  };

  // Function to get alert status for a specific student
  const getStudentAlertStatus = (studentId: string): AlertStatus | null => {
    const student = students.find((s) => s.id === studentId);
    return student?.alertStatus ?? null;
  };

  // Function to refresh all data
  const refreshAll = async () => {
    await Promise.all([mutateAlerts(), mutateInfractions(), mutateSettings()]);
  };

  return {
    // Data
    students,
    infractions,
    settings,

    // Loading and error states
    isLoading,
    error,
    areSettingsConfigured,

    // Derived functions
    getStudentsWithAlerts,
    getStudentAlertStatus,

    // Mutation functions
    refreshAll,
    mutateAlerts,
    mutateInfractions,
    mutateSettings,
  };
};
