// src/app/dashboard/reports/[section]/page.tsx
"use client";

import { Reports } from "@/components/reports";
import useDashboardStore from "@/lib/store";
import { SectionSelector } from "@/components/section-selector";
import { useParams } from "next/navigation";
import { useEffect } from "react";


export default function ReportsSectionPage() {
    const params = useParams();
    const { section } = params;
    const { students, infractions, fetchData, loading, error } =
        useDashboardStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);


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
                <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                {section !== null && (
                    <SectionSelector
                        currentSection={section}
                        baseRoute="reports"
                    />
                )}
            </div>
            <div className="text-sm text-muted-foreground">
                {section
                    ? `Mostrando reportes para ${sectionTitle}`
                    : "Mostrando reportes para todas las secciones"}
            </div>
            <Reports students={filteredStudents} infractions={filteredInfractions} />
        </div>
    );
}