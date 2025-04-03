// src/app/dashboard/students/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { StudentSearchList } from "@/components/students/StudentSearchList"; // Adjust path
import { useState, useMemo } from "react"; // Add useState, useMemo
import { useQuery } from "@tanstack/react-query";
import { fetchStudentsList } from "@/lib/apiClient";
import type { Student } from "@/types/dashboard";

export default function StudentsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(""); // Local state for search

  const {
    data: studentsList = [], // Default to empty array
    isLoading: listLoading,
    error: listError,
    isFetching: listIsFetching, // For background refresh indicator
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudentsList,
  });

  // Memoize filtering logic
 const filteredStudents = useMemo(() => {
   if (!studentsList) return [];
   const lowerCaseQuery = searchQuery.toLowerCase();
   if (!lowerCaseQuery) return studentsList;
   return studentsList.filter(
     (student) =>
       student.name.toLowerCase().includes(lowerCaseQuery) ||
       student.id.toLowerCase().includes(lowerCaseQuery) // Assuming ID is searchable string 'id-codigo'
   );
 }, [studentsList, searchQuery]);

  
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
        error={listError?.message ?? null}
        isFetching={listIsFetching}
      />

      {/* Note: StudentDetailCard is removed from this page. It belongs on the [id] page */}
    </div>
  );
}
