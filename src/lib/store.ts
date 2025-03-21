// src/lib/store.ts
import { create } from "zustand";
import {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";
import { AlertStatus } from "@/lib/utils";

import { getStudentTypeICount } from "@/lib/utils";

interface DashboardState {
  students: Student[];
  infractions: Infraction[];
  followUps: FollowUp[];
  alertSettings: AlertSettings;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addFollowUp: (followUp: FollowUp) => void;
  updateAlertSettings: (settings: AlertSettings) => void;
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

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
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
        throw new Error("Error fetching data");
      }

      const [studentsData, infractionsData, followUpsData, settingsData] =
        await Promise.all([
          studentsRes.json(),
          infractionsRes.json(),
          followUpsRes.json(),
          settingsRes.json(),
        ]);

      set({
        students: studentsData,
        infractions: infractionsData,
        followUps: followUpsData,
        alertSettings: settingsData, // Set directly
        loading: false,
      });
    } catch (err: any) {
      console.error("Error fetching data:", err);
      set({
        loading: false,
        error: "Error loading data. Please try again later.",
      });
    }
  },

  addFollowUp: (followUp: FollowUp) => {
    set((state) => ({
      followUps: [...state.followUps, followUp],
    }));

    // Send the new follow-up to the server
    fetch("/api/followups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(followUp),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Ideally, you would also revert the state change in case of an error.
        set((state) => ({
          followUps: state.followUps.filter((f) => f.id !== followUp.id),
        }));
      });
  },

  updateAlertSettings: (settings: AlertSettings) => {
    set({ alertSettings: settings });

    // Send updated settings to the server
    fetch("/api/alert-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        // Revert to previous settings if update fails?  Up to you.
      });
  },

  getStudentAlertStatus: (studentId: string): AlertStatus | null => {
    const state = get(); // Get current state
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, state.infractions);

    // Use optional chaining and nullish coalescing for safety
    const sectionThreshold =
      state.alertSettings.sections?.[student.section]?.primary ??
      state.alertSettings.primary.threshold;

    if (typeICount >= sectionThreshold) {
      return { level: "warning", count: typeICount };
    }
    return null;
  },
}));

export default useDashboardStore;
