// src/app/dashboard/case-management/[section]/page.tsx
"use client";

import { CaseManagement } from "@/components/case-management";
import useDashboardStore from "@/lib/store";
import { SectionSelector } from "@/components/section-selector";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { NIVELES } from "@/lib/constantes";

export default function CaseManagementSectionPage() {
  const router = useRouter();
  const params = useParams();
  const { section } = params;
  const { students, infractions, followUps, fetchData, loading, error } =
    useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const filteredStudents = section
    ? students.filter((student) => {
        const sectionMap: Record<string, readonly string[]> = {
          preschool: NIVELES["Preschool"],
          elementary: NIVELES["Elementary"],
          middle: NIVELES["Middle School"],
          high: NIVELES["High School"],
        };

        return sectionMap[section as keyof typeof sectionMap]?.includes(
          student.grado?.toLowerCase() || ""
        );
      })
    : students;

  const getSectionTitle = (section: string | null): string => {
    const titles: Record<string, string> = {
      preschool: "Preescolar",
      elementary: "Primaria",
      middle: "Secundaria",
      high: "Bachillerato",
    };
    return section
      ? titles[section] || "Todas las secciones"
      : "Todas las secciones";
  };

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
          Gestión de Casos - {getSectionTitle(section as string)}
        </h1>
        <SectionSelector
          currentSection={section as string}
          baseRoute="case-management"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando casos para {getSectionTitle(section as string)}
      </div>

      <CaseManagement
        students={filteredStudents}
        infractions={infractions}
        followUps={followUps}
        onSelectStudent={handleSelectStudent}
      />
    </div>
  );
}
