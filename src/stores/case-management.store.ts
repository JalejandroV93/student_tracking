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
          fetch("/api/v1/students?limit=1000"), // Aumentar límite para obtener todos los estudiantes
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

        // Extract data from API responses that may have pagination structure
        const students = Array.isArray(studentsData) 
          ? studentsData 
          : studentsData.data || [];
        const infractions = Array.isArray(infractionsData) 
          ? infractionsData 
          : infractionsData.data || [];
        const followUps = Array.isArray(followUpsData) 
          ? followUpsData 
          : followUpsData.data || [];

        // Debug logs para ver los datos que llegan
        console.log("Case Management Store - Loaded data:", {
          studentsCount: students.length,
          infractionsCount: infractions.length,
          followUpsCount: followUps.length,
          sampleStudent: students[0] ? { id: students[0].id, name: students[0].name } : "No students",
          sampleInfraction: infractions[0] ? { id: infractions[0].id, studentId: infractions[0].studentId, type: infractions[0].type } : "No infractions"
        });

        set({
          students: students as Student[],
          infractions: infractions as Infraction[],
          followUps: followUps as FollowUp[],
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

      // Validar que los datos sean arrays antes de continuar
      if (!Array.isArray(students) || !Array.isArray(infractions) || !Array.isArray(followUps)) {
        console.warn("Case management data is not properly loaded yet", {
          studentsIsArray: Array.isArray(students),
          infractionsIsArray: Array.isArray(infractions),
          followUpsIsArray: Array.isArray(followUps)
        });
        return [];
      }

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

        // Depurar y registrar el problema con más detalle
        if (!student) {
          console.warn(
            `No se encontró estudiante para la infracción ID: ${infraction.id}, studentId: ${infraction.studentId}`
          );
          console.log("Comparando IDs:");
          console.log("  Buscando studentId:", infraction.studentId);
          console.log("  IDs de estudiantes disponibles (primeros 5):", 
            students.slice(0, 5).map((s) => ({ id: s.id, name: s.name }))
          );
          console.log("  Total estudiantes cargados:", students.length);
        } else {
          // Log cuando SÍ encontramos el estudiante
          console.log(`✓ Estudiante encontrado: ${student.name} (${student.id}) para infracción ${infraction.id}`);
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
          studentName: student?.name || `[ID: ${infraction.studentId}]`, // Mostrar el ID del estudiante cuando no se encuentra el nombre
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
