import { Skeleton } from "@/components/ui/skeleton";
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

// Assume these exist or create simple versions
import { AlertsWidgetSkeleton } from "@/components/alerts/AlertsWidget.skeleton";
import { InfractionTrendsSkeleton } from "@/components/dashboard/InfractionTrends.skeleton";
import { SectionOverviewSkeleton } from "@/components/dashboard/SectionOverview.skeleton";

export function OverviewSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Trimestre Selector - Keep the actual selector visible */}
      <div className="flex justify-end">
        <div className="h-10 px-4 py-2 border rounded-md bg-background text-muted-foreground">
          Seleccionar Trimestre
        </div>
      </div>

      {/* Main KPI Cards - Show titles and icons, only skeleton for data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-xl font-bold">
              <Skeleton className="h-7 w-16" />
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
              <Skeleton className="h-7 w-16" />
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
                <Skeleton className="h-7 w-16" />
              </div>
              <div className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-24" />
              </div>
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
                <Skeleton className="h-7 w-16" />
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

      {/* Infraction Type Summary - Show actual titles and icons */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Faltas Tipo I
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="text-2xl font-bold">
              <Skeleton className="h-8 w-12" />
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
              <Skeleton className="h-8 w-12" />
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
              <Skeleton className="h-8 w-12" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets - Use the existing skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsWidgetSkeleton />
        <InfractionTrendsSkeleton />
      </div>

      {/* Section Summaries - Show a title and use the existing skeletons */}
      <div>
        <h3 className="text-lg font-medium mb-4">Resumen por Sección</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SectionOverviewSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
