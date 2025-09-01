// src/app/dashboard/students/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { StudentSearchList } from "@/components/students/StudentSearchList";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentsList } from "@/lib/apiClient";
import type { Student } from "@/types/dashboard";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useDebounce } from "@/hooks/useDebounce";

export default function StudentsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    data: studentsList = [],
    isLoading: listLoading,
    error: listError,
    isFetching: listIsFetching,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudentsList,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is relatively stable
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });

  // Memoize filtering logic with debounced search query
  const filteredStudents = useMemo(() => {
    if (!studentsList) return [];
    const lowerCaseQuery = debouncedSearchQuery.toLowerCase().trim();
    if (!lowerCaseQuery) return studentsList;

    return studentsList.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerCaseQuery) ||
        student.id.toLowerCase().includes(lowerCaseQuery)
    );
  }, [studentsList, debouncedSearchQuery]);

  const handleSelectStudent = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  return (
    <ContentLayout title="Buscar Estudiantes">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Busca por nombre o ID para ver el historial de faltas y seguimientos.
        </p>

        <StudentSearchList
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          students={filteredStudents}
          onSelectStudent={handleSelectStudent}
          isLoading={listLoading}
          error={listError?.message ?? null}
          isFetching={listIsFetching}
        />
      </div>
    </ContentLayout>
  );
}
