"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity, // Keep one Activity
  AlertCircle,
  AlertTriangle,
  BellRing,
  CalendarDays,
  FileWarning,
  Users,
} from "lucide-react";

// Assuming Student type is defined elsewhere, e.g., in types/dashboard or similar
import type { Student } from "@/types/dashboard"; 
import type { AlertStatus } from "@/lib/utils";
import { AlertsWidget } from "@/components/alerts/AlertsWidget";
import { InfractionTrends } from "@/components/dashboard/InfractionTrends";
import { SectionOverview } from "@/components/dashboard/SectionOverview";
// SECCIONES_ACADEMICAS might not be needed if sectionStatsList provides all necessary info
// import { SECCIONES_ACADEMICAS } from "@/lib/constantes"; 
import { useMemo, useState, useEffect } from "react";
import { TrimestreSelector } from "./TrimestreSelector";
import { useInfractionsStore } from "@/stores/infractions.store";
import { OverviewSkeleton } from "./Overview.skeleton";
// useStudentsCount hook is removed as allStudentsCount is now a prop
import { NumberTicker } from "@/components/magicui/number-ticker";

// This should match the SectionStats from useDashboardData
export interface SectionStats { // Export if needed by parent, or keep local
  name: string;
  code: string;
  studentCount: number;
  typeI: number;
  typeII: number;
  typeIII: number;
  totalInfractions: number;
  alertsCount: number;
}

interface OverviewProps {
  studentsWithAlerts: Student[]; 
  sectionStatsList: SectionStats[];
  allStudentsCount: number;
  getStudentAlertStatus: (studentId: string) => AlertStatus | null; 
  onSelectStudent: (studentId: string) => void;
}

export function Overview({
  studentsWithAlerts,
  sectionStatsList,
  allStudentsCount,
  getStudentAlertStatus, 
  onSelectStudent,
}: OverviewProps) {
  const [currentTrimestre, setCurrentTrimestre] = useState<string>("all");
  const {
    infractions, 
    fetchInfractions,
    loading: infractionsLoading,
    error: infractionsError,
  } = useInfractionsStore();

  useEffect(() => {
    fetchInfractions(); 
  }, [fetchInfractions]);

  // Filter infractions by trimester first for KPI cards that depend on trimester
  const filteredInfractions = useMemo(() => {
    if (infractionsLoading || infractionsError) return [];
    if (currentTrimestre === "all") {
      return infractions;
    }
    const trimestreMap: Record<string, string> = {
      "1": "Primer Trimestre",
      "2": "Segundo Trimestre",
      "3": "Tercer Trimestre",
    };
    const valorEsperado = trimestreMap[currentTrimestre];
    return infractions.filter((inf) => inf.trimester === valorEsperado);
  }, [infractions, currentTrimestre, infractionsLoading, infractionsError]);

  // studentsWithAlerts is passed as a prop.
  // getStudentAlertStatus is passed as a prop.
  // sectionStatsList is passed as a prop.
  // allStudentsCount is passed as a prop.

  // Calculate overall stats based on filteredInfractions for KPI cards
  const totalInfractions = filteredInfractions.length;
  const filteredTypeICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo I"
  ).length;
  const filteredTypeIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo II"
  ).length;
  const filteredTypeIIICounts = filteredInfractions.filter(
    (inf) => inf.type === "Tipo III"
  ).length;

  // Handle Loading/Error State for Infractions (which impacts KPI cards)
  if (infractionsLoading) {
    return (
      <div className="w-full"> {/* Ensure skeleton takes full width */}
        <OverviewSkeleton />
      </div>
    );
  }

  if (infractionsError) {
    return (
      <div className="text-destructive">
        Error loading infraction data for KPIs: {infractionsError.toString()}
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

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-xl font-bold">
              {/* Assuming allStudentsCount comes directly as a number, not from a hook here */}
              <NumberTicker value={allStudentsCount} />
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

      {/* Section Summaries - Uses sectionStatsList prop */}
      <div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sectionStatsList.map((section) => (
            <SectionOverview key={section.code} section={section} /> 
            // Use section.code for key if name might not be unique, or section.name if it is.
            // Assuming code is unique per area.
          ))}
        </div>
      </div>
    </div>
  );
}
