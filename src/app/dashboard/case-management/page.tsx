// src/app/dashboard/case-management/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CaseManagementList } from "@/components/case-management/CaseManagementList";
import { useCaseManagementStore } from "@/stores/case-management.store";
import { CaseManagementListSkeleton } from "@/components/case-management/CaseManagementList.skeleton";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function CaseManagementAllSectionsPage() {
  const router = useRouter();
  const { fetchCaseData, getCases, loading, error } = useCaseManagementStore();

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  // Get cases for all sections (pass undefined or null)
  const cases = getCases();

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  return (
    <ContentLayout title="Gestión de Casos (Tipo II)">
      <BreadcrumbNav />
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Seguimiento de faltas Tipo II para todas las secciones.
        </p>

        {loading && <CaseManagementListSkeleton />}

        {error && !loading && (
          <div className="text-destructive text-center pt-10">{error}</div>
        )}

        {!loading && !error && (
          <CaseManagementList
            cases={cases}
            onSelectStudent={handleSelectStudent}
          />
        )}
      </div>
    </ContentLayout>
  );
}
