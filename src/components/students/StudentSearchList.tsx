// src/components/students/StudentSearchList.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Use ScrollArea for long lists
import { Search,  UserX, RefreshCw } from "lucide-react";
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
    return <StudentSearchListSkeleton />;
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
          <ScrollArea className="h-[400px] border rounded-md">
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
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.id} | Grado: {student.grado}
                      </p>
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
