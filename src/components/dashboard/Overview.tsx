// src/components/dashboard/Overview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, FileWarning, Users, Activity, BellRing, CalendarDays } from "lucide-react";
import type { Student, Infraction, AlertSettings } from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { AlertsWidget } from "@/components/alerts/AlertsWidget"; // Adjust path
import { InfractionTrends } from "@/components/dashboard/InfractionTrends"; // Adjust path
import { SectionOverview } from "@/components/dashboard/SectionOverview"; // Adjust path
import { getSectionCategory, SECCIONES_ACADEMICAS } from "@/lib/constantes";
import { useMemo } from "react";

interface OverviewProps {
  typeICounts: number;
  typeIICounts: number;
  typeIIICounts: number;
  students: Student[];
  infractions: Infraction[];
  settings: AlertSettings; // Receive settings
  getStudentAlertStatus: (studentId: string) => AlertStatus | null; // Receive function
  onSelectStudent: (studentId: string) => void;
}

export function Overview({
  typeICounts,
  typeIICounts,
  typeIIICounts,
  students,
  infractions,
  settings, // Use received settings
  getStudentAlertStatus, // Use received function
  onSelectStudent,
}: OverviewProps) {

  // Calculate students with alerts using the passed function
  const studentsWithAlerts = useMemo(() => {
     return students
        .map((student) => ({
            ...student,
            alertStatus: getStudentAlertStatus(student.id),
        }))
        .filter((student) => student.alertStatus !== null);
    }, [students, infractions, settings, getStudentAlertStatus] // Dependencies include settings now
  );


  // Calculate statistics by section (Memoized for performance)
  const sectionStats = useMemo(() => {
    return Object.values(SECCIONES_ACADEMICAS).map((sectionName) => {
      // 1. Filter students by section category
      const sectionStudents = students.filter(
        (student) => getSectionCategory(student.grado) === sectionName
      );
      const sectionStudentIds = new Set(sectionStudents.map(s => s.id));

      // 2. Filter infractions based on students in this section
      const sectionInfractions = infractions.filter((inf) =>
        sectionStudentIds.has(inf.studentId)
      );

      // 3. Count infractions by type
      const typeI = sectionInfractions.filter((inf) => inf.type === "Tipo I").length;
      const typeII = sectionInfractions.filter((inf) => inf.type === "Tipo II").length;
      const typeIII = sectionInfractions.filter((inf) => inf.type === "Tipo III").length;

      // 4. Count alerts for students in this section using the provided function
      const alertsCount = sectionStudents.filter(
        (student) => getStudentAlertStatus(student.id) !== null
      ).length;

      return {
        name: sectionName, // Use the constant value
        studentCount: sectionStudents.length,
        typeI,
        typeII,
        typeIII,
        total: typeI + typeII + typeIII,
        alertsCount,
      };
    });
   }, [students, infractions, settings, getStudentAlertStatus]); // Dependencies include settings

  const totalStudents = students.length;
  const totalInfractions = infractions.length;

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
             {/* <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p> */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Faltas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInfractions}</div>
            {/* <p className="text-xs text-muted-foreground">+10% desde el mes pasado</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithAlerts.length}</div>
             <p className="text-xs text-muted-foreground">
                {studentsWithAlerts.filter(s => s.alertStatus?.level === 'critical').length} críticas
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Casos Abiertos (Tipo II)</CardTitle>
             <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Calculate open cases count here if needed, or pass it down */}
            <div className="text-2xl font-bold">{typeIICounts}</div>
             <p className="text-xs text-muted-foreground">Faltas Tipo II registradas</p>
          </CardContent>
        </Card>
      </div>

        {/* Infraction Type Summary */}
       <div className="grid gap-4 md:grid-cols-3">
           <Card className="border-l-4 border-blue-500">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-base font-medium">Faltas Tipo I</CardTitle>
                   <FileWarning className="h-5 w-5 text-blue-500" />
               </CardHeader>
               <CardContent>
                   <div className="text-3xl font-bold">{typeICounts}</div>
                   <p className="text-xs text-muted-foreground mt-1">Faltas leves</p>
               </CardContent>
           </Card>
           <Card className="border-l-4 border-yellow-500">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-base font-medium">Faltas Tipo II</CardTitle>
                   <AlertTriangle className="h-5 w-5 text-yellow-500" />
               </CardHeader>
               <CardContent>
                   <div className="text-3xl font-bold">{typeIICounts}</div>
                   <p className="text-xs text-muted-foreground mt-1">Requieren seguimiento</p>
               </CardContent>
           </Card>
           <Card className="border-l-4 border-red-500">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-base font-medium">Faltas Tipo III</CardTitle>
                   <AlertCircle className="h-5 w-5 text-red-500" />
               </CardHeader>
               <CardContent>
                   <div className="text-3xl font-bold">{typeIIICounts}</div>
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
         <h2 className="text-2xl font-semibold tracking-tight mb-4">Resumen por Secciones</h2>
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
           {sectionStats.map((section) => (
             <SectionOverview key={section.name} section={section} />
           ))}
         </div>
      </div>
    </div>
  );
}