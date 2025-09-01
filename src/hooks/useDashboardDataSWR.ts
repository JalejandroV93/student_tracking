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

interface UseDashboardDataSWROptions {
  schoolYearId?: string | null; // "active", number as string, or null
}

export const useDashboardDataSWR = (
  options: UseDashboardDataSWROptions = {}
) => {
  const { schoolYearId = "active" } = options;

  // Construir parámetros de query para las APIs
  const getApiUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (schoolYearId) {
      params.append("schoolYearId", schoolYearId);
    }
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  // Crear keys únicos que incluyan el schoolYearId para forzar revalidación
  const alertsKey = `alerts-${schoolYearId || "default"}`;
  const studentsKey = `students-${schoolYearId || "default"}`;
  const infractionsKey = `infractions-${schoolYearId || "default"}`;

  // Fetch all students data (para mostrar el total correcto en KPI)
  const {
    data: allStudents = [],
    error: studentsError,
    isLoading: studentsLoading,
    mutate: mutateStudents,
  } = useSWR<Student[]>(
    [studentsKey, getApiUrl("/api/v1/students")],
    ([, url]: [string, string]) => fetcher(url),
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch alerts data (students with alert information)
  const {
    data: studentsWithAlerts = [],
    error: alertsError,
    isLoading: alertsLoading,
    mutate: mutateAlerts,
  } = useSWR<StudentWithAlert[]>(
    [alertsKey, getApiUrl("/api/v1/alerts")],
    ([, url]: [string, string]) => fetcher(url),
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch infractions data
  const {
    data: infractions = [],
    error: infractionsError,
    isLoading: infractionsLoading,
    mutate: mutateInfractions,
  } = useSWR<Infraction[]>(
    [infractionsKey, getApiUrl("/api/v1/infractions")],
    ([, url]: [string, string]) => fetcher(url),
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

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
  const isLoading =
    studentsLoading || alertsLoading || infractionsLoading || settingsLoading;
  const error =
    studentsError || alertsError || infractionsError || settingsError;

  // Function to get students with alerts
  const getStudentsWithAlerts = (section?: string | null) => {
    if (!studentsWithAlerts.length) {
      return [];
    }

    // If a section is provided, filter the students
    if (section) {
      return studentsWithAlerts.filter((student: StudentWithAlert) => {
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

    return studentsWithAlerts;
  };

  // Function to get alert status for a specific student
  const getStudentAlertStatus = (studentId: string): AlertStatus | null => {
    const student = studentsWithAlerts.find(
      (s: StudentWithAlert) => s.id === studentId
    );
    return student?.alertStatus ?? null;
  };

  // Function to refresh all data
  const refreshAll = async () => {
    await Promise.all([
      mutateStudents(),
      mutateAlerts(),
      mutateInfractions(),
      mutateSettings(),
    ]);
  };

  return {
    // Data
    students: allStudents, // Todos los estudiantes para mostrar el conteo total correcto
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
    mutateStudents,
    mutateAlerts,
    mutateInfractions,
    mutateSettings,
  };
};
