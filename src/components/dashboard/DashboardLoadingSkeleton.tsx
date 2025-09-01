// src/components/dashboard/DashboardLoadingSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BellRing,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Skeleton progresivo que se actualiza con animaciones
export function DashboardLoadingSkeleton() {
  const [loadingStage, setLoadingStage] = useState(0);

  // Progreso de carga simulado para mejor UX
  useEffect(() => {
    const stages = [0, 1, 2, 3];
    let currentStage = 0;

    const timer = setInterval(() => {
      currentStage = (currentStage + 1) % stages.length;
      setLoadingStage(currentStage);
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Indicador de progreso sutil */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((stage) => (
            <div
              key={stage}
              className={cn(
                "h-1 w-8 rounded-full transition-all duration-300",
                stage <= loadingStage ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Cargando datos del dashboard...
        </div>
      </div>

      {/* Selector de Trimestre - Mantener visible */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* KPI Cards con iconos reales y datos skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Faltas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes con Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BellRing className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-0">
            <div className="space-y-1">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-18" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Charts con skeletons más detallados */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencias de Infracciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Tendencias de Faltas por Mes
            </CardTitle>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Skeleton para gráfico de barras */}
              <div className="flex items-end justify-between h-48 px-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton
                      className={cn(
                        "w-8",
                        "h-" + [8, 12, 6, 16, 10, 14][i] || "h-10"
                      )}
                      style={{
                        height: `${[32, 48, 24, 64, 40, 56][i]}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              Alertas Recientes
            </CardTitle>
            <Skeleton className="h-4 w-32" />
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
      </div>

      {/* Sección Resumen por Secciones */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Secciones Académicas</CardTitle>
          <Skeleton className="h-4 w-56" />
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
    </div>
  );
}
