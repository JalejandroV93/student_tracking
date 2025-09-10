"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, UserX, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { Student } from "@/types/dashboard";
import { StudentSearchListSkeleton } from "./StudentSearchList.skeleton";

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
function InfractionStatsDisplay({ stats }: { stats: Student['stats'] }) {
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
        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
          Tipo 2: {stats.tipoII}
        </Badge>
      )}
      {stats.tipoIII > 0 && (
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
          Tipo 3: {stats.tipoIII}
        </Badge>
      )}
      {stats.pending > 0 && (
        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
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
}

export function StudentSearchList({
  searchQuery,
  onSearchChange,
  students,
  onSelectStudent,
  isLoading,
  error,
  isFetching,
}: StudentSearchListProps) {
  if (isLoading) {
    return (
      <StudentSearchListSkeleton
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    );
  }

  return (
    <Card>
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
        </div>
        {isFetching && !isLoading && (
          <RefreshCw className="absolute right-2.5 top-3 h-4 w-4 text-muted-foreground animate-spin" />
        )}
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
              <ul className="divide-y">
                {students.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button" // Important for accessibility
                      className="w-full px-4 py-3 text-left hover:bg-muted cursor-pointer focus:outline-none focus:bg-muted"
                      onClick={() => onSelectStudent(student)}
                      title={`Seleccionar a ${student.name}`}
                    >
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {student.id}
                            {student.grado !== "No especificado" &&
                              ` | Grado: ${student.grado}`}
                          </p>
                        </div>
                        <InfractionStatsDisplay stats={student.stats} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
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
