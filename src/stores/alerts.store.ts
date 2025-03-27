// src/stores/alerts.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student, Infraction } from "@/types/dashboard";
import { getStudentTypeICount, AlertStatus } from "@/lib/utils";
import { getSectionCategory } from "@/lib/constantes";
import { useSettingsStore } from "./settings.store"; // Import settings store

// Define the structure for a student with their alert status
interface StudentWithAlert extends Student {
  alertStatus: AlertStatus | null;
  typeIICount: number; // Also useful to show this on the alerts list
}

interface AlertsState {
  students: Student[]; // All students (needed for filtering/display)
  infractions: Infraction[]; // All infractions (needed for counts)
  // Settings are now managed by useSettingsStore
  loading: boolean;
  error: string | null;
  fetchAlertsData: () => Promise<void>;
  // Selector to get students with active alerts, calculated using current data and settings
  getStudentsWithAlerts: (section?: string | null) => StudentWithAlert[];
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  students: [],
  infractions: [],
  loading: false,
  error: null,

  fetchAlertsData: async () => {
    // Avoid refetch if data exists (basic cache)
    // if (get().students.length > 0 && get().infractions.length > 0) {
    //     set({ loading: false });
    //     return;
    // }
    set({ loading: true, error: null });
    try {
      // Fetch necessary data: students and infractions
      // Settings will be fetched separately by their own store/hook
      const [studentsRes, infractionsRes] = await Promise.all([
        fetch("/api/students"), // Assuming this returns Student[]
        fetch("/api/infractions"), // Assuming this returns Infraction[]
      ]);

      if (!studentsRes.ok || !infractionsRes.ok) {
        throw new Error("Failed to fetch data needed for alerts");
      }

      const [studentsData, infractionsData] = await Promise.all([
        studentsRes.json(),
        infractionsRes.json(),
      ]);

      // Assuming APIs return the transformed data
      set({
        students: studentsData as Student[],
        infractions: infractionsData as Infraction[],
        loading: false,
      });

      // Trigger settings fetch if not already done (or rely on component mounting)
      // useSettingsStore.getState().fetchSettings();

    } catch (error) {
      console.error("Error fetching alerts data:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load alert data";
      set({ loading: false, error: message });
      toast.error(message);
    }
  },

  getStudentsWithAlerts: (section = null) => {
    const { students, infractions } = get();
    const { settings, getThresholdsForSection } = useSettingsStore.getState(); // Get settings state

    if (!settings) return []; // Settings might not be loaded yet

    // 1. Filter students by section if provided
    const sectionStudents = section
      ? students.filter((student) => {
           const sectionMap: Record<string, string> = {
              preschool: "Preschool",
              elementary: "Elementary",
              middle: "Middle School",
              high: "High School",
            };
           const targetSection = sectionMap[section];
           return targetSection && getSectionCategory(student.grado) === targetSection;
        })
      : students;


    // 2. Calculate alert status for each relevant student
    const studentsWithAlerts = sectionStudents
      .map((student): StudentWithAlert => {
        const typeICount = getStudentTypeICount(student.id, infractions);
        const typeIICount = infractions.filter(
          (inf) => inf.studentId === student.id && inf.type === "Tipo II"
        ).length;

        const sectionCategory = getSectionCategory(student.grado);
        const { primary: primaryThreshold, secondary: secondaryThreshold } =
            getThresholdsForSection(sectionCategory); // Use helper

        let alertStatus: AlertStatus | null = null;
        if (typeICount >= secondaryThreshold) {
          alertStatus = { level: "critical", count: typeICount };
        } else if (typeICount >= primaryThreshold) {
          alertStatus = { level: "warning", count: typeICount };
        }

        return {
          ...student,
          alertStatus,
          typeIICount,
        };
      })
      .filter((student) => student.alertStatus !== null); // Keep only those with alerts

      // 3. Sort (critical first)
      return studentsWithAlerts.sort((a, b) => {
        if (a.alertStatus?.level === "critical" && b.alertStatus?.level !== "critical") return -1;
        if (a.alertStatus?.level !== "critical" && b.alertStatus?.level === "critical") return 1;
        // Optional: secondary sort by count descending
        if (a.alertStatus && b.alertStatus) {
            return b.alertStatus.count - a.alertStatus.count;
        }
        return 0;
      });
  },
}));