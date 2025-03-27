// src/components/dashboard/Overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  AlertTriangle,
  FileWarning,
  Users,
  Activity,
  BellRing,
  CalendarDays,
} from "lucide-react";
import type { Student, AlertSettings } from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { AlertsWidget } from "@/components/alerts/AlertsWidget";
import { InfractionTrends } from "@/components/dashboard/InfractionTrends";
import { SectionOverview } from "@/components/dashboard/SectionOverview";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";
import { useMemo, useState, useEffect } from "react";
import { TrimestreSelector } from "./TrimestreSelector";
import { useInfractionsStore } from "@/stores/infractions.store";

interface OverviewProps {
  students: Student[];
  settings: AlertSettings;
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
  onSelectStudent: (studentId: string) => void;
}

export function Overview({
  students,
  getStudentAlertStatus,
  onSelectStudent,
}: OverviewProps) {
  const [currentTrimestre, setCurrentTrimestre] = useState<string>("all");
  const { infractions, fetchInfractions } = useInfractionsStore();

  useEffect(() => {
    fetchInfractions();
  }, [fetchInfractions]);

  // Calculate students with alerts using the passed function
  const studentsWithAlerts = useMemo(
    () => {
      return students
        .map((student) => ({
          ...student,
          alertStatus: getStudentAlertStatus(student.id),
        }))
        .filter((student) => student.alertStatus !== null);
    },
    [students, getStudentAlertStatus] // Dependencies include settings now
  );

  // Calculate statistics by section (Memoized for performance)
  const sectionStats = useMemo(() => {
    return Object.values(SECCIONES_ACADEMICAS).map((sectionName) => {
      // 1. Filter infractions by section and trimester
      const sectionInfractions = infractions.filter((inf) => {
        const matchesSection = inf.level === sectionName;
        const matchesTrimestre =
          currentTrimestre === "all" || inf.trimester === currentTrimestre;
        return matchesSection && matchesTrimestre;
      });

      // 2. Get unique students with infractions in this section
      const sectionStudentIds = new Set(
        sectionInfractions.map((inf) => inf.studentId)
      );
      const sectionStudents = students.filter((student) =>
        sectionStudentIds.has(student.id)
      );

      // 3. Count infractions by type
      const typeI = sectionInfractions.filter(
        (inf) => inf.type === "Tipo I"
      ).length;
      const typeII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo II"
      ).length;
      const typeIII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo III"
      ).length;

      // 4. Count alerts for students in this section
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
  }, [students, infractions, getStudentAlertStatus, currentTrimestre]);

  // Filter infractions by trimester
  const filteredInfractions = useMemo(() => {
    if (currentTrimestre === "all") return infractions;
    return infractions.filter((inf) => inf.trimester === currentTrimestre);
  }, [infractions, currentTrimestre]);

  const totalStudents = students.length;
  const totalInfractions = filteredInfractions.length;

  // Calculate filtered counts by type
  const filteredTypeICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo I"
  ).length;
  const filteredTypeIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo II"
  ).length;
  const filteredTypeIIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo III"
  ).length;

  return (
    <div className="space-y-6">
      {/* Trimestre Selector */}
      <div className="flex justify-end">
        <TrimestreSelector
          currentTrimestre={currentTrimestre}
          onTrimestreChange={setCurrentTrimestre}
        />
      </div>

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Faltas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInfractions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Activas
            </CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentsWithAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                studentsWithAlerts.filter(
                  (s) => s.alertStatus?.level === "critical"
                ).length
              }{" "}
              críticas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Abiertos (Tipo II)
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTypeIICounts}</div>
            <p className="text-xs text-muted-foreground">
              Faltas Tipo II registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Infraction Type Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo I
            </CardTitle>
            <FileWarning className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTypeICounts}</div>
            <p className="text-xs text-muted-foreground mt-1">Faltas leves</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo II
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTypeIICounts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo III
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredTypeIIICounts}</div>
            <p className="text-xs text-muted-foreground mt-1">Faltas graves</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets: Alerts and Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsWidget
          studentsWithAlerts={studentsWithAlerts} // Already calculated
          onSelectStudent={onSelectStudent}
        />
        <InfractionTrends infractions={infractions} />
      </div>

      {/* Section Summaries */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          Resumen por Secciones
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sectionStats.map((section) => (
            <SectionOverview key={section.name} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
