// test/example-usage.tsx
import React from "react";
import type { CaseItem } from "../src/stores/case-management.store";
import { CaseManagementList } from "../src/components/case-management/CaseManagementList";

// Ejemplo de uso básico del componente refactorizado
const mockCase: CaseItem = {
  id: "case-1",
  studentId: "student-1",
  studentName: "Juan Pérez",
  studentSection: "Primaria",
  studentGrade: "Quinto A",
  infractionDate: "2025-08-01",
  infractionNumber: "II - 1",
  followUps: [
    {
      id: "followup-1",
      infractionId: "case-1",
      followUpNumber: 1,
      date: "2025-08-15",
      type: "Seguimiento",
      details: "Primer seguimiento realizado con el estudiante.",
      author: "Prof. García",
      createdAt: "2025-08-15T10:00:00Z",
      updatedAt: "2025-08-15T10:00:00Z",
    },
  ],
  expectedDates: ["2025-09-01", "2025-11-01", "2026-02-01"],
  status: "open" as const,
  isComplete: false,
  nextFollowUpNumber: 2,
  nextFollowUpDate: "2025-11-01",
  isNextFollowUpOverdue: false,
};

const ExampleUsage: React.FC = () => {
  const handleSelectStudent = (studentId: string) => {
    console.log("Estudiante seleccionado:", studentId);
  };

  return (
    <div className="p-4">
      <h1>Ejemplo de Uso - Case Management List</h1>
      <CaseManagementList
        cases={[mockCase]}
        onSelectStudent={handleSelectStudent}
      />
    </div>
  );
};

export default ExampleUsage;
