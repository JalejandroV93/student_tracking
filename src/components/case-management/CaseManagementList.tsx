// src/components/case-management/CaseManagementList.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CaseItem } from "@/stores/case-management.store"; // Import the CaseItem type
import { formatDate } from "@/lib/utils";
import { CalendarClock, CalendarCheck2 } from "lucide-react"; // Icons for status

interface CaseManagementListProps {
  cases: CaseItem[]; // Receive pre-calculated cases
  onSelectStudent: (studentId: string) => void;
}

export function CaseManagementList({
  cases,
  onSelectStudent,
}: CaseManagementListProps) {
  // Cases are pre-calculated and sorted by the store/page

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Casos Activos y Cerrados</CardTitle> */}
        <CardDescription>
          Listado de faltas Tipo II y el estado de sus seguimientos requeridos. Los casos abiertos y atrasados aparecen primero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Fecha Falta</TableHead>
                {/* <TableHead>Numeración</TableHead> */}
                <TableHead className="text-center">Seguimientos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próximo Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(caseItem.studentId)}
                  title={`Ver detalles de ${caseItem.studentName}`}
                >
                  <TableCell className="font-medium">{caseItem.studentName}</TableCell>
                  <TableCell>{caseItem.studentGrade}</TableCell>
                  <TableCell>{formatDate(caseItem.infractionDate)}</TableCell>
                  {/* <TableCell>{caseItem.infractionNumber}</TableCell> */}
                  <TableCell className="text-center">
                     <Badge variant="outline">{caseItem.followUps.length}/3</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={caseItem.status === "closed" ? "success" : "warning"}> {/* Custom variants needed */}
                        {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {caseItem.nextFollowUpDate ? (
                      <div className="text-sm flex items-center space-x-2">
                         <CalendarClock className={`h-4 w-4 ${caseItem.isNextFollowUpOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                         <div>
                             <div className={`font-medium ${caseItem.isNextFollowUpOverdue ? "text-destructive" : ""}`}>
                                 {formatDate(caseItem.nextFollowUpDate)}
                             </div>
                            <div className="text-xs text-muted-foreground">
                                (Seguimiento {caseItem.nextFollowUpNumber})
                                {caseItem.isNextFollowUpOverdue && " - Atrasado"}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center space-x-2">
                           <CalendarCheck2 className="h-4 w-4 text-green-600"/>
                           <span>Completado</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
             <CalendarCheck2 className="w-10 h-10 mb-3"/>
             <span>No hay casos de Tipo II registrados</span>
             <span className="text-xs mt-1">(según los filtros actuales)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
