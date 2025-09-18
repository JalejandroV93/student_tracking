"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  UserX,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import type { Student } from "@/types/dashboard";
import { StudentSearchListSkeleton } from "./StudentSearchList.skeleton";
import { useCallback, useRef } from "react";
import { getSectionColor, getSectionBadgeColor } from "@/lib/constantes";

interface StudentSearchListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  students: Student[]; // The list to display (already filtered)
  onSelectStudent: (student: Student) => void;
  isLoading: boolean;
  error: string | null;
  isFetching: boolean;
}

// Componente para mostrar las estadísticas de faltas
function InfractionStatsDisplay({ stats }: { stats: Student["stats"] }) {
  if (!stats) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      <Badge variant="secondary" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Total: {stats.total}
      </Badge>
      {stats.tipoI > 0 && (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
          Tipo 1: {stats.tipoI}
        </Badge>
      )}
      {stats.tipoII > 0 && (
        <Badge
          variant="outline"
          className="text-xs bg-yellow-50 text-yellow-700"
        >
          Tipo 2: {stats.tipoII}
        </Badge>
      )}
      {stats.tipoIII > 0 && (
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
          Tipo 3: {stats.tipoIII}
        </Badge>
      )}
      {stats.pending > 0 && (
        <Badge
          variant="outline"
          className="text-xs bg-orange-50 text-orange-700"
        >
          <Clock className="w-3 h-3 mr-1" />
          Pendientes: {stats.pending}
        </Badge>
      )}
      {stats.attended > 0 && (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Atendidas: {stats.attended}
        </Badge>
      )}
    </div>
  );
}

interface StudentSearchListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  students: Student[]; // The list to display (already filtered)
  onSelectStudent: (student: Student) => void;
  isLoading: boolean;
  error: string | null;
  isFetching: boolean;
  // Propiedades para infinite scroll
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export function StudentSearchList({
  searchQuery,
  onSearchChange,
  students,
  onSelectStudent,
  isLoading,
  error,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: StudentSearchListProps) {
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  // Debug: Log para verificar los datos del estudiante
  if (students.length > 0) {
    console.log("StudentSearchList - Sample student data:", {
      student: students[0],
      level: students[0].seccion,
      photoUrl: students[0].photoUrl,
      seccion: students[0].seccion,
    });
  }

  // Callback ref para el último elemento de la lista
  const lastElementRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasNextPage &&
            !isFetching &&
            fetchNextPage
          ) {
            fetchNextPage();
          }
        },
        {
          // Configuración mejorada para mejor detección
          rootMargin: "100px", // Cargar cuando esté a 100px del final
          threshold: 0.1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, isFetching, fetchNextPage, isFetchingNextPage]
  );

  if (isLoading) {
    return (
      <StudentSearchListSkeleton
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    );
  }

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o ID..."
            className="pl-8 w-full" // Take full width
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar estudiante"
          />
          {isFetching && !isFetchingNextPage && (
            <RefreshCw className="absolute right-2.5 top-3 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex justify-center items-center h-40 text-destructive">
            {error}
          </div>
        )}
        {!isLoading && !error && (
          <ScrollArea className="h-[calc(700px-1rem)] border rounded-md">
            {students.length > 0 ? (
              <>
                <ul className="divide-y">
                  {students.map((student, index) => {
                    // Si es el último elemento y hay más páginas, agregar ref para infinite scroll
                    const isLastElement = index === students.length - 1;

                    return (
                      <li
                        key={student.id}
                        ref={isLastElement ? lastElementRef : undefined}
                        className={`rounded-lg ${getSectionColor(
                          student.seccion || student.grado
                        )} hover:shadow-md transition-shadow`}
                      >
                        <button
                          type="button" // Important for accessibility
                          className="w-full px-4 py-3 text-left hover:bg-muted cursor-pointer focus:outline-none focus:bg-muted rounded-lg"
                          onClick={() => onSelectStudent(student)}
                          title={`Seleccionar a ${student.name}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Avatar del estudiante */}
                                <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                  <AvatarImage
                                    src={
                                      student.photoUrl ||
                                      `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=3b82f6,6366f1,8b5cf6,06b6d4,10b981&textColor=ffffff`
                                    }
                                    alt={student.name}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                    {student.name
                                      .split(" ")
                                      .map((name) => name.charAt(0))
                                      .join("")
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {student.id}
                                    {student.grado !== "No especificado" &&
                                      ` | Grado: ${student.grado}`}
                                    {student.seccion &&
                                      ` | Sección: ${student.seccion}`}
                                  </p>
                                </div>
                              </div>
                              {/* Mostrar badge con sección o nivel */}
                              {student.seccion !== "No especificado" && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getSectionBadgeColor(
                                    student.seccion || student.grado
                                  )}`}
                                >
                                  {student.seccion}
                                </Badge>
                              )}
                            </div>
                            <InfractionStatsDisplay stats={student.stats} />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Indicador de carga mejorado para infinite scroll */}
                {isFetchingNextPage && (
                  <div className="px-4 py-3 space-y-2 border-t">
                    <div className="flex items-center gap-3">
                      {/* Skeleton del avatar */}
                      <Skeleton className="w-12 h-12 rounded-full" />

                      <div className="flex-1 space-y-2">
                        {/* Skeleton del nombre */}
                        <Skeleton className="h-5 w-3/4" />
                        {/* Skeleton de los detalles */}
                        <Skeleton className="h-4 w-1/2" />
                      </div>

                      {/* Skeleton del badge */}
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    {/* Skeleton de las estadísticas de faltas */}
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-18 rounded-full" />
                    </div>

                    {/* Indicador de carga sutil */}
                    <div className="flex justify-center items-center pt-2">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Cargando más estudiantes...
                      </span>
                    </div>
                  </div>
                )}

                {/* Mensaje cuando ya no hay más elementos */}
                {!hasNextPage && students.length > 0 && (
                  <div className="flex justify-center items-center py-4">
                    <span className="text-sm text-muted-foreground">
                      No hay más estudiantes para mostrar
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <UserX className="w-10 h-10 mb-3" />
                {searchQuery
                  ? `No se encontraron estudiantes para "${searchQuery}"`
                  : "No hay estudiantes registrados o la lista está vacía."}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
