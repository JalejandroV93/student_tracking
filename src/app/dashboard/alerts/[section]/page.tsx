"use client";

import { AlertsList } from "@/components/alerts-list";
import useDashboardStore from "@/lib/store";
import { SectionSelector } from "@/components/section-selector";
import { useParams, useRouter } from "next/navigation";
import { NIVELES } from "@/lib/constantes";

export default function AlertsSectionPage() {
  const router = useRouter();
  const params = useParams();
  const { section } = params;
  const { students } = useDashboardStore();

  // Function to handle student selection
  const handleSelectStudent = (studentId: string) => {
    // Navigate to the student's details page
    router.push(`/dashboard/students/${studentId}`);
  };

  // Filtrar estudiantes por sección
  const filteredStudents = section
    ? students.filter((student) => {
        // Mapear las secciones a los valores de la propiedad grado
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

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Alertas - {getSectionTitle(section as string)}
        </h1>
        <SectionSelector
          currentSection={section as string}
          baseRoute="alerts"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando alertas para {getSectionTitle(section as string)}
      </div>

      <AlertsList
        onSelectStudent={handleSelectStudent}
        students={filteredStudents}
      />
    </div>
  );
}
