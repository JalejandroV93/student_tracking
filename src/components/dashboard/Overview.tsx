"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BellRing,
  CalendarDays,
  FileWarning,
  Users,
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
import { OverviewSkeleton } from "./Overview.skeleton";
import { useStudentsCount } from "@/hooks/use-students-count";
import { NumberTicker } from "@/components/magicui/number-ticker";

interface OverviewProps {
  students: Student[];
  settings: AlertSettings; // Keep settings prop if needed by getStudentAlertStatus
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
  onSelectStudent: (studentId: string) => void;
}

export function Overview({
  students,
  // settings, // settings might not be needed directly if getStudentAlertStatus gets it from its own store context
  getStudentAlertStatus,
  onSelectStudent,
}: OverviewProps) {
  const [currentTrimestre, setCurrentTrimestre] = useState<string>("all"); // Ensure it's string
  const {
    infractions,
    fetchInfractions,
    loading: infractionsLoading,
    error: infractionsError,
  } = useInfractionsStore(); // Get loading/error states

  // Obtener el conteo total de estudiantes
  const { data: totalStudentsCount = 0, isLoading: isLoadingStudentsCount } =
    useStudentsCount();

  useEffect(() => {
    fetchInfractions();
  }, [fetchInfractions]);

  // Filter infractions by trimester first - This is the core fix
  const filteredInfractions = useMemo(() => {
    if (infractionsLoading || infractionsError) return []; // Return empty if loading or error
    if (currentTrimestre === "all") {
      // console.log(`Filtering for 'all': ${infractions.length} total infractions`);
      return infractions;
    }
    // Ensure we compare string to string and handle potential null/empty strings from DB
    const filtered = infractions.filter((inf) => {
      // Mapeo de valores numéricos a nombres de trimestre
      const trimestreMap: Record<string, string> = {
        "1": "Primer Trimestre",
        "2": "Segundo Trimestre",
        "3": "Tercer Trimestre",
      };

      // Obtener el valor esperado del trimestre según lo seleccionado
      const valorEsperado = trimestreMap[currentTrimestre];

      // Comparar con el valor mapeado
      return inf.trimester === valorEsperado;
    });

    return filtered;
  }, [infractions, currentTrimestre, infractionsLoading, infractionsError]); // Add loading/error dependencies

  // Calculate students with alerts using the passed function (uses ALL infractions for calculation, not filtered ones)
  const studentsWithAlerts = useMemo(
    () => {
      if (infractionsLoading || infractionsError) return []; // Return empty if loading or error
      return (
        students
          .map((student) => ({
            ...student,
            // This function internally uses the *complete* infractions list from its store context (e.g., useAlertsStore)
            // or it should receive the complete list if not using a separate store.
            // Assuming getStudentAlertStatus correctly uses the full infraction list.
            alertStatus: getStudentAlertStatus(student.id),
          }))
          .filter((student) => student.alertStatus !== null)
          // Sort critical alerts first
          .sort((a, b) => {
            if (
              a.alertStatus?.level === "critical" &&
              b.alertStatus?.level !== "critical"
            )
              return -1;
            if (
              a.alertStatus?.level !== "critical" &&
              b.alertStatus?.level === "critical"
            )
              return 1;
            if (a.alertStatus && b.alertStatus)
              return b.alertStatus.count - a.alertStatus.count; // Higher count first
            return 0;
          })
      );
    },
    [students, getStudentAlertStatus, infractionsLoading, infractionsError] // Depends on students and the alert function logic (which implicitly depends on infractions/settings)
  );

  // Calculate statistics by section using the *filtered* infractions
  const sectionStats = useMemo(() => {
    // Base the calculation ONLY on the already filtered infractions for the selected trimester
    return Object.values(SECCIONES_ACADEMICAS).map((sectionName) => {
      // 1. Filter the *already trimester-filtered* infractions by section
      const sectionInfractions = filteredInfractions.filter(
        (inf) => inf.level === sectionName // `level` should match section names like "Elementary", "Middle School" etc.
      );

      // 2. Get unique students involved in these specific infractions
      const sectionStudentIds = new Set(
        sectionInfractions.map((inf) => inf.studentId)
      );
      const sectionStudents = students.filter((student) =>
        sectionStudentIds.has(student.id)
      );

      // 3. Count infractions by type within this filtered set
      const typeI = sectionInfractions.filter(
        (inf) => inf.type === "Tipo I"
      ).length;
      const typeII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo II"
      ).length;
      const typeIII = sectionInfractions.filter(
        (inf) => inf.type === "Tipo III"
      ).length;

      // 4. Count alerts for students active in this section *during this trimester*
      //    (This requires checking alerts based on *all* infractions for that student up to now)
      const alertsCount = sectionStudents.filter(
        (student) => getStudentAlertStatus(student.id) !== null
      ).length;

      return {
        name: sectionName,
        studentCount: sectionStudents.length, // Students with infractions in this section/trimester
        typeI,
        typeII,
        typeIII,
        total: typeI + typeII + typeIII,
        alertsCount, // Total active alerts for students involved in this section/trimester
      };
    });
  }, [students, filteredInfractions, getStudentAlertStatus]); // Use filteredInfractions here

  // Calculate overall stats based on filtered infractions
  const totalInfractions = filteredInfractions.length; // Use count from filtered list

  // Calculate filtered counts by type from the filtered list
  const filteredTypeICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo I"
  ).length;
  const filteredTypeIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo II"
  ).length;
  const filteredTypeIIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo III"
  ).length;

  // Handle Loading/Error State for Infractions
  if (infractionsLoading) {
    return (
      <div className="w-[900px]">
        <OverviewSkeleton />
      </div>
    );
  }

  if (infractionsError) {
    return (
      <div className="text-destructive">
        Error loading infractions: {infractionsError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trimestre Selector */}
      <div className="flex justify-end">
        <TrimestreSelector
          currentTrimestre={currentTrimestre}
          onTrimestreChange={setCurrentTrimestre}
        />
      </div>

      {/* Main KPI Cards - Use calculated stats based on filteredInfractions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-xl font-bold">
              {isLoadingStudentsCount ? (
                <span className="text-muted-foreground">Cargando...</span>
              ) : (
                <NumberTicker value={totalStudentsCount} />
              )}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Faltas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-xl font-bold">
              <NumberTicker value={totalInfractions} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <div className="text-xl font-bold">
                <NumberTicker value={studentsWithAlerts.length} />
              </div>
              <p className="text-xs text-muted-foreground">
                {
                  studentsWithAlerts.filter(
                    (s) => s.alertStatus?.level === "critical"
                  ).length
                }{" "}
                críticas
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellRing className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Casos Abiertos (Tipo II)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div>
              <div className="text-xl font-bold">
                <NumberTicker value={filteredTypeIICounts} />
              </div>
              <p className="text-xs text-muted-foreground">
                Faltas Tipo II en este período
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infraction Type Summary - Use counts from filteredInfractions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo I
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-2xl font-bold">
              <NumberTicker value={filteredTypeICounts} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileWarning className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo II
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-2xl font-bold">
              <NumberTicker value={filteredTypeIICounts} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo III
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-2xl font-bold">
              <NumberTicker value={filteredTypeIIICounts} />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets: Alerts and Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsWidget
          studentsWithAlerts={studentsWithAlerts}
          onSelectStudent={onSelectStudent}
        />
        <InfractionTrends infractions={infractions} />
      </div>

      {/* Section Summaries - Uses sectionStats which is derived from filteredInfractions */}
      <div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sectionStats.map((section) => (
            <SectionOverview key={section.name} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
