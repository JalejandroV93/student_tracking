// src/app/dashboard/case-management/[section]/page.tsx
"use client";

import { CaseManagementList } from "@/components/case-management/CaseManagementList";
import { useCaseManagementStore } from "@/stores/case-management.store";
import { SectionSelector } from "@/components/shared/SectionSelector";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CaseManagementListSkeleton } from "@/components/case-management/CaseManagementList.skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function CaseManagementSectionPage() {
  const router = useRouter();
  const params = useParams();
  const { section } = params;
  const { fetchCaseData, getCases, loading, error } = useCaseManagementStore();

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  // Conseguir los casos filtrados por sección usando el método del store
  const cases = getCases(section as string);

  const getSectionTitle = (section: string | null): string => {
    const titles: Record<string, string> = {
      preschool: "Preschool",
      elementary: "Elementary",
      middle: "Middle School",
      high: "High School",
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
          cases={cases}
          onSelectStudent={handleSelectStudent}
        />
      </div>
    </ContentLayout>
  );
}
