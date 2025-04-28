// src/stores/alerts.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student } from "@/types/dashboard";
import { AlertStatus } from "@/lib/utils";
import { CACHE_DURATION_MS } from "@/lib/constantes";
import { getSectionCategory } from "@/lib/constantes";

interface StudentWithAlert extends Student {
  alertStatus: AlertStatus | null;
  typeICount?: number;
  typeIICount: number;
}

interface AlertsState {
  students: StudentWithAlert[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  hasFetchedOnce: boolean;
  lastFetchTimestamp: number | null;
  fetchAlertsData: (options?: {
    force?: boolean;
    section?: string;
  }) => Promise<void>;
  getStudentsWithAlerts: (section?: string | null) => StudentWithAlert[];
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  students: [],
  loading: false,
  isRefetching: false,
  error: null,
  hasFetchedOnce: false,
  lastFetchTimestamp: null,

  fetchAlertsData: async (options = {}) => {
    const { hasFetchedOnce, lastFetchTimestamp, loading, isRefetching } = get();
    const now = Date.now();
    const isCacheValid =
      lastFetchTimestamp && now - lastFetchTimestamp < CACHE_DURATION_MS;

    if (
      loading ||
      isRefetching ||
      (hasFetchedOnce && isCacheValid && !options.force)
    ) {
      if (hasFetchedOnce && !loading && !isRefetching) {
        set({ loading: false, isRefetching: false });
      }
      return;
    }

    const isInitialFetch = !hasFetchedOnce;

    if (isInitialFetch) {
      set({ loading: true, error: null });
    } else {
      set({ isRefetching: true });
    }

    try {
      const queryParams = new URLSearchParams();
      if (options.section) {
        queryParams.append("section", options.section);
      }

      const response = await fetch(`/api/alerts?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts data");
      }

      const studentsWithAlerts = await response.json();

      set({
        students: studentsWithAlerts,
        loading: false,
        isRefetching: false,
        hasFetchedOnce: true,
        lastFetchTimestamp: Date.now(),
        error: null,
      });
    } catch (error) {
      console.error("Error fetching alerts data:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load alert data";

      if (isInitialFetch) {
        set({ loading: false, isRefetching: false, error: message });
        toast.error(`Error cargando datos iniciales: ${message}`);
      } else {
        set({ isRefetching: false });
        toast.warning(`Error actualizando datos en segundo plano: ${message}`);
      }
    }
  },

  getStudentsWithAlerts: (section = null) => {
    const { students } = get();

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
        return (
          targetSection && getSectionCategory(student.grado) === targetSection
        );
      });
    }

    return students;
  },
}));
