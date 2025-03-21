"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Student } from "@/types/dashboard"
import type { AlertStatus } from "@/lib/utils"

interface AlertsWidgetProps {
  studentsWithAlerts: (Student & { alertStatus: AlertStatus | null })[]
  onSelectStudent: (studentId: string) => void
}

export function AlertsWidget({ studentsWithAlerts, onSelectStudent }: AlertsWidgetProps) {
  // Sort by alert level (critical first, then warning)
  const sortedStudents = [...studentsWithAlerts]
    .filter((student) => student.alertStatus !== null)
    .sort((a, b) => {
      if (a.alertStatus?.level === "critical" && b.alertStatus?.level !== "critical") return -1
      if (a.alertStatus?.level !== "critical" && b.alertStatus?.level === "critical") return 1
      return 0
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Activas</CardTitle>
        <CardDescription>Estudiantes que requieren atención inmediata</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedStudents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Faltas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.slice(0, 5).map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
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
                  <TableCell>{student.alertStatus?.count}</TableCell>
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
  )
}

