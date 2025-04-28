// src/components/case-management/CaseManagementList.tsx
"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CalendarCheck2, Eye, Calendar } from "lucide-react"; // Agregamos Eye icon
import type { CaseItem } from "@/stores/case-management.store"; // Import the CaseItem type
import { formatDate, cn } from "@/lib/utils";

// Componente para mostrar los detalles de los seguimientos de un caso
interface CaseDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseItem: CaseItem;
}

function CaseDetailsDialog({
  isOpen,
  onOpenChange,
  caseItem,
}: CaseDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Caso</DialogTitle>
          <DialogDescription>
            Seguimientos para la falta Tipo II de {caseItem.studentName} del{" "}
            {formatDate(caseItem.infractionDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del estudiante y del caso */}
          <div className="bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Información del Caso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Estudiante:</span>{" "}
                {caseItem.studentName}
              </div>
              <div>
                <span className="font-medium">Grado:</span>{" "}
                {caseItem.studentGrade}
              </div>
              <div>
                <span className="font-medium">Fecha de la falta:</span>{" "}
                {formatDate(caseItem.infractionDate)}
              </div>
              <div>
                <span className="font-medium">Estado:</span>{" "}
                <Badge
                  variant={caseItem.status === "closed" ? "success" : "warning"}
                  className="ml-1"
                >
                  {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Estado de seguimientos */}
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-4">Seguimientos Registrados</h4>

            {caseItem.followUps.length > 0 ? (
              <div className="space-y-4">
                {caseItem.followUps
                  .sort((a, b) => a.followUpNumber - b.followUpNumber)
                  .map((followUp) => (
                    <div
                      key={followUp.id}
                      className="border-l-2 pl-4 pb-6 relative"
                    >
                      {/* Círculo en la timeline */}
                      <div className="w-4 h-4 rounded-full bg-primary absolute -left-[9px] top-0"></div>

                      <div className="bg-card p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-start">
                          <h5 className="font-semibold">
                            Seguimiento {followUp.followUpNumber}
                          </h5>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(followUp.date)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">{followUp.details}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Registrado por: {followUp.author || "N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay seguimientos registrados para este caso.
              </div>
            )}
          </div>

          {/* Fechas esperadas */}
          <div>
            <h4 className="font-medium mb-2">
              Fechas Esperadas de Seguimiento
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {caseItem.expectedDates.map((date, index) => (
                <div
                  key={index}
                  className={cn(
                    "border rounded-md p-3 text-sm",
                    // Verificar si ya hay un seguimiento para esta fecha
                    caseItem.followUps.some(
                      (f) => f.followUpNumber === index + 1
                    )
                      ? "bg-green-50 border-green-200"
                      : "bg-muted/30"
                  )}
                >
                  <div className="font-medium">Seguimiento {index + 1}</div>
                  <div className="flex items-center mt-1">
                    {caseItem.followUps.some(
                      (f) => f.followUpNumber === index + 1
                    ) ? (
                      <>
                        <CalendarCheck2 className="h-3 w-3 mr-1 text-green-600" />
                        <span className="text-green-600">Completado</span>
                      </>
                    ) : (
                      <>
                        <CalendarClock className="h-3 w-3 mr-1 text-amber-600" />
                        <span>{formatDate(date)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CaseManagementListProps {
  cases: CaseItem[]; // Receive pre-calculated cases
  onSelectStudent: (studentId: string) => void;
}

export function CaseManagementList({
  cases,
  onSelectStudent,
}: CaseManagementListProps) {
  // Estado para el diálogo de detalles
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false);

  // Abrir diálogo de detalles
  const handleOpenCaseDetails = (caseItem: CaseItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se active el onClick de la fila
    setSelectedCase(caseItem);
    setIsCaseDetailsOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Casos Activos y Cerrados</CardTitle> */}
        <CardDescription>
          Listado de faltas Tipo II y el estado de sus seguimientos requeridos.
          Los casos abiertos y atrasados aparecen primero.
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
                <TableHead className="text-right">Acciones</TableHead>
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
                  <TableCell className="font-medium">
                    {caseItem.studentName}
                  </TableCell>
                  <TableCell>{caseItem.studentGrade}</TableCell>
                  <TableCell>{formatDate(caseItem.infractionDate)}</TableCell>
                  {/* <TableCell>{caseItem.infractionNumber}</TableCell> */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Badge variant="outline">
                        {caseItem.followUps.length}/3
                      </Badge>
                      {caseItem.followUps.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={(e) => handleOpenCaseDetails(caseItem, e)}
                          title="Ver seguimientos"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        caseItem.status === "closed" ? "success" : "warning"
                      }
                    >
                      {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {caseItem.nextFollowUpDate ? (
                      <div className="text-sm flex items-center space-x-2">
                        <CalendarClock
                          className={`h-4 w-4 ${
                            caseItem.isNextFollowUpOverdue
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div>
                          <div
                            className={`font-medium ${
                              caseItem.isNextFollowUpOverdue
                                ? "text-destructive"
                                : ""
                            }`}
                          >
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
                        <CalendarCheck2 className="h-4 w-4 text-green-600" />
                        <span>Completado</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleOpenCaseDetails(caseItem, e)}
                      title="Ver detalles completos"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Detalles</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
            <CalendarCheck2 className="w-10 h-10 mb-3" />
            <span>No hay casos de Tipo II registrados</span>
            <span className="text-xs mt-1">(según los filtros actuales)</span>
          </div>
        )}
      </CardContent>

      {/* Diálogo de detalles del caso */}
      {selectedCase && (
        <CaseDetailsDialog
          isOpen={isCaseDetailsOpen}
          onOpenChange={setIsCaseDetailsOpen}
          caseItem={selectedCase}
        />
      )}
    </Card>
  );
}
