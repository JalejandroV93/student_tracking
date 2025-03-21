// src/app/dashboard/students/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import useDashboardStore from "@/lib/store";
import { useParams } from "next/navigation";
import { Student } from "@/types/dashboard";

interface StudentDetailsPageProps {
  params: { id: string }; // Get id from URL
}

export default function StudentDetailsPage({}: StudentDetailsPageProps) {
  const params = useParams();
  const { id } = params;
  const { students, infractions, followUps } = useDashboardStore();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (id) {
      const foundStudent = students.find((s) => s.id === id);
      setStudent(foundStudent || null);
    }
  }, [id, students]);

  if (!student) {
    return <div>Loading student details...</div>; // Or a not found message
  }

  // Get student infractions and follow-ups (similar to your existing logic)
  const studentInfractions = infractions.filter(
    (inf) => inf.studentId === student.id
  );
  const sortedInfractions = [...studentInfractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const getFollowUpsForInfraction = (infractionId: string) => {
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };
  return (
    <div className="container py-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{student.name}</CardTitle>
            <CardDescription>
              ID: {student.id} | Sección: {student.section}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sortedInfractions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Numeración</TableHead>
                  <TableHead>Seguimientos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInfractions.map((infraction) => {
                  const infractionFollowUps = getFollowUpsForInfraction(
                    infraction.id
                  );

                  return (
                    <TableRow key={infraction.id}>
                      <TableCell>{formatDate(infraction.date)}</TableCell>
                      <TableCell>Tipo {infraction.type}</TableCell>
                      <TableCell>{infraction.number}</TableCell>
                      <TableCell>
                        {infraction.type === "II" ? (
                          <div className="space-y-1">
                            {infractionFollowUps.length > 0 ? (
                              infractionFollowUps.map((followUp) => (
                                <div key={followUp.id} className="text-xs">
                                  <span className="font-medium">
                                    Seguimiento {followUp.followUpNumber}:
                                  </span>{" "}
                                  {formatDate(followUp.date)}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Sin seguimientos registrados
                              </span>
                            )}

                            {infractionFollowUps.length < 3 && (
                              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                Pendiente: {3 - infractionFollowUps.length}{" "}
                                seguimiento(s)
                              </div>
                            )}

                            {infractionFollowUps.length === 3 && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                Caso cerrado
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No aplica
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {infraction.type === "II" &&
                          infractionFollowUps.length < 3 && (
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Seguimiento
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Este estudiante no tiene faltas registradas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
