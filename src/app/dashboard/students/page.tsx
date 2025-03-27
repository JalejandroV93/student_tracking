// src/app/dashboard/students/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentSearchList } from "@/components/students/StudentSearchList"; // Adjust path
import { useStudentsStore } from "@/stores/students.store"; // Adjust path
import type { Student } from "@/types/dashboard";


export default function StudentsListPage() {
  const router = useRouter();
  const {
    
    filteredStudents,
    searchQuery,
    fetchStudentList,
    setSearchQuery,
    listLoading,
    listError,
    clearSelectedStudent, // Get the clear function
  } = useStudentsStore();

  useEffect(() => {
    // Fetch the list on mount
    fetchStudentList();
    // Ensure any previously selected student detail is cleared when navigating here
    clearSelectedStudent();
  }, [fetchStudentList, clearSelectedStudent]);

  const handleSelectStudent = (student: Student) => {
    // Navigate to the detail page when a student is selected from the list
    router.push(`/dashboard/students/${student.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Buscar Estudiantes
        </h1>
        {/* Add filters or other controls here if needed */}
      </div>
       <p className="text-sm text-muted-foreground">
         Busca por nombre o ID para ver el historial de faltas y seguimientos.
       </p>

      {/* Render the Search/List Component */}
      <StudentSearchList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        students={filteredStudents} // Pass the filtered list
        onSelectStudent={handleSelectStudent}
        isLoading={listLoading}
        error={listError}
      />

      {/* Note: StudentDetailCard is removed from this page. It belongs on the [id] page */}
    </div>
  );
}