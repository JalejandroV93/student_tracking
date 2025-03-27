// src/lib/store.ts
import { create } from "zustand";
import {
  AlertSettings,
  FollowUp,
  Infraction,
  Student,
} from "@/types/dashboard";
import {
  AlertStatus,
  getStudentTypeICount,
  transformFollowUp,
  transformInfraction,
  transformStudent,
} from "@/lib/utils";
import { getSectionCategory } from "./constantes";
import { toast } from "sonner";

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

      // Transform data *immediately* after fetching
      const transformedStudents = studentsData.map(transformStudent);
      const transformedInfractions = infractionsData.map(transformInfraction);
      const transformedFollowUps = followUpsData.map(transformFollowUp);

      // Calculate type counts
      const typeICounts = infractionsData.filter(
        // Use infractionsData directly
        (inf: Infraction) => inf.type === "Tipo I" // Consistent check
      ).length;
      const typeIICounts = infractionsData.filter(
        // Use infractionsData directly
        (inf: Infraction) => inf.type === "Tipo II" // Consistent check
      ).length;
      const typeIIICounts = infractionsData.filter(
        // Use infractionsData directly
        (inf: Infraction) => inf.type === "Tipo III" // Consistent check
      ).length;

      console.log("Data fetched successfully:", {
        students: transformedStudents.length,
        infractions: transformedInfractions.length,
        followUps: transformedFollowUps.length,
        typeCounts: {
          typeI: typeICounts,
          typeII: typeIICounts,
          typeIII: typeIIICounts,
        },
      });

      set({
        students: transformedStudents,
        infractions: infractionsData,
        followUps: transformedFollowUps,
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
        followUps: [...state.followUps, transformFollowUp(newFollowUp)],
      }));
      toast.success("Follow-up added successfully");
    } catch (error) {
      console.error("Error adding follow-up:", error);
      toast.error("Failed to add follow-up");
      throw error; // Re-throw to let calling component handle it if needed
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
      await get().fetchData(); // Refetch to get the latest data
      toast.success("Alert settings updated successfully");
    } catch (error) {
      console.error("Error updating alert settings:", error);
      toast.error("Failed to update alert settings");
      throw error; // Re-throw for consistency
    }
  },

  getStudentAlertStatus: (studentId: string): AlertStatus | null => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, state.infractions);

    // Use getSectionCategory to get the correct level
    const sectionCategory = getSectionCategory(student.grado);

    const sectionSettings = state.alertSettings.sections[sectionCategory];

    // Get thresholds, using defaults if not set for the section
    const primaryThreshold = sectionSettings?.primary ?? state.alertSettings.primary.threshold;

    const secondaryThreshold = sectionSettings?.secondary ?? state.alertSettings.secondary.threshold;


    if (typeICount >= secondaryThreshold) {
      return { level: "critical", count: typeICount };
    } else if (typeICount >= primaryThreshold) {
      return { level: "warning", count: typeICount };
    }

    return null;
  },
}));

export default useDashboardStore;
