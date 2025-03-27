import { create } from "zustand";
import { toast } from "sonner";
import type { Infraction } from "@/types/dashboard";

interface InfractionsState {
  infractions: Infraction[];
  loading: boolean;
  error: string | null;
  fetchInfractions: () => Promise<void>;
}

export const useInfractionsStore = create<InfractionsState>((set) => ({
  infractions: [],
  loading: false,
  error: null,

  fetchInfractions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/infractions");
      if (!response.ok) {
        throw new Error(`Failed to fetch infractions: ${response.statusText}`);
      }
      const data = await response.json();
      set({
        infractions: data,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching infractions:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load infractions";
      set({ loading: false, error: message });
      toast.error(message);
    }
  },
}));
