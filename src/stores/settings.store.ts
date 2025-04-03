// src/stores/settings.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { AlertSettings } from "@/types/dashboard";
// No longer need SECCIONES_ACADEMICAS here for defaults

interface SettingsState {
  settings: AlertSettings | null; // Initialize as null
  loading: boolean;
  error: string | null;
  areSettingsConfigured: boolean | null; // null = unknown, false = not configured, true = configured
  fetchSettings: (options?: { force?: boolean }) => Promise<void>; // Add force option
  updateSettings: (newSettings: AlertSettings) => Promise<boolean>; // Return success boolean
  getThresholdsForSection: (
    sectionName: string
  ) => { primary: number; secondary: number } | null; // Return null if not configured
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null, // Start as null
  loading: false,
  error: null,
  areSettingsConfigured: null, // Start as unknown

  fetchSettings: async (options = {}) => {
    const { areSettingsConfigured, loading } = get();

    // Basic cache check: if already configured and not forced, don't refetch unless loading
    if (areSettingsConfigured === true && !options.force && !loading) {
      // console.log("SettingsStore: Skipping fetch (already configured and not forced)");
      // Ensure loading is false if we skip
      if (loading) set({ loading: false });
      return;
    }
    // Prevent duplicate fetches if already loading
    if (loading) {
      // console.log("SettingsStore: Skipping fetch (already loading)");
      return;
    }

    set({ loading: true, error: null }); // Set loading true *only* when actually fetching

    try {
      const response = await fetch("/api/alert-settings");
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();

      // API should return { configured: boolean, settings?: AlertSettings }
      if (data.configured && data.settings) {
        set({
          settings: data.settings as AlertSettings,
          loading: false,
          areSettingsConfigured: true,
          error: null,
        });
      } else {
        // Explicitly not configured
        set({
          settings: null,
          loading: false,
          areSettingsConfigured: false,
          error: null,
        });
        // Optional: Inform user if first time and not configured
        // if (get().areSettingsConfigured === null) { // Check if it was the very first check
        //    toast.info("Por favor, configure los umbrales de alerta iniciales.");
        // }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load settings";
      set({
        loading: false,
        error: message,
        settings: null, // Ensure settings are null on error
        areSettingsConfigured: null, // Status is unknown on error
      });
      toast.error(`Error cargando configuración: ${message}`);
    }
  },

  updateSettings: async (newSettings) => {
    set({ loading: true }); // Indicate saving process
    try {
      const response = await fetch("/api/alert-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to update settings" }));
        throw new Error(
          errorData.error || `Failed to update settings: ${response.statusText}`
        );
      }

      const savedSettings = await response.json(); // API should return the saved data

      // Optimistic update + confirmation from response
      set({
        settings: savedSettings, // Use the response data ideally
        loading: false,
        areSettingsConfigured: true, // Mark as configured upon successful save
        error: null,
      });
      toast.success("Configuración guardada exitosamente!");
      return true; // Indicate success
    } catch (error) {
      console.error("Error updating settings:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update settings";
      set({ loading: false, error: message }); // Keep potentially stale settings but show error
      toast.error(`Error guardando configuración: ${message}`);
      return false; // Indicate failure
    }
  },

  getThresholdsForSection: (sectionName: string) => {
    const { settings, areSettingsConfigured } = get();

    // Return null if settings are not loaded or not configured
    if (!settings || areSettingsConfigured !== true) {
      return null;
    }

    // Proceed if settings are loaded and configured
    const sectionSettings = settings.sections[sectionName];

    // Fallback logic remains, but only applies *after* confirming settings exist
    return {
      primary: sectionSettings?.primary ?? settings.primary.threshold,
      secondary: sectionSettings?.secondary ?? settings.secondary.threshold,
    };
  },
}));
