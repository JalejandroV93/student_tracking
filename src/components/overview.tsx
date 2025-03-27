// src/components/overview.tsx (CORRECTED)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, FileWarning } from "lucide-react";
import type { Student, Infraction } from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { AlertsWidget } from "@/components/alerts-widget";
import { InfractionTrends } from "@/components/infraction-trends";
import { SectionOverview } from "@/components/section-overview";
import { getSectionCategory, SECCIONES_ACADEMICAS } from "@/lib/constantes"; // Import

interface OverviewProps {
  typeICounts: number;
  typeIICounts: number;
  typeIIICounts: number;
  students: Student[];
  infractions: Infraction[];
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
  onSelectStudent: (studentId: string) => void;
}

export function Overview({
  typeICounts,
  typeIICounts,
  typeIIICounts,
  students,
  infractions,
  getStudentAlertStatus,
  onSelectStudent,
}: OverviewProps) {
  // Get students with alerts (no change)
  const studentsWithAlerts = students
    .map((student) => {
      const alertStatus = getStudentAlertStatus(student.id);
      return {
        ...student,
        alertStatus,
      };
    })
    .filter((student) => student.alertStatus !== null);

  // Calculate statistics by section (CORRECTED)
  // Calculate statistics by section
  const sectionStats = Object.keys(SECCIONES_ACADEMICAS).map((sectionKey) => {
    const sectionName =
      SECCIONES_ACADEMICAS[sectionKey as keyof typeof SECCIONES_ACADEMICAS];
    // 1. Filter students by section category
    const sectionStudents = students.filter(
      (student) => getSectionCategory(student.grado) === sectionName
    );

    // 2. Filter infractions based on those *filtered students*
    const sectionInfractions = infractions.filter((inf) =>
      sectionStudents.some((student) => student.id === inf.studentId)
    );

    // 3. Count infractions by type (no change)
    const typeI = sectionInfractions.filter((inf) => inf.type === "I").length;
    const typeII = sectionInfractions.filter((inf) => inf.type === "II").length;
    const typeIII = sectionInfractions.filter(
      (inf) => inf.type === "III"
    ).length;

    // 4. Count alerts for students in this section (no change)
    const alertsCount = sectionStudents.filter(
      (student) => getStudentAlertStatus(student.id) !== null
    ).length;

    return {
      name: sectionName,
      studentCount: sectionStudents.length,
      typeI,
      typeII,
      typeIII,
      total: typeI + typeII + typeIII,
      alertsCount,
    };
  });

  // Rest of the component remains the same
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo I</CardTitle>
            <FileWarning className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Faltas leves registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo II</CardTitle>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeIICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Faltas moderadas con seguimiento
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo III</CardTitle>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeIIICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Faltas graves registradas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AlertsWidget
          studentsWithAlerts={studentsWithAlerts}
          onSelectStudent={onSelectStudent}
        />

        <InfractionTrends infractions={infractions} />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Resumen por Secciones</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {sectionStats.map((section) => (
          <SectionOverview key={section.name} section={section} />
        ))}
      </div>
    </div>
  );
}
