// src/app/dashboard/students/page.tsx
"use client";

import { StudentHistory } from "@/components/student-history";
import useDashboardStore from "@/lib/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const router = useRouter();
  const {
    students,
    infractions,
    followUps,
    addFollowUp,
    fetchData,
    loading,
    error,
  } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Historial de Estudiantes
        </h1>
      </div>
      <div className="text-sm text-muted-foreground">
        Mostrando historial para todas las secciones
      </div>

      <StudentHistory
        students={students}
        infractions={infractions}
        followUps={followUps}
        selectedStudentId={null}
        onSelectStudent={(studentId) => {
          if (studentId) {
            router.push(`/dashboard/students/${studentId}`);
          }
        }}
        addFollowUp={addFollowUp}
      />
    </div>
  );
}
