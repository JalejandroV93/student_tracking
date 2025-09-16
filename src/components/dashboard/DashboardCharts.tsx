// src/components/dashboard/DashboardCharts.tsx
"use client";

import { Activity, BellRing } from "lucide-react";
import { Student, Infraction } from "@/types/dashboard";
import { AlertStatus } from "@/lib/utils";
import { InfractionTrends } from "./InfractionTrends";
import { AlertsWidget } from "@/components/alerts/AlertsWidget";
import { DashboardSection } from "./DashboardSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardChartsProps {
  students: Student[];
  infractions: Infraction[];
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
  onSelectStudent: (studentId: string) => void;
  totalStudentsCount: number;
}

// Skeleton específico para gráficos
function ChartSkeleton({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Skeleton para eje Y y gráfico */}
          <div className="flex items-end justify-between h-48 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton
                  className="w-8"
                  style={{
                    height: `${[32, 48, 24, 64, 40, 56][i]}px`,
                  }}
                />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
          {/* Skeleton para leyenda */}
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  students,
  infractions,
  getStudentAlertStatus,
  onSelectStudent,
  totalStudentsCount,
}: DashboardChartsProps) {
  // Calcular estudiantes con alertas
  const studentsWithAlerts = students
    .map((student) => ({
      ...student,
      alertStatus: getStudentAlertStatus(student.id),
    }))
    .filter((student) => student.alertStatus !== null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Tendencias de Infracciones */}
      <DashboardSection
        title={`Tendencias de Faltas por Mes (${totalStudentsCount} estudiantes)`}
        icon={<Activity className="h-5 w-5 text-primary" />}
        fallback={
          <ChartSkeleton
            title="Tendencias de Faltas por Mes"
            icon={<Activity className="h-5 w-5 text-primary" />}
          />
        }
      >
        <InfractionTrends infractions={infractions} />
      </DashboardSection>

      {/* Widget de Alertas */}
      <DashboardSection
        title="Alertas Recientes"
        icon={<BellRing className="h-5 w-5 text-primary" />}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                Alertas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-md border"
                  >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <AlertsWidget
          studentsWithAlerts={studentsWithAlerts}
          onSelectStudent={onSelectStudent}
        />
      </DashboardSection>
    </div>
  );
}
