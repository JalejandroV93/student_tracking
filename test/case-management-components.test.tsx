// test/case-management-components.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CaseManagementList } from "../src/components/case-management/CaseManagementList";
import { CaseDetailsDialog } from "../src/components/case-management/CaseDetailsDialog";
import type { CaseItem } from "../src/stores/case-management.store";

// Mock data para pruebas
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
      followUpNumber: 1,
      date: "2025-08-15",
      details: "Primer seguimiento realizado",
      author: "Prof. García",
      studentId: "student-1",
      infractionId: "case-1",
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

const mockCases: CaseItem[] = [mockCase];

describe("Componentes de Case Management", () => {
  test("CaseManagementList renderiza correctamente", () => {
    const mockOnSelectStudent = jest.fn();

    render(
      <CaseManagementList
        cases={mockCases}
        onSelectStudent={mockOnSelectStudent}
      />
    );

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Quinto A")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  test("CaseManagementList maneja clic en fila", () => {
    const mockOnSelectStudent = jest.fn();

    render(
      <CaseManagementList
        cases={mockCases}
        onSelectStudent={mockOnSelectStudent}
      />
    );

    const row = screen.getByRole("row", { name: /juan pérez/i });
    fireEvent.click(row);

    expect(mockOnSelectStudent).toHaveBeenCalledWith("student-1");
  });

  test("CaseDetailsDialog renderiza correctamente", () => {
    const mockOnOpenChange = jest.fn();

    render(
      <CaseDetailsDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        caseItem={mockCase}
      />
    );

    expect(screen.getByText("Detalles del Caso")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Seguimientos Registrados")).toBeInTheDocument();
  });

  test("CaseManagementList muestra mensaje cuando no hay casos", () => {
    const mockOnSelectStudent = jest.fn();

    render(
      <CaseManagementList cases={[]} onSelectStudent={mockOnSelectStudent} />
    );

    expect(
      screen.getByText("No hay casos de Tipo II registrados")
    ).toBeInTheDocument();
  });
});
