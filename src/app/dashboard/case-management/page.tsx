// src/app/dashboard/case-management/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CaseManagementList } from "@/components/case-management/CaseManagementList"; // Adjust path
import { useCaseManagementStore } from "@/stores/case-management.store"; // Adjust path

export default function CaseManagementAllSectionsPage() {
  const router = useRouter();
  const {
    fetchCaseData,
    getCases,
    loading,
    error,
  } = useCaseManagementStore();

  useEffect(() => {
    fetchCaseData();
  }, [fetchCaseData]);

  // Get cases for all sections (pass undefined or null)
  const cases = getCases();

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };


  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <h1 className="text-3xl font-bold tracking-tight">Gestión de Casos (Tipo II)</h1>
         {/* Optional: Add SectionSelector here */}
       </div>
      <p className="text-sm text-muted-foreground">
         Seguimiento de faltas Tipo II para todas las secciones.
      </p>

      {loading && (
         <div className="flex items-center justify-center pt-10">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      )}

      {error && !loading && (
          <div className="text-destructive text-center pt-10">{error}</div>
      )}

      {!loading && !error && (
         <CaseManagementList
             cases={cases} // Pass the calculated cases
             onSelectStudent={handleSelectStudent}
         />
      )}
    </div>
  );
}