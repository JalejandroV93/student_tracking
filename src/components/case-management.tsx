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
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { formatDate, calculateExpectedFollowUpDates } from "@/lib/utils";

interface CaseManagementProps {
  students: Student[];
  infractions: Infraction[];
  followUps: FollowUp[];
  onSelectStudent: (studentId: string) => void;
}

export function CaseManagement({
  students,
  infractions,
  followUps,
  onSelectStudent,
}: CaseManagementProps) {
  // Get all Type II infractions
  const typeIIInfractions = infractions.filter((inf) => inf.type === "Tipo II");

  // Create case objects with follow-up information
  const cases = typeIIInfractions.map((infraction) => {
    const student = students.find(
      (s) => s.id.toString() === infraction.studentId
    );
    const caseFollowUps = followUps.filter(
      (f) => f.infractionId === infraction.id
    );
    const expectedDates = calculateExpectedFollowUpDates(infraction.date);

    // Determine case status
    const isComplete = caseFollowUps.length === 3;
    const status = isComplete ? "closed" : "open";

    // Calculate next follow-up information
    const nextFollowUpNumber = caseFollowUps.length + 1;
    const nextFollowUpDate =
      nextFollowUpNumber <= 3 ? expectedDates[nextFollowUpNumber - 1] : null;
    const isNextFollowUpOverdue = nextFollowUpDate
      ? new Date() > new Date(nextFollowUpDate)
      : false;

    return {
      id: infraction.id,
      studentId: infraction.studentId,
      studentName: student?.name || "Desconocido",
      studentSection: student?.grado || "",
      infractionDate: infraction.date,
      infractionNumber: infraction.number,
      followUps: caseFollowUps,
      expectedDates,
      status,
      isComplete,
      nextFollowUpNumber: nextFollowUpNumber <= 3 ? nextFollowUpNumber : null,
      nextFollowUpDate,
      isNextFollowUpOverdue,
    };
  });

  // Sort cases: open first (with overdue at the top), then closed
  const sortedCases = [...cases].sort((a, b) => {
    if (a.status === "open" && b.status === "closed") return -1;
    if (a.status === "closed" && b.status === "open") return 1;
    if (a.status === "open" && b.status === "open") {
      if (a.isNextFollowUpOverdue && !b.isNextFollowUpOverdue) return -1;
      if (!a.isNextFollowUpOverdue && b.isNextFollowUpOverdue) return 1;
      return (
        new Date(a.infractionDate).getTime() -
        new Date(b.infractionDate).getTime()
      );
    }
    return (
      new Date(b.infractionDate).getTime() -
      new Date(a.infractionDate).getTime()
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Casos</CardTitle>
        <CardDescription>
          Seguimiento de casos para faltas de Tipo II
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedCases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Fecha de Falta</TableHead>
                <TableHead>Numeración</TableHead>
                <TableHead>Seguimientos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próximo Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(caseItem.studentId)}
                >
                  <TableCell>{caseItem.studentName}</TableCell>
                  <TableCell>{caseItem.studentSection}</TableCell>
                  <TableCell>{formatDate(caseItem.infractionDate)}</TableCell>
                  <TableCell>Tipo II - {caseItem.infractionNumber}</TableCell>
                  <TableCell>{caseItem.followUps.length}/3</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        caseItem.status === "closed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {caseItem.nextFollowUpDate ? (
                      <div className="text-sm">
                        <div>Seguimiento {caseItem.nextFollowUpNumber}</div>
                        <div
                          className={`text-xs ${
                            caseItem.isNextFollowUpOverdue
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(caseItem.nextFollowUpDate)}
                          {caseItem.isNextFollowUpOverdue && " (Atrasado)"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Completado
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No hay casos de Tipo II registrados.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
