import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CheckCircle, Circle, Eye, Info, Loader2, Plus } from "lucide-react";
import React, { useState } from "react";

import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { formatDate, cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Vista detallada de seguimientos
interface FollowUpDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction;
  followUps: FollowUp[];
  studentName: string;
}

function FollowUpDetailsDialog({
  isOpen,
  onOpenChange,
  infraction,
  followUps,
  studentName,
}: FollowUpDetailsDialogProps) {
  // Ordenar seguimientos por número
  const sortedFollowUps = [...followUps].sort(
    (a, b) => a.followUpNumber - b.followUpNumber
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Historial de Seguimientos</DialogTitle>
          <DialogDescription>
            Falta {infraction.type} - {infraction.number} de{" "}
            <strong>{studentName}</strong> del {formatDate(infraction.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información de la falta */}
          <div className="bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Detalles de la Falta</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Descripción:</span>{" "}
                {infraction.description || "N/A"}
              </div>
              <div>
                <span className="font-medium">Detalles:</span>{" "}
                {infraction.details || "N/A"}
              </div>
              <div>
                <span className="font-medium">Acciones remediales:</span>{" "}
                {infraction.remedialActions || "N/A"}
              </div>
              <div>
                <span className="font-medium">Registrado por:</span>{" "}
                {infraction.author || "N/A"}
              </div>
            </div>
          </div>

          {/* Timeline de seguimientos */}
          <div>
            <h4 className="font-medium mb-4">Cronología de Seguimientos</h4>
            {sortedFollowUps.length > 0 ? (
              <div className="space-y-4">
                {sortedFollowUps.map((followUp) => (
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
                No hay seguimientos registrados para esta falta.
              </div>
            )}
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

interface StudentDetailCardProps {
  student: Student;
  infractions: Infraction[]; // Expect sorted infractions
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void;
  onToggleAttendedClick: (infraction: Infraction) => void;
  isActionLoading: boolean;
}

export function StudentDetailCard({
  student,
  infractions,
  followUps,
  onAddFollowUpClick,
  onToggleAttendedClick,
  isActionLoading,
}: StudentDetailCardProps) {
  // Estado para manejar el diálogo de detalles
  const [selectedInfractionForDetails, setSelectedInfractionForDetails] =
    useState<Infraction | null>(null);
  const [isFollowUpDetailsOpen, setIsFollowUpDetailsOpen] = useState(false);

  const getFollowUpsForInfraction = (infractionId: string) => {
    // Filtramos por el ID de infracción y ordenamos por el número de seguimiento
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };

  // Abrir diálogo de detalles
  const handleOpenDetailsDialog = (infraction: Infraction) => {
    setSelectedInfractionForDetails(infraction);
    setIsFollowUpDetailsOpen(true);
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <CardDescription>
              ID: {student.id} | Grado: {student.grado} | Nivel: {student.level}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3 mt-2">
            Historial de Faltas
          </h3>
          {infractions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Num.</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Seguimientos (Tipo II)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {infractions.map((infraction) => {
                  const infractionFollowUps = getFollowUpsForInfraction(
                    infraction.id
                  );

                  // Encontramos qué números de seguimiento ya existen (1, 2 o 3)
                  const existingFollowUpNumbers = new Set(
                    infractionFollowUps.map((f) => f.followUpNumber)
                  );

                  // Calculamos cuáles faltan (para Tipo II se necesitan 3)
                  const pendingFollowUpCount =
                    infraction.type === "Tipo II"
                      ? 3 - existingFollowUpNumbers.size
                      : 0;

                  const isCaseClosed =
                    infraction.type === "Tipo II" && pendingFollowUpCount === 0;

                  const canAddFollowUp =
                    infraction.type === "Tipo II" && !isCaseClosed;

                  return (
                    <TableRow
                      key={infraction.id}
                      className={cn(
                        infraction.attended && "opacity-60 bg-muted/30"
                      )} // Style attended rows
                    >
                      <TableCell>{formatDate(infraction.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            infraction.type === "Tipo I"
                              ? "secondary"
                              : infraction.type === "Tipo II"
                              ? "warning"
                              : infraction.type === "Tipo III"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {infraction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{infraction.number}</TableCell>
                      <TableCell
                        className={cn(
                          "max-w-[200px] truncate",
                          infraction.attended && "line-through"
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {infraction.description || "-"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            <p className="max-w-xs break-words">
                              <strong>Descripción:</strong>{" "}
                              {infraction.description || "N/A"} <br />
                              <strong>Detalles:</strong>{" "}
                              {infraction.details || "N/A"} <br />
                              <strong>Acciones:</strong>{" "}
                              {infraction.remedialActions || "N/A"} <br />
                              <strong>Autor:</strong>{" "}
                              {infraction.author || "N/A"} <br />
                              <strong>Estado:</strong>{" "}
                              {infraction.attended ? "Atendida" : "Pendiente"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {infraction.type === "Tipo II" ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="mr-2">
                                {infractionFollowUps.length}/3
                              </Badge>

                              {isCaseClosed ? (
                                <Badge
                                  variant="success"
                                  className="py-0.5 px-1.5 text-[10px]"
                                >
                                  Cerrado
                                </Badge>
                              ) : (
                                <Badge
                                  variant="warning"
                                  className="py-0.5 px-1.5 text-[10px]"
                                >
                                  Pendiente: {pendingFollowUpCount}
                                </Badge>
                              )}
                            </div>

                            {infractionFollowUps.length > 0 ? (
                              <div className="space-y-1">
                                {/* Mostrar el último seguimiento con más detalles */}
                                {infractionFollowUps.length > 0 && (
                                  <div
                                    className="text-xs p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                                    onClick={() =>
                                      handleOpenDetailsDialog(infraction)
                                    }
                                  >
                                    <div className="font-medium mb-1 flex justify-between">
                                      <span>
                                        Último seguimiento (
                                        {
                                          infractionFollowUps[
                                            infractionFollowUps.length - 1
                                          ].followUpNumber
                                        }
                                        )
                                      </span>
                                      <span>
                                        {formatDate(
                                          infractionFollowUps[
                                            infractionFollowUps.length - 1
                                          ].date
                                        )}
                                      </span>
                                    </div>
                                    <p className="truncate text-muted-foreground">
                                      {
                                        infractionFollowUps[
                                          infractionFollowUps.length - 1
                                        ].details
                                      }
                                    </p>
                                  </div>
                                )}

                                {/* Botón para ver todos los seguimientos */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-xs h-7 mt-1"
                                  onClick={() =>
                                    handleOpenDetailsDialog(infraction)
                                  }
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver todos los seguimientos
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Sin seguimientos
                              </span>
                            )}
                          </div>
                        ) : infraction.type === "Tipo I" ? (
                          <Badge
                            variant={
                              infraction.attended ? "outline" : "secondary"
                            }
                            className={cn(
                              infraction.attended
                                ? "text-green-600 border-green-600/50"
                                : "text-gray-500",
                              "py-0.5 px-1.5 text-[10px]"
                            )}
                          >
                            {infraction.attended ? "Atendida" : "Pendiente"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {infraction.type === "Tipo II" && (
                          <div>
                            {isCaseClosed ? (
                              <Badge variant="success">Cerrado</Badge>
                            ) : (
                              <Badge variant="warning">Abierto</Badge>
                            )}
                          </div>
                        )}
                        {infraction.type !== "Tipo II" && (
                          <Badge
                            variant={
                              infraction.attended ? "outline" : "secondary"
                            }
                            className={
                              infraction.attended
                                ? "text-green-600 border-green-600/50"
                                : ""
                            }
                          >
                            {infraction.attended ? "Atendida" : "Pendiente"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {infraction.type === "Tipo I" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost" // Use ghost for less emphasis
                                size="sm"
                                onClick={() =>
                                  onToggleAttendedClick(infraction)
                                }
                                disabled={isActionLoading} // Disable while loading
                                className={cn(
                                  "hover:bg-transparent p-1 h-auto",
                                  infraction.attended
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-gray-500 hover:text-gray-700"
                                )}
                              >
                                {isActionLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {!isActionLoading &&
                                  (infraction.attended ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  ))}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {infraction.attended
                                  ? "Marcar como Pendiente"
                                  : "Marcar como Atendida"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {infraction.type === "Tipo II" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenDetailsDialog(infraction)
                                }
                                title="Ver Seguimientos"
                                className="mr-1"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver Historial de Seguimientos</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {canAddFollowUp && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddFollowUpClick(infraction)}
                                title="Agregar Seguimiento"
                                disabled={isActionLoading}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Agregar Seguimiento</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
              <Info className="w-8 h-8 mb-2" />
              <span>Este estudiante no tiene faltas registradas.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de detalles de seguimiento */}
      {selectedInfractionForDetails && (
        <FollowUpDetailsDialog
          isOpen={isFollowUpDetailsOpen}
          onOpenChange={setIsFollowUpDetailsOpen}
          infraction={selectedInfractionForDetails}
          followUps={getFollowUpsForInfraction(selectedInfractionForDetails.id)}
          studentName={student.name}
        />
      )}
    </TooltipProvider>
  );
}
