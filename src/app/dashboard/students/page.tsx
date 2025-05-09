// src/app/dashboard/students/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { StudentSearchList } from "@/components/students/StudentSearchList";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudentsList } from "@/lib/apiClient";
import type { Student } from "@/types/dashboard";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function StudentsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: studentsList = [],
    isLoading: listLoading,
    error: listError,
    isFetching: listIsFetching,
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
        student.id.toLowerCase().includes(lowerCaseQuery)
    );
  }, [studentsList, searchQuery]);

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
