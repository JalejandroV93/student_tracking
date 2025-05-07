// src/stores/students.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { CACHE_DURATION_MS } from "@/lib/constantes"; // Import constant

interface StudentDetailsData {
  student: Student | null;
  infractions: Infraction[];
  followUps: FollowUp[];
}

// Add caching for student details
interface CachedStudentDetail extends StudentDetailsData {
  timestamp: number;
}

interface StudentsState {
  // List view / search
  studentsList: Student[];
  filteredStudents: Student[];
  searchQuery: string;
  listLoading: boolean;
  listIsRefetching: boolean; // <-- Added
  listError: string | null;
  listHasFetchedOnce: boolean; // <-- Added
  listLastFetchTimestamp: number | null; // <-- Added

  // Detail view
  selectedStudentData: StudentDetailsData;
  detailLoading: boolean;
  detailIsRefetching: boolean; // <-- Added
  detailError: string | null;
  // Simple cache for details by student ID
  cachedStudentDetails: Record<string, CachedStudentDetail>; // <-- Added

  // Actions
  fetchStudentList: (options?: { force?: boolean }) => Promise<void>; // <-- Added options
  fetchStudentDetails: (
    studentId: string,
    options?: { force?: boolean }
  ) => Promise<void>; // <-- Added options
  addFollowUp: (followUpData: Omit<FollowUp, "id">) => Promise<FollowUp | null>;
  setSearchQuery: (query: string) => void;
  clearSelectedStudent: () => void;
  clearStudentListCache: () => void;
  toggleInfractionAttended: (
    infractionId: string,
    currentAttendedState: boolean
  ) => Promise<boolean>;
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  // List State
  studentsList: [],
  filteredStudents: [],
  searchQuery: "",
  listLoading: false,
  listIsRefetching: false, // Initialize
  listError: null,
  listHasFetchedOnce: false, // Initialize
  listLastFetchTimestamp: null, // Initialize

  // Detail State
  selectedStudentData: { student: null, infractions: [], followUps: [] },
  detailLoading: false,
  detailIsRefetching: false, // Initialize
  detailError: null,
  cachedStudentDetails: {}, // Initialize cache

  // --- Actions ---

  fetchStudentList: async (options = {}) => {
    const {
      listHasFetchedOnce,
      listLastFetchTimestamp,
      listLoading,
      listIsRefetching,
    } = get();
    const now = Date.now();
    const isCacheValid =
      listLastFetchTimestamp &&
      now - listLastFetchTimestamp < CACHE_DURATION_MS;

    if (
      listLoading ||
      listIsRefetching ||
      (listHasFetchedOnce && isCacheValid && !options.force)
    ) {
      if (listHasFetchedOnce && !listLoading && !listIsRefetching) {
        set({ listLoading: false, listIsRefetching: false });
      }
      // console.log("StudentsStore (List): Skipping fetch");
      return;
    }

    const isInitialFetch = !listHasFetchedOnce;

    if (isInitialFetch) {
      set({ listLoading: true, listError: null });
    } else {
      set({ listIsRefetching: true });
    }

    try {
      // console.log(`StudentsStore (List): Fetching data (Initial: ${isInitialFetch}, Force: ${options.force})`);
      const response = await fetch("/api/v1/students");
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }
      const data = await response.json();
      const students = data as Student[];
      set({
        studentsList: students,
        // Re-apply filter after fetching new list data
        filteredStudents: get().searchQuery
          ? students.filter(
              (student) =>
                student.name
                  .toLowerCase()
                  .includes(get().searchQuery.toLowerCase()) ||
                student.id
                  .toLowerCase()
                  .includes(get().searchQuery.toLowerCase())
            )
          : students,
        listLoading: false,
        listIsRefetching: false,
        listHasFetchedOnce: true,
        listLastFetchTimestamp: Date.now(),
        listError: null,
      });
    } catch (error) {
      console.error("Error fetching student list:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load students";
      if (isInitialFetch) {
        set({
          listLoading: false,
          listIsRefetching: false,
          listError: message,
        });
        toast.error(`Error cargando lista de estudiantes: ${message}`);
      } else {
        set({ listIsRefetching: false });
        toast.warning(`Error actualizando lista de estudiantes: ${message}`);
        // Keep stale list
      }
    }
  },

