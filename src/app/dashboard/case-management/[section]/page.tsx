// src/app/dashboard/case-management/[section]/page.tsx
"use client";

import { CaseManagement } from "@/components/case-management";
import useDashboardStore from "@/lib/store";
import { SectionSelector } from "@/components/section-selector";
import { useParams } from "next/navigation";
import { useEffect } from "react";


export default function CaseManagementSectionPage() {
    const params = useParams();
    const { section } = params;
    const { students, infractions, followUps, fetchData, loading, error } =
        useDashboardStore();

     useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectStudent = (studentId: string) => {
        window.location.href = `/dashboard/students/${studentId}`;
    };

    const filteredStudents = section
        ? students.filter((student) => {
              const sectionMap: Record<string, string[]> = {
                  preschool: ["Preescolar"],
                  elementary: ["Primaria 5A", "Primaria 5B"],
                  middle: ["Secundaria 1A", "Secundaria 1B", "Secundaria 2A"],
                  high: ["Preparatoria"],
              };
              return sectionMap[section]?.includes(student.section);
          })
        : students;

    const filteredInfractions = section
        ? infractions.filter((inf) =>
              filteredStudents.some((student) => student.id === inf.studentId)
          )
        : infractions;

    const filteredFollowUps = section
        ? followUps.filter((followUp) =>
              filteredInfractions.some((inf) => inf.id === followUp.infractionId)
          )
        : followUps;

    const getSectionTitle = (section: string | null): string => {
        if (!section) return "Todas las secciones";
        const sectionTitles: Record<string, string> = {
            preschool: "Preescolar",
            elementary: "Primaria",
            middle: "Secundaria",
            high: "Preparatoria",
        };
        return sectionTitles[section] || "Todas las secciones";
    };

    const sectionTitle = getSectionTitle(section);

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
                    Gestión de Casos
                </h1>
                {section !== null && (
                    <SectionSelector
                        currentSection={section}
                        baseRoute="case-management"
                    />
                )}
            </div>
            <div className="text-sm text-muted-foreground">
                {section
                    ? `Mostrando casos para ${sectionTitle}`
                    : "Mostrando casos para todas las secciones"}
            </div>
            <CaseManagement
                students={filteredStudents}
                infractions={filteredInfractions}
                followUps={filteredFollowUps}
                onSelectStudent={handleSelectStudent}
            />
        </div>
    );
}