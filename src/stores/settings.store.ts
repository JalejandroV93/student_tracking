// src/stores/settings.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { AlertSettings } from "@/types/dashboard";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";

interface SettingsState {
  settings: AlertSettings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: AlertSettings) => Promise<void>;
  // Helper to get thresholds for a specific section, falling back to general
  getThresholdsForSection: (sectionName: string) => { primary: number; secondary: number };
}

const defaultSettings: AlertSettings = {
    primary: { threshold: 3 },
    secondary: { threshold: 5 },
    sections: Object.values(SECCIONES_ACADEMICAS).reduce((acc, section) => {
      acc[section] = { primary: 3, secondary: 5 }; // Default section values
      return acc;
    }, {} as Record<string, { primary: number; secondary: number }>),
  };


export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,

  fetchSettings: async () => {
    // Avoid refetch if settings are already loaded (basic cache)
    // if (get().settings.primary.threshold !== defaultSettings.primary.threshold) {
    //     set({ loading: false });
    //     return;
    // }
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/alert-settings");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch settings: ${response.statusText}`
        );
      }
      const data: AlertSettings = await response.json();

      // Ensure all academic sections have entries, using defaults if missing
      const completeSettings = { ...data, sections: { ...defaultSettings.sections } };
       for (const sectionKey in data.sections) {
            if (Object.prototype.hasOwnProperty.call(data.sections, sectionKey)) {
                completeSettings.sections[sectionKey] = data.sections[sectionKey];
            }
       }


      set({ settings: completeSettings, loading: false });
    } catch (error) {
      console.error("Error fetching settings:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load settings";
      set({ loading: false, error: message, settings: defaultSettings }); // Revert to default on error
      toast.error(message);
    }
  },

  updateSettings: async (newSettings) => {
    set({ loading: true });
    try {
      const response = await fetch("/api/alert-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Failed to update settings' }));
        throw new Error(errorData.error || `Failed to update settings: ${response.statusText}`);
      }

      // Update local state immediately on success
      set({ settings: newSettings, loading: false });
      toast.success("Settings updated successfully!");
      // Optionally refetch to confirm, but optimistic update is often fine here
      // await get().fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update settings";
      set({ loading: false }); // Revert loading state
      toast.error(message);
      // Optionally revert local state or refetch on error
      await get().fetchSettings();
    }
  },

  getThresholdsForSection: (sectionName: string) => {
      const state = get();
      const sectionSettings = state.settings.sections[sectionName];
      return {
          primary: sectionSettings?.primary ?? state.settings.primary.threshold,
          secondary: sectionSettings?.secondary ?? state.settings.secondary.threshold,
      };
  }
}));