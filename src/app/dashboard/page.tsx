// src/app/dashboard/page.tsx
"use client";

import { Overview } from "@/components/dashboard/Overview";
import { useAlertsStore } from "@/stores/alerts.store"; // Use new store
import { useSettingsStore } from "@/stores/settings.store"; // Use settings store
import { useEffect } from "react";
import { toast } from "sonner"; // Use sonner directly
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // For loading state
import { getStudentTypeICount } from "@/lib/utils"; // Import helper if needed directly
import { getSectionCategory } from "@/lib/constantes"; // Import helper

export default function DashboardPage() {
  const router = useRouter();

  // --- Get state and actions from NEW stores ---
  const {
    students,
    infractions,
    fetchAlertsData, // From alerts store (fetches students & infractions)
    getStudentsWithAlerts, // Selector for alert logic
    loading: alertsLoading,
    error: alertsError,
  } = useAlertsStore();

  const {
    settings,
    fetchSettings,
    getThresholdsForSection, // Use this helper
    loading: settingsLoading,
    error: settingsError,
  } = useSettingsStore();
  // --- End store usage ---

  // Fetch data on mount
  useEffect(() => {
    fetchAlertsData();
    fetchSettings();
  }, [fetchAlertsData, fetchSettings]);

 
  // --- Alert Calculation Logic (Re-usable Function) ---
  // This logic is encapsulated better in useAlertsStore.getStudentsWithAlerts
  // We pass a function definition to Overview that uses the store's helpers
  const getStudentAlertStatus = (studentId: string) => {
    if (!settings) return null; // Need settings

    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, infractions);
    const sectionCategory = getSectionCategory(student.grado);

    // Use the helper from the settings store
    const { primary: primaryThreshold, secondary: secondaryThreshold } =
      getThresholdsForSection(sectionCategory);

    if (typeICount >= secondaryThreshold) {
      return { level: "critical" as const, count: typeICount };
    } else if (typeICount >= primaryThreshold) {
      return { level: "warning" as const, count: typeICount };
    }
    return null;
  };
   // --- End Alert Calculation ---


  // Effect for showing alert toast
  useEffect(() => {
     // Use the selector from the store
     const studentsWithAlerts = getStudentsWithAlerts(); // Get all alerts
     if (!alertsLoading && !settingsLoading && studentsWithAlerts.length > 0) {
        toast.info(`Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`);
     }
  }, [students, infractions, settings, getStudentsWithAlerts, alertsLoading, settingsLoading]); // Add loading states

  // Loading and Error Handling
  const loading = alertsLoading || settingsLoading;
  const error = alertsError || settingsError;

  if (loading && (!students.length || !settings)) { // More robust initial loading check
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-destructive">
         <p className="mb-4">{error}</p>
         {/* Add a retry button */}
         <button onClick={() => { fetchAlertsData(); fetchSettings(); }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
             Reintentar
         </button>
      </div>
    );
  }

   // Ensure settings are loaded before rendering Overview
   if (!settings) {
       return (
            <div className="flex items-center justify-center h-[calc(100vh-150px)] text-muted-foreground">
                Cargando configuración...
            </div>
        );
   }

  return (
    <div className="space-y-6"> {/* Removed container/py-6 for consistency with other pages */}
      <Overview
        students={students}
        settings={settings} // <-- Pass the settings from useSettingsStore
        getStudentAlertStatus={getStudentAlertStatus} // Pass the calculation function
        onSelectStudent={(studentId) => {
          router.push(`/dashboard/students/${studentId}`);
        }}
      />
    </div>
  );
}