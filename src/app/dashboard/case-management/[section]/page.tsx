// src/app/dashboard/case-management/[section]/page.tsx
"use client";
//Pendiente Refactorizar
import { CaseManagementList } from "@/components/case-management/CaseManagementList";
import useDashboardStore from "@/lib/store";
import { SectionSelector } from "@/components/shared/SectionSelector";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { NIVELES } from "@/lib/constantes";
import { CaseManagementListSkeleton } from "@/components/case-management/CaseManagementList.skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";

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

  const sectionTitle = getSectionTitle(section as string);

  if (loading) {
    return (
      <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
        <CaseManagementListSkeleton />
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-red-500">
          {error}
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <SectionSelector
            currentSection={section as string}
            baseRoute="dashboard/case-management"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando casos para {sectionTitle}
        </div>

        <CaseManagementList
          students={filteredStudents}
          infractions={infractions}
          followUps={followUps}
          onSelectStudent={handleSelectStudent}
        />
      </div>
    </ContentLayout>
  );
}