  fetchStudentDetails: async (studentId: string, options = {}) => {
    const {
      cachedStudentDetails,
      detailLoading,
      detailIsRefetching,
      selectedStudentData,
    } = get();
    const now = Date.now();
    const cachedData = cachedStudentDetails[studentId];
    const isCacheValid =
      cachedData && now - cachedData.timestamp < CACHE_DURATION_MS;

    // Check if already loading this specific student, or if valid cache exists and not forced
    if (
      (detailLoading && selectedStudentData.student?.id === studentId) ||
      (detailIsRefetching && selectedStudentData.student?.id === studentId) ||
      (cachedData && isCacheValid && !options.force)
    ) {
      // If valid cache exists, ensure it's displayed and loading is false
      if (cachedData && !detailLoading && !detailIsRefetching) {
        set({
          selectedStudentData: cachedData,
          detailLoading: false,
          detailIsRefetching: false,
        });
      }
      // console.log(`StudentsStore (Detail ${studentId}): Skipping fetch`);
      return;
    }

    // Check if we are switching students but the *cached* data is valid
    if (
      cachedData &&
      isCacheValid &&
      selectedStudentData.student?.id !== studentId &&
      !options.force
    ) {
      // console.log(`StudentsStore (Detail ${studentId}): Serving from valid cache`);
      set({
        selectedStudentData: cachedData,
        detailLoading: false,
        detailIsRefetching: false,
        detailError: null,
      });
      // Optionally still trigger a background refresh even when serving from cache
      // queueMicrotask(() => get().fetchStudentDetails(studentId, { force: true })); // Example: force refetch async
      return; // Don't proceed to full fetch yet
    }

    const isInitialFetchForThisStudent = !cachedData;

    if (
      isInitialFetchForThisStudent ||
      selectedStudentData.student?.id !== studentId
    ) {
      // Set loading true only if it's the first time *ever* loading this student OR switching student
      set({
        detailLoading: true,
        detailError: null,
        selectedStudentData: { student: null, infractions: [], followUps: [] },
      }); // Clear previous student
    } else {
      // Refetching the *same* student
      set({ detailIsRefetching: true });
    }

    try {
      // console.log(`StudentsStore (Detail ${studentId}): Fetching data (Initial: ${isInitialFetchForThisStudent}, Force: ${options.force})`);
      const response = await fetch(`/api/v1/students?studentId=${studentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Estudiante no encontrado (ID: ${studentId})`);
        }
        throw new Error(
          `Failed to fetch student details: ${response.statusText}`
        );
      }
      const data: StudentDetailsData = await response.json();

      if (
        !data.student ||
        !Array.isArray(data.infractions) ||
        !Array.isArray(data.followUps)
      ) {
        throw new Error("Invalid data structure received from API");
      }

      const newCachedDetail: CachedStudentDetail = {
        ...data,
        timestamp: Date.now(),
      };

