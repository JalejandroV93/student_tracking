// src/app/dashboard/case-management/[section]/page.tsx
"use client";

import { CaseManagementList } from "@/components/case-management/CaseManagementList";
import { useCaseManagementStore } from "@/stores/case-management.store";
import { SectionSelector } from "@/components/shared/SectionSelector";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CaseManagementListSkeleton } from "@/components/case-management/CaseManagementList.skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { getSectionTitle } from "@/lib/utils";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";


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


  const sectionTitle = getSectionTitle(section as string);

  if (loading) {
    return (
      <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
        <BreadcrumbNav />
        <CaseManagementListSkeleton />
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
        <BreadcrumbNav />
        <div className="flex items-center justify-center h-[calc(100vh-250px)] text-red-500">
          {error}
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Gestión de Casos - ${sectionTitle}`}>
      <BreadcrumbNav />
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
