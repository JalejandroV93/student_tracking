// src/stores/students.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";


interface StudentDetailsData {
  student: Student | null;
  infractions: Infraction[];
  followUps: FollowUp[];
}

interface StudentsState {
  // For list view / search
  studentsList: Student[];
  filteredStudents: Student[];
  searchQuery: string;
  listLoading: boolean;
  listError: string | null;

  // For detail view
  selectedStudentData: StudentDetailsData;
  detailLoading: boolean;
  detailError: string | null;

  // Actions
  fetchStudentList: () => Promise<void>;
  fetchStudentDetails: (studentId: string) => Promise<void>;
  addFollowUp: (
    followUpData: Omit<FollowUp, "id">
  ) => Promise<FollowUp | null>; // Return the created follow-up
  setSearchQuery: (query: string) => void;
  clearSelectedStudent: () => void;
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  // List State
  studentsList: [],
  filteredStudents: [],
  searchQuery: "",
  listLoading: false,
  listError: null,

  // Detail State
  selectedStudentData: {
    student: null,
    infractions: [],
    followUps: [],
  },
  detailLoading: false,
  detailError: null,

  // --- Actions ---

  fetchStudentList: async () => {
    if (get().studentsList.length > 0) {
      // Avoid refetching if list already exists
      // Invalidate cache logic could be added here if needed
      set({ filteredStudents: get().studentsList, listLoading: false });
      return;
    }
    set({ listLoading: true, listError: null });
    try {
      const response = await fetch("/api/students");
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.statusText}`);
      }
      const data = await response.json();
      // Assuming the API returns the transformed format directly now
      // If not, transform here: const transformedStudents = data.map(transformStudent);
      const students = data as Student[]; // Assuming API returns correct type
      set({
        studentsList: students,
        filteredStudents: students, // Initially show all
        listLoading: false,
      });
    } catch (error) {
      console.error("Error fetching student list:", error);
      const message =
        error instanceof Error ? error.message : "Failed to load students";
      set({ listLoading: false, listError: message });
      toast.error(message);
    }
  },

  fetchStudentDetails: async (studentId: string) => {
    // Check if the correct student is already loaded
    if (get().selectedStudentData.student?.id === studentId) {
      set({ detailLoading: false });
      return;
    }

    set({ detailLoading: true, detailError: null, selectedStudentData: { student: null, infractions: [], followUps: [] } });
    try {
      const response = await fetch(`/api/students?studentId=${studentId}`);
      if (!response.ok) {
        if (response.status === 404) {
             throw new Error(`Student not found (ID: ${studentId})`);
        }
        throw new Error(
          `Failed to fetch student details: ${response.statusText}`
        );
      }
      const data: StudentDetailsData = await response.json(); // Assuming API returns the correct structure { student, infractions, followUps }

      // Optional: Validate data structure here
      if (!data.student || !Array.isArray(data.infractions) || !Array.isArray(data.followUps)) {
          throw new Error("Invalid data structure received from API");
      }


      set({
        selectedStudentData: data,
        detailLoading: false,
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
       const message =
        error instanceof Error ? error.message : "Failed to load student details";
      set({ detailLoading: false, detailError: message });
      toast.error(message);
    }
  },

  addFollowUp: async (followUpData) => {
    set({ detailLoading: true }); // Indicate activity
    try {
      const response = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpData), // Send raw data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add follow-up' }));
        throw new Error(errorData.error || `Failed to add follow-up: ${response.statusText}`);
      }

      const newFollowUp: FollowUp = await response.json(); // API should return the created FollowUp with ID

      // Add the new follow-up to the *selected* student's data
      set((state) => ({
        selectedStudentData: {
          ...state.selectedStudentData,
          followUps: [...state.selectedStudentData.followUps, newFollowUp],
        },
        detailLoading: false,
      }));
      toast.success("Follow-up added successfully!");
      return newFollowUp; // Return the newly created follow-up
    } catch (error) {
      console.error("Error adding follow-up:", error);
       const message =
        error instanceof Error ? error.message : "Failed to add follow-up";
      set({ detailLoading: false }); // Stop loading indicator
      toast.error(message);
      return null; // Indicate failure
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const lowerCaseQuery = query.toLowerCase();
    const list = get().studentsList;
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
          detailError: null,
      });
  },
}));