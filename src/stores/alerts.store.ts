// src/stores/alerts.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student, Infraction } from "@/types/dashboard";
import { getStudentTypeICount, AlertStatus } from "@/lib/utils";
import { getSectionCategory, CACHE_DURATION_MS } from "@/lib/constantes"; // Import constant
import { useSettingsStore } from "./settings.store";

interface StudentWithAlert extends Student {
  alertStatus: AlertStatus | null;
  typeIICount: number;
}

interface AlertsState {
  students: Student[];
  infractions: Infraction[];
  loading: boolean; // For initial load
  isRefetching: boolean; // For background refresh indication (optional)
  error: string | null;
  hasFetchedOnce: boolean; // Flag to track initial fetch
  lastFetchTimestamp: number | null; // Timestamp of last successful fetch
  fetchAlertsData: (options?: { force?: boolean }) => Promise<void>; // Add options
  getStudentsWithAlerts: (section?: string | null) => StudentWithAlert[];
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  students: [],
  infractions: [],
  loading: false,
  isRefetching: false, // Initialize refetching flag
  error: null,
  hasFetchedOnce: false, // Initialize fetch flag
  lastFetchTimestamp: null, // Initialize timestamp

  fetchAlertsData: async (options = {}) => {
    const { hasFetchedOnce, lastFetchTimestamp, loading, isRefetching } = get();
    const now = Date.now();
    const isCacheValid =
      lastFetchTimestamp && now - lastFetchTimestamp < CACHE_DURATION_MS;

    // Avoid fetching if already loading/refetching, or if cache is valid and not forced
    if (
      loading ||
      isRefetching ||
      (hasFetchedOnce && isCacheValid && !options.force)
    ) {
      // If data exists but cache is just considered valid, ensure loading is false
      if (hasFetchedOnce && !loading && !isRefetching) {
        set({ loading: false, isRefetching: false });
      }
      // console.log("AlertsStore: Skipping fetch (loading/refetching/cache valid)");
      return;
    }

    const isInitialFetch = !hasFetchedOnce;

    if (isInitialFetch) {
      set({ loading: true, error: null });
    } else {
      set({ isRefetching: true }); // Indicate background activity
    }

    try {
      // console.log(`AlertsStore: Fetching data (Initial: ${isInitialFetch}, Force: ${options.force})`);
      const [studentsRes, infractionsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/infractions"),
      ]);

      if (!studentsRes.ok || !infractionsRes.ok) {
        throw new Error("Failed to fetch data needed for alerts");
      }

      const [studentsData, infractionsData] = await Promise.all([
        studentsRes.json(),
        infractionsRes.json(),
      ]);

      set({
        students: studentsData as Student[],
        infractions: infractionsData as Infraction[],
        loading: false, // Ensure loading is false after any fetch
        isRefetching: false, // Ensure refetching is false
        hasFetchedOnce: true, // Mark as fetched
        lastFetchTimestamp: Date.now(), // Update timestamp
        error: null, // Clear previous errors on success
      });

      // Trigger settings fetch if needed (can also rely on component mount)
      // useSettingsStore.getState().fetchSettings();
    } catch (error) {
      console.error("Error fetching alerts data:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load alert data";

      if (isInitialFetch) {
        // Only set blocking error state on initial fetch failure
        set({ loading: false, isRefetching: false, error: message });
        toast.error(`Error cargando datos iniciales: ${message}`);
      } else {
        // On background refresh failure, just log and maybe show a non-blocking toast
        set({ isRefetching: false }); // Stop refetch indicator
        toast.warning(`Error actualizando datos en segundo plano: ${message}`);
        // Keep the stale data
      }
    }
  },

  // getStudentsWithAlerts remains the same conceptually
  getStudentsWithAlerts: (section = null) => {
    const { students, infractions } = get();
    const { settings, getThresholdsForSection } = useSettingsStore.getState();

    if (!settings || !students.length || !infractions.length) return []; // Need data & settings

    const sectionStudents = section
      ? students.filter((student) => {
          const sectionMap: Record<string, string> = {
            preschool: "Preschool",
            elementary: "Elementary",
            middle: "Middle School",
            high: "High School",
          };
          const targetSection = sectionMap[section];
          return (
            targetSection && getSectionCategory(student.grado) === targetSection
          );
        })
      : students;

    const studentsWithAlerts = sectionStudents
      .map((student): StudentWithAlert => {
        const typeICount = getStudentTypeICount(student.id, infractions);
        const typeIICount = infractions.filter(
          (inf) => inf.studentId === student.id && inf.type === "Tipo II"
        ).length;

        const sectionCategory = getSectionCategory(student.grado);
        const { primary: primaryThreshold, secondary: secondaryThreshold } =
          getThresholdsForSection(sectionCategory);

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
      .filter((student) => student.alertStatus !== null);

    return studentsWithAlerts.sort((a, b) => {
      if (
        a.alertStatus?.level === "critical" &&
        b.alertStatus?.level !== "critical"
      )
        return -1;
      if (
        a.alertStatus?.level !== "critical" &&
        b.alertStatus?.level === "critical"
      )
        return 1;
      if (a.alertStatus && b.alertStatus) {
        return b.alertStatus.count - a.alertStatus.count;
      }
      return 0;
    });
  },
}));
