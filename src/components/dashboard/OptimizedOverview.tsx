// src/components/dashboard/OptimizedOverview.tsx
"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Student, Infraction } from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { KPICards } from "./KPICards";
import { DashboardCharts } from "./DashboardCharts";
import { SectionOverview } from "./SectionOverview";
import { TrimestreSelector } from "./TrimestreSelector";
import { DashboardSection } from "./DashboardSection";

import { SECCIONES_ACADEMICAS } from "@/lib/constantes";
import { useMemo, useState } from "react";

interface OptimizedOverviewProps {
  students: Student[];
  infractions: Infraction[];
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
  onSelectStudent: (studentId: string) => void;
  getTotalStudentsCount: () => number;
  getTotalStudentsByLevel: (level: string) => number;
  dashboardFilters?: {
    filters: {
      schoolYearId: string | null;
      trimestre: string;
    };
    setSchoolYear: (schoolYearId: string) => void;
    setTrimestre: (trimestre: string) => void;
  };
}

export function OptimizedOverview({
  students,
  infractions,
  getStudentAlertStatus,
  onSelectStudent,
  getTotalStudentsCount,
  getTotalStudentsByLevel,
  dashboardFilters,
}: OptimizedOverviewProps) {
  // Estado local para trimestre como fallback
  const [currentTrimestre, setCurrentTrimestre] = useState<string>("all");

  // Usar filtros globales si están disponibles
  const selectedTrimestre =
    dashboardFilters?.filters.trimestre || currentTrimestre;
  const handleTrimestreChange =
    dashboardFilters?.setTrimestre || setCurrentTrimestre;

  // Filtrar datos por trimestre seleccionado
  const filteredData = useMemo(() => {
    // Validar que students e infractions sean arrays, fallback a array vacío si no lo son
    const validatedStudents = Array.isArray(students) ? students : [];
    const validatedInfractions = Array.isArray(infractions) ? infractions : [];

    if (selectedTrimestre === "all") {
      return { students: validatedStudents, infractions: validatedInfractions };
    }

    const filteredInfractions = validatedInfractions.filter(
      (infraction) => infraction.trimester === selectedTrimestre
    );

    // Mantener todos los estudiantes activos, solo filtrar las infracciones
    // El total de estudiantes debe mostrar todos los estudiantes, no solo los que tienen infracciones
    return {
      students: validatedStudents, // Siempre mostrar todos los estudiantes activos
      infractions: filteredInfractions,
    };
  }, [students, infractions, selectedTrimestre]);

  // Calcular estadísticas por sección usando los datos filtrados
  const sectionStats = useMemo(() => {
    // Validar que students sea un array
    const validatedStudents = Array.isArray(students) ? students : [];

    return Object.values(SECCIONES_ACADEMICAS).map((sectionName) => {
      // Filtrar infracciones por sección y trimestre
      const sectionInfractions = filteredData.infractions.filter(
        (inf) => inf.level === sectionName
      );

      // Obtener estudiantes únicos de la sección con datos en el período
      const sectionStudentIds = new Set(
        sectionInfractions.map((inf) => inf.studentId)
      );

      // Contar todos los estudiantes activos de esta sección
      const allSectionStudents = validatedStudents.filter(
        (student) => student.seccion === sectionName
      );

      // Estudiantes con infracciones en el período
      const studentsWithInfractions = validatedStudents.filter(
        (student) =>
          sectionStudentIds.has(student.id) && student.seccion === sectionName
      );

      // Contar infracciones por tipo
      const typeI = sectionInfractions.filter(
        (inf) => inf.type === "Tipo I"
      ).length;
      const typeII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo II"
      ).length;
      const typeIII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo III"
      ).length;

      // Contar alertas para estudiantes activos en esta sección
      const alertsCount = allSectionStudents.filter(
        (student) => getStudentAlertStatus(student.id) !== null
      ).length;

      return {
        name: sectionName,
        studentCount:
          selectedTrimestre === "all"
            ? allSectionStudents.length
            : studentsWithInfractions.length,
        totalStudentsInSection: getTotalStudentsByLevel(sectionName), // Usar la función para obtener el total
        typeI,
        typeII,
        typeIII,
        total: typeI + typeII + typeIII,
        alertsCount,
      };
    });
  }, [
    students,
    filteredData.infractions,
    getStudentAlertStatus,
    selectedTrimestre,
    getTotalStudentsByLevel,
  ]);

  // Skeleton para KPI cards
  const KPISkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Skeleton para resumen de secciones
  const SectionsSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resumen por Secciones Académicas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md border space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 w-full">
      {/* Selector de Trimestre */}
      <div className="flex justify-end">
        <TrimestreSelector
          currentTrimestre={selectedTrimestre}
          onTrimestreChange={handleTrimestreChange}
          dashboardFilters={dashboardFilters}
        />
      </div>

      {/* KPI Cards con Suspense */}
      <Suspense fallback={<KPISkeleton />}>
        <KPICards
          students={filteredData.students}
          infractions={filteredData.infractions}
          getStudentAlertStatus={getStudentAlertStatus}
        />
      </Suspense>

      {/* Charts Section con Suspense */}
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        }
      >
        <DashboardCharts
          students={filteredData.students}
          infractions={filteredData.infractions}
          getStudentAlertStatus={getStudentAlertStatus}
          onSelectStudent={onSelectStudent}
          totalStudentsCount={getTotalStudentsCount()}
        />
      </Suspense>

      {/* Resumen por Secciones con Suspense */}
      <DashboardSection
        title="Resumen por Secciones Académicas"
        fallback={<SectionsSkeleton />}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sectionStats.map((section) => (
            <SectionOverview key={section.name} section={section} />
          ))}
        </div>
      </DashboardSection>
    </div>
  );
}
