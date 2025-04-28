// src/components/alerts/AlertsWidget.tsx
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
  typeICount?: number;
  typeIICount?: number;
}

interface AlertsWidgetProps {
  studentsWithAlerts: StudentWithAlert[]; // Receive the filtered & calculated list
  onSelectStudent: (studentId: string) => void;
}

export function AlertsWidget({
  studentsWithAlerts,
  onSelectStudent,
}: AlertsWidgetProps) {
  // Data is already filtered and sorted (potentially by the store or parent component)
  // We just display the top N
  const topAlerts = studentsWithAlerts.slice(0, 5);
  console.log("Top Alerts:", topAlerts); // Debugging line to check the data being passed

  return (
    <Card className="h-full flex flex-col">
      {" "}
      {/* Ensure card takes full height if needed */}
      <CardHeader>
        <CardTitle>Alertas Activas Recientes</CardTitle>
        <CardDescription>
          Top 5 estudiantes que requieren atención
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {" "}
        {/* Allow content to grow */}
        {topAlerts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-center">Nivel</TableHead>
                <TableHead className="text-right">Faltas (Tipo I)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAlerts.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(student.id)}
                >
                  <TableCell className="font-medium py-2">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        // Use semibold
                        student.alertStatus?.level === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 ring-1 ring-inset ring-red-600/20" // Add ring
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20" // Add ring
                      }`}
                      title={`Nivel: ${student.alertStatus?.level}`} // Add title for accessibility
                    >
                      {student.alertStatus?.level === "critical"
                        ? "Crítico"
                        : "Alerta"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    {student.alertStatus?.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <span>No hay alertas activas.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
