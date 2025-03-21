"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Student, Infraction } from "@/types/dashboard"
import { getStudentTypeICount } from "@/lib/utils"

interface TopAlertsProps {
  students: Student[]
  infractions: Infraction[]
  onSelectStudent: (studentId: string) => void
}

export function TopAlerts({ students, infractions, onSelectStudent }: TopAlertsProps) {
  // Get students with alerts
  const studentsWithAlerts = students
    .map((student) => {
      const typeICount = getStudentTypeICount(student.id, infractions)
      return {
        ...student,
        typeICount,
        hasAlert: typeICount >= 3,
        alertType: typeICount >= 4 ? "secondary" : typeICount === 3 ? "primary" : null,
      }
    })
    .filter((student) => student.hasAlert)

  // Sort by alert severity (secondary first, then primary)
  // Then by number of Type I infractions (highest first)
  const sortedStudents = [...studentsWithAlerts].sort((a, b) => {
    if (a.alertType === "secondary" && b.alertType !== "secondary") return -1
    if (a.alertType !== "secondary" && b.alertType === "secondary") return 1
    return b.typeICount - a.typeICount
  })

  // Take top 5
  const topAlerts = sortedStudents.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top de Alertas</CardTitle>
        <CardDescription>Estudiantes con mayor número de faltas Tipo I</CardDescription>
      </CardHeader>
      <CardContent>
        {topAlerts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Faltas Tipo I</TableHead>
                <TableHead>Nivel de Alerta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAlerts.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.typeICount}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.alertType === "secondary"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {student.alertType === "secondary" ? "Secundaria" : "Primaria"}
                    </span>
                  </TableCell>
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

