// src/stores/case-management.store.ts
import { create } from "zustand";
import { toast } from "sonner";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { calculateExpectedFollowUpDates } from "@/lib/utils";
import { getSectionCategory } from "@/lib/constantes";

// Structure for a case derived from a Type II infraction
export interface CaseItem {
  id: string; // Infraction ID acts as Case ID
  studentId: string;
  studentName: string;
  studentSection: string; // e.g., "Primaria", "Secundaria"
  studentGrade: string; // e.g., "Quinto A"
  infractionDate: string;
  infractionNumber: string; // e.g., "II - 1"
  followUps: FollowUp[]; // Actual follow-ups recorded
  expectedDates: string[]; // Expected follow-up dates
  status: "open" | "closed";
  isComplete: boolean;
  nextFollowUpNumber: number | null; // 1, 2, or 3
  nextFollowUpDate: string | null; // Expected date for the next one
  isNextFollowUpOverdue: boolean;
}

interface CaseManagementState {
  students: Student[];
  infractions: Infraction[]; // Only Type II needed, but fetching all might be simpler API-wise
  followUps: FollowUp[];
  loading: boolean;
  error: string | null;
  fetchCaseData: () => Promise<void>;
  getCases: (section?: string | null) => CaseItem[]; // Selector to derive cases
}

export const useCaseManagementStore = create<CaseManagementState>(
  (set, get) => ({
    students: [],
    infractions: [],
    followUps: [],
    loading: false,
    error: null,

    fetchCaseData: async () => {
      // if (get().students.length > 0) { // Basic cache check
      //     set({ loading: false });
      //     return;
      // }
      set({ loading: true, error: null });
      try {
        // Fetch students, infractions, and follow-ups
        const [studentsRes, infractionsRes, followUpsRes] = await Promise.all([
          fetch("/api/v1/students"),
          fetch("/api/v1/infractions"),
          fetch("/api/v1/followups"),
        ]);

        if (!studentsRes.ok || !infractionsRes.ok || !followUpsRes.ok) {
          throw new Error("Failed to fetch data needed for case management");
        }

        const [studentsData, infractionsData, followUpsData] =
          await Promise.all([
            studentsRes.json(),
            infractionsRes.json(),
            followUpsRes.json(),
          ]);

        // Assuming APIs return the transformed data
        set({
          students: studentsData as Student[],
          infractions: infractionsData as Infraction[],
          followUps: followUpsData as FollowUp[],
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching case data:", error);
        const message =
          error instanceof Error ? error.message : "Failed to load case data";
        set({ loading: false, error: message });
        toast.error(message);
      }
    },

    getCases: (section = null) => {
      const { students, infractions, followUps } = get();

      const typeIIInfractions = infractions.filter(
        (inf) => inf.type === "Tipo II"
      );

      // Filter infractions based on section *before* mapping to cases
      const sectionInfractions = section
        ? typeIIInfractions.filter((inf) => {
            const student = students.find((s) => s.id === inf.studentId);
            if (!student) return false;
            const sectionMap: Record<string, string> = {
              preschool: "Preschool",
              elementary: "Elementary",
              middle: "Middle School",
              high: "High School",
            };
            const targetSection = sectionMap[section];
            return (
              targetSection &&
              getSectionCategory(student.grado) === targetSection
            );
          })
        : typeIIInfractions;

      // Map filtered infractions to CaseItem structure
      const cases = sectionInfractions.map((infraction): CaseItem => {
        const student = students.find(
          (s) => s.id === infraction.studentId // Verificar si existe el estudiante por ID
        );

        // Depurar y registrar el problema
        if (!student) {
          console.warn(
            `No se encontró estudiante para la infracción ID: ${infraction.id}, studentId: ${infraction.studentId}`
          );
          console.log(
            "IDs de estudiantes disponibles:",
            students.map((s) => s.id)
          );
        }

        const caseFollowUps = followUps.filter(
          (f) => f.infractionId === infraction.id
        );

        // Identificar los números de seguimiento existentes
        const existingFollowUpNumbers = new Set(
          caseFollowUps.map((f) => f.followUpNumber)
        );

        // Calculamos cuántos seguimientos faltan (máximo 3 para Tipo II)
        const pendingFollowUpCount = 3 - existingFollowUpNumbers.size;

        const expectedDates = calculateExpectedFollowUpDates(infraction.date);

        // Un caso está completo cuando tenemos los 3 seguimientos requeridos (1, 2 y 3)
        const isComplete = pendingFollowUpCount === 0;
        const status = isComplete ? "closed" : "open";

        // Para determinar el próximo seguimiento, verificamos cuál es el menor número ausente
        const nextFollowUpNumber = [1, 2, 3].find(
          (num) => !existingFollowUpNumbers.has(num)
        );

        const nextFollowUpDate = nextFollowUpNumber
          ? expectedDates[nextFollowUpNumber - 1]
          : null;

        const isNextFollowUpOverdue = nextFollowUpDate
          ? new Date() > new Date(nextFollowUpDate)
          : false;

        return {
          id: infraction.id,
          studentId: infraction.studentId,
          studentName: student?.name || "Estudiante ID:" + infraction.studentId, // Mostrar el ID del estudiante cuando no se encuentra el nombre
          studentSection: student ? getSectionCategory(student.grado) : "N/A",
          studentGrade: student?.grado || "N/A",
          infractionDate: infraction.date,
          infractionNumber: `${infraction.type} - ${infraction.number}`,
          followUps: caseFollowUps,
          expectedDates,
          status,
          isComplete,
          nextFollowUpNumber: nextFollowUpNumber || null,
          nextFollowUpDate,
          isNextFollowUpOverdue,
        };
      });

      // Sort cases: open first (overdue prioritized), then closed
      return [...cases].sort((a, b) => {
        if (a.status === "open" && b.status === "closed") return -1;
        if (a.status === "closed" && b.status === "open") return 1;
        if (a.status === "open" && b.status === "open") {
          if (a.isNextFollowUpOverdue && !b.isNextFollowUpOverdue) return -1;
          if (!a.isNextFollowUpOverdue && b.isNextFollowUpOverdue) return 1;
          // Optional: Sort open cases by next follow-up date ascending
          const dateA = a.nextFollowUpDate
            ? new Date(a.nextFollowUpDate).getTime()
            : Infinity;
          const dateB = b.nextFollowUpDate
            ? new Date(b.nextFollowUpDate).getTime()
            : Infinity;
          if (dateA !== dateB) return dateA - dateB;
          // Fallback sort by infraction date if next follow-up dates are the same/null
          return (
            new Date(a.infractionDate).getTime() -
            new Date(b.infractionDate).getTime()
          );
        }
        // Sort closed cases by infraction date descending (most recent first)
        return (
          new Date(b.infractionDate).getTime() -
          new Date(a.infractionDate).getTime()
        );
      });
    },
  })
);
