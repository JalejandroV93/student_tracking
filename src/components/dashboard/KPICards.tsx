// src/components/dashboard/KPICards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Users, AlertCircle, BellRing, AlertTriangle } from "lucide-react";
import { Student, Infraction } from "@/types/dashboard";
import { AlertStatus } from "@/lib/utils";
import { useMemo } from "react";

interface KPICardsProps {
  students: Student[];
  infractions: Infraction[];
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
}

export function KPICards({
  students,
  infractions,
  getStudentAlertStatus,
}: KPICardsProps) {
  const kpiData = useMemo(() => {
    const totalStudents = students.length;
    const totalInfractions = infractions.length;

    const studentsWithAlerts = students.filter(
      (student) => getStudentAlertStatus(student.id) !== null
    );

    const criticalAlerts = students.filter(
      (student) => getStudentAlertStatus(student.id)?.level === "critical"
    );

    return {
      totalStudents,
      totalInfractions,
      studentsWithAlerts: studentsWithAlerts.length,
      criticalAlerts: criticalAlerts.length,
    };
  }, [students, infractions, getStudentAlertStatus]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-200 hover:shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              <NumberTicker value={kpiData.totalStudents} />
            </div>
            <p className="text-xs text-muted-foreground">estudiantes activos</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Faltas</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              <NumberTicker value={kpiData.totalInfractions} />
            </div>
            <p className="text-xs text-muted-foreground">faltas registradas</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Estudiantes con Alertas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              <NumberTicker value={kpiData.studentsWithAlerts} />
            </div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <BellRing className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-200 hover:shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Alertas Críticas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              <NumberTicker value={kpiData.criticalAlerts} />
            </div>
            <p className="text-xs text-muted-foreground">atención inmediata</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