      set((state) => ({
        selectedStudentData: data, // Update the currently viewed data
        cachedStudentDetails: {
          // Update the cache
          ...state.cachedStudentDetails,
          [studentId]: newCachedDetail,
        },
        detailLoading: false,
        detailIsRefetching: false,
        detailError: null,
      }));
    } catch (error) {
      console.error("Error fetching student details:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load student details";
      if (
        isInitialFetchForThisStudent ||
        selectedStudentData.student?.id !== studentId
      ) {
        set({
          detailLoading: false,
          detailIsRefetching: false,
          detailError: message,
          selectedStudentData: {
            student: null,
            infractions: [],
            followUps: [],
          },
        }); // Ensure previous student is cleared on error
        toast.error(`Error cargando detalles del estudiante: ${message}`);
      } else {
        set({ detailIsRefetching: false });
        toast.warning(`Error actualizando detalles del estudiante: ${message}`);
        // Keep stale detail data if refetch fails
      }
    }
  },

  addFollowUp: async (followUpData) => {
    set({ detailLoading: true }); // Keep indicating activity during add
    try {
      const response = await fetch("/api/v1/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to add follow-up" }));
        throw new Error(
          errorData.error || `Failed to add follow-up: ${response.statusText}`
        );
      }

      const newFollowUp: FollowUp = await response.json();

      // Invalidate cache for this student and update state
      const studentId = get().selectedStudentData.student?.id;
      set((state) => {
        const updatedFollowUps = [
          ...state.selectedStudentData.followUps,
          newFollowUp,
        ];
        const updatedData = {
          ...state.selectedStudentData,
          followUps: updatedFollowUps,
        };
        // Update both selected data and cache
        const updatedCache = studentId
          ? {
              ...state.cachedStudentDetails,
              [studentId]: {
                ...updatedData, // Use the new data
                timestamp: Date.now(), // Update timestamp
              },
            }
          : state.cachedStudentDetails;

        return {
          selectedStudentData: updatedData,
          cachedStudentDetails: updatedCache,
          detailLoading: false, // Finish loading
        };
      });

      toast.success("Follow-up added successfully!");
      return newFollowUp;
    } catch (error) {
      console.error("Error adding follow-up:", error);
      const message =
        error instanceof Error ? error.message : "Failed to add follow-up";
      set({ detailLoading: false });
      toast.error(message);
      return null;
    }
  },

  toggleInfractionAttended: async (infractionId, currentAttendedState) => {
    const newState = !currentAttendedState;
    // Optional: Add specific loading state for this action if needed
    // set({ detailLoading: true }); // Or use a more granular flag

    try {
      const response = await fetch(`/api/v1/infractions/${infractionId}/attend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: newState }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Server error" }));
        throw new Error(
          errorData.error || `Failed to update status: ${response.statusText}`
        );
      }

      // Update state locally
      const studentId = get().selectedStudentData.student?.id;
      set((state) => {
        // Update selectedStudentData
        const updatedInfractions = state.selectedStudentData.infractions.map(
          (inf) =>
            inf.id === infractionId ? { ...inf, attended: newState } : inf
        );
        const updatedSelectedData = {
          ...state.selectedStudentData,
          infractions: updatedInfractions,
        };

        // Update cache if studentId exists
        const updatedCache =
          studentId && state.cachedStudentDetails[studentId]
            ? {
                ...state.cachedStudentDetails,
                [studentId]: {
                  ...state.cachedStudentDetails[studentId], // Keep other data (student, followups)
                  infractions: updatedInfractions, // Update only infractions
                  timestamp: Date.now(), // Update timestamp
                },
              }
            : state.cachedStudentDetails;

        return {
          selectedStudentData: updatedSelectedData,
          cachedStudentDetails: updatedCache,
          // detailLoading: false, // Reset loading state if used
        };
      });

      toast.success(
        `Falta marcada como ${newState ? '"Atendida"' : '"Pendiente"'}.`
      );

      // --- Crucial: Trigger Alert Recalculation ---
      // Because alerts depend on infractions across potentially *multiple* students,
      // the cleanest way is often to refetch the underlying data for the alerts store
      // or trigger a recalculation if the store holds all necessary data.
      // If useAlertsStore holds its own copy of infractions, it needs updating.
      // If it relies on useStudentsStore, it might not update automatically.
      // A simple approach is to invalidate the alerts store's data or force a refetch.
      // Let's assume useAlertsStore needs a hint to refresh.
      // Import and call its fetch function (or a dedicated recalculate function).
      // import { useAlertsStore } from './alerts.store'; // Adjust import path
      // useAlertsStore.getState().fetchAlertsData({ force: true }); // Force reload alert data

      return true; // Indicate success
    } catch (error) {
      console.error("Error toggling infraction attended status:", error);
      const message = error instanceof Error ? error.message : "Update failed";
      toast.error(`Error: ${message}`);
      // set({ detailLoading: false }); // Reset loading state if used
      return false; // Indicate failure
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const lowerCaseQuery = query.toLowerCase();
    const list = get().studentsList; // Use the full list for filtering
    const filtered = lowerCaseQuery
      ? list.filter(
          (student) =>
            student.name.toLowerCase().includes(lowerCaseQuery) ||
            student.id.toLowerCase().includes(lowerCaseQuery)
        )
      : list;
    set({ filteredStudents: filtered });
  },

  clearSelectedStudent: () => {
    set({
      selectedStudentData: { student: null, infractions: [], followUps: [] },
      detailLoading: false,
      detailIsRefetching: false,
      detailError: null,
    });
  },

  clearStudentListCache: () => {
    set({
      listHasFetchedOnce: false,
      listLastFetchTimestamp: null,
      studentsList: [],
      filteredStudents: [],
    });
    toast.info("Cache de lista de estudiantes limpiado.");
    // Optionally trigger a forced refetch immediately
    // get().fetchStudentList({ force: true });
  },
}));
