import { AlertStatus } from "@/lib/utils";
// Correct import

import { getStudentTypeICount } from "@/lib/utils";
import { AlertSettings, FollowUp, Infraction, Student } from "@/types/dashboard";
import { toast } from "sonner";
// src/lib/store.ts (CORRECTED)
import { create } from "zustand";

import { getSectionCategory } from "./constantes";

interface DashboardState {
  students: Student[];
  infractions: Infraction[];
  followUps: FollowUp[];
  alertSettings: AlertSettings;
  loading: boolean;
  error: string | null;
  typeICounts: number;
  typeIICounts: number;
  typeIIICounts: number;
  fetchData: () => Promise<void>;
  addFollowUp: (followUp: Omit<FollowUp, "id">) => Promise<void>;
  updateAlertSettings: (settings: AlertSettings) => Promise<void>;
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
}

const useDashboardStore = create<DashboardState>((set, get) => ({
  students: [],
  infractions: [],
  followUps: [],
  alertSettings: {
    primary: { threshold: 3 },
    secondary: { threshold: 5 },
    sections: {},
  }, // Initial
  loading: true,
  error: null,
  typeICounts: 0,
  typeIICounts: 0,
  typeIIICounts: 0,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      console.log("Fetching dashboard data...");

      const [studentsRes, infractionsRes, followUpsRes, settingsRes] =
        await Promise.all([
          fetch("/api/students"),
          fetch("/api/infractions"),
          fetch("/api/followups"),
          fetch("/api/alert-settings"),
        ]);

      if (
        !studentsRes.ok ||
        !infractionsRes.ok ||
        !followUpsRes.ok ||
        !settingsRes.ok
      ) {
        throw new Error("Error fetching data from one or more endpoints");
      }

      const [studentsData, infractionsData, followUpsData, settingsData] =
        await Promise.all([
          studentsRes.json(),
          infractionsRes.json(),
          followUpsRes.json(),
          settingsRes.json(),
        ]);

      // Calculate type counts
      const typeICounts = infractionsData.filter(
        (inf: Infraction) => inf.type === "I"
      ).length;
      const typeIICounts = infractionsData.filter(
        (inf: Infraction) => inf.type === "II"
      ).length;
      const typeIIICounts = infractionsData.filter(
        (inf: Infraction) => inf.type === "III"
      ).length;

      console.log("Data fetched successfully:", {
        students: studentsData.length,
        infractions: infractionsData.length,
        followUps: followUpsData.length,
      });

      set({
        students: studentsData,
        infractions: infractionsData,
        followUps: followUpsData,
        alertSettings: settingsData,
        loading: false,
        typeICounts,
        typeIICounts,
        typeIIICounts,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error loading data. Please try again later.";
      set({
        loading: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  },

  addFollowUp: async (followUp: Omit<FollowUp, "id">) => {
    try {
      const response = await fetch("/api/followups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(followUp),
      });

      if (!response.ok) {
        throw new Error("Failed to add follow-up");
      }

      const newFollowUp = await response.json();
      set((state) => ({
        followUps: [...state.followUps, newFollowUp],
      }));
      toast.success("Follow-up added successfully");
    } catch (error) {
      console.error("Error adding follow-up:", error);
      toast.error("Failed to add follow-up");
      throw error;
    }
  },

  updateAlertSettings: async (settings: AlertSettings) => {
    try {
      const response = await fetch("/api/alert-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert settings");
      }

      const updatedSettings = await response.json();
      set({ alertSettings: updatedSettings });
      toast.success("Alert settings updated successfully");
    } catch (error) {
      console.error("Error updating alert settings:", error);
      toast.error("Failed to update alert settings");
      throw error;
    }
  },

  getStudentAlertStatus: (studentId: string): AlertStatus | null => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, state.infractions);

    // Use getSectionCategory to get the correct level
    const sectionCategory = getSectionCategory(student.grado);

    // Get thresholds, using defaults if not set for the section
    const primaryThreshold =
      state.alertSettings.sections[sectionCategory]?.primary ??
      state.alertSettings.primary.threshold;
    const secondaryThreshold =
      state.alertSettings.sections[sectionCategory]?.secondary ??
      state.alertSettings.secondary.threshold;

    if (typeICount >= secondaryThreshold) {
      return { level: "critical", count: typeICount };
    } else if (typeICount >= primaryThreshold) {
      return { level: "warning", count: typeICount };
    }

    return null;
  },
}));

export default useDashboardStore;
