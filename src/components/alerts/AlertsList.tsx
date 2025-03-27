// src/components/alerts/AlertsList.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";


// Expects pre-calculated students with alerts
interface StudentWithAlert extends Student {
  alertStatus: AlertStatus | null;
  typeIICount: number;
}

interface AlertsListProps {
  studentsWithAlerts: StudentWithAlert[]; // Receive the filtered & calculated list
  onSelectStudent: (studentId: string) => void;
}

export function AlertsList({ studentsWithAlerts, onSelectStudent }: AlertsListProps) {
  // Data is pre-filtered and pre-calculated by the store/page

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estudiantes con Alertas Activas</CardTitle>
        <CardDescription>
          Listado de estudiantes que han acumulado faltas Tipo I superando los umbrales definidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {studentsWithAlerts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {/* Consider removing ID if not essential for users */}
                {/* <TableHead>ID</TableHead> */}
                <TableHead>Nombre</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead className="text-center">Faltas Tipo I</TableHead>
                <TableHead className="text-center">Faltas Tipo II</TableHead>
                <TableHead className="text-center">Nivel Alerta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsWithAlerts.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(student.id)}
                  title={`Ver detalles de ${student.name}`} // Accessibility
                >
                  {/* <TableCell>{student.id}</TableCell> */}
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grado}</TableCell>
                  <TableCell className="text-center">{student.alertStatus?.count}</TableCell>
                  <TableCell className="text-center">{student.typeIICount}</TableCell>
                  <TableCell className="text-center">
                    {student.alertStatus && ( // Render only if alert exists
                       <span
                         className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${ // rounded-md looks better
                           student.alertStatus.level === "critical"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-inset ring-red-600/20"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20"
                         }`}
                       >
                         {student.alertStatus.level === "critical" ? "Crítico" : "Alerta"}
                       </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
             <AlertTriangle className="w-10 h-10 mb-3"/>
            <span>No hay estudiantes con alertas activas</span>
            <span className="text-xs mt-1">(según los filtros y umbrales actuales)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}