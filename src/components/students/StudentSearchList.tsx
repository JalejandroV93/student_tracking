// src/components/students/StudentSearchList.tsx
"use client";

import { Card, CardContent, CardHeader  } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Use ScrollArea for long lists
import { Search, Loader2, UserX } from "lucide-react";
import type { Student } from "@/types/dashboard";

interface StudentSearchListProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  students: Student[]; // The list to display (already filtered)
  onSelectStudent: (student: Student) => void;
  isLoading: boolean;
  error: string | null;
}

export function StudentSearchList({
  searchQuery,
  onSearchChange,
  students,
  onSelectStudent,
  isLoading,
  error,
}: StudentSearchListProps) {

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Buscar Estudiante</CardTitle> */}
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
        {/* <CardDescription>
          Ingrese nombre o ID para encontrar un estudiante.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex justify-center items-center h-40 text-destructive">
            {error}
          </div>
        )}
        {!isLoading && !error && (
          <ScrollArea className="h-[400px] border rounded-md"> {/* Set max height and scroll */}
            {students.length > 0 ? (
              <ul className="divide-y"> {/* Use divide for separation */}
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
                  : "No hay estudiantes para mostrar."}
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}