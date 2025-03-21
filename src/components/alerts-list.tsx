// src/components/alerts-list.tsx 

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
import useDashboardStore from "@/lib/store"; // Import
import { getStudentTypeIICount } from "@/lib/utils";
import { Student, Infraction } from "@/types/dashboard";
interface AlertsListProps {
  onSelectStudent: (studentId: string) => void;
  students?: Student;
  infractions?: Infraction;
}

export function AlertsList({ onSelectStudent, students: propStudents, infractions: propInfractions }: AlertsListProps) {
  // Remove props
  const { students: storeStudents, infractions: storeInfractions, getStudentAlertStatus } = useDashboardStore(); // Get from store

  const students = propStudents ?? storeStudents;
  const infractions = propInfractions ?? storeInfractions;
  const studentsWithAlerts = Array.isArray(students) 
    ? students.map((student: Student) => {
        const alertStatus = getStudentAlertStatus(student.id);
        const typeIICount = getStudentTypeIICount(student.id, Array.isArray(infractions) ? infractions : [infractions].filter(Boolean));
        return {
          ...student,
        alertStatus,
        typeIICount
      }
    })
    .filter((student) => student.alertStatus !== null)
  : [];

  const sortedStudents = [...studentsWithAlerts].sort((a, b) => {
    if (a.alertStatus?.level === "critical" && b.alertStatus?.level !== "critical") return -1;
    if (a.alertStatus?.level !== "critical" && b.alertStatus?.level === "critical") return 1;
    return 0;
  });


  return (
    <Card>
    <CardHeader>
      <CardTitle>Estudiantes con Alertas Activas</CardTitle>
      <CardDescription>Listado completo de estudiantes que han acumulado faltas de Tipo I</CardDescription>
    </CardHeader>
    <CardContent>
      {sortedStudents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Faltas Tipo I</TableHead>
              <TableHead>Faltas Tipo II</TableHead> {/* Added Column */}
              <TableHead>Nivel de Alerta</TableHead>
              <TableHead>Sección</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow
                key={student.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectStudent(student.id)}
              >
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.alertStatus?.count}</TableCell>
                <TableCell>{student.typeIICount}</TableCell> {/* Display Type II Count */}
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      student.alertStatus?.level === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {student.alertStatus?.level === "critical" ? "Crítico" : "Advertencia"}
                  </span>
                </TableCell>
                <TableCell>{student.grado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
          No hay estudiantes con alertas activas.
        </div>
      )}
    </CardContent>
  </Card>
  );
}