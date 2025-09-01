import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Calendar,
  CheckCircle,
  Circle,
  Eye,
  Info,
  Loader2,
  Plus,
  FileText,
} from "lucide-react";
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
import { InfractionDetailsModal } from "./InfractionDetailsModal";

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

// Componente para tabla de Faltas Tipo I
interface TypeIInfractionsTableProps {
  infractions: Infraction[];
  onToggleAttendedClick: (infraction: Infraction) => void;
  onViewDetailsClick: (infraction: Infraction) => void;
  isActionLoading: boolean;
}

function TypeIInfractionsTable({
  infractions,
  onToggleAttendedClick,
  onViewDetailsClick,
  isActionLoading,
}: TypeIInfractionsTableProps) {
  if (infractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground border rounded-md">
        <Info className="w-6 h-6 mb-2" />
        <span className="text-sm">No hay faltas Tipo I registradas.</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Num.</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {infractions.map((infraction) => (
          <TableRow
            key={infraction.id}
            className={cn(infraction.attended && "opacity-60 bg-muted/30")}
          >
            <TableCell>{formatDate(infraction.date)}</TableCell>
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
                    <strong>Detalles:</strong> {infraction.details || "N/A"}{" "}
                    <br />
                    <strong>Autor:</strong> {infraction.author || "N/A"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Badge
                variant={infraction.attended ? "outline" : "secondary"}
                className={
                  infraction.attended
                    ? "text-green-600 border-green-600/50"
                    : ""
                }
              >
                {infraction.attended ? "Atendida" : "Pendiente"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetailsClick(infraction)}
                    className="p-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver Detalles Completos</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleAttendedClick(infraction)}
                    disabled={isActionLoading}
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Componente para tabla de Faltas Tipo II
interface TypeIIInfractionsTableProps {
  infractions: Infraction[];
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void;
  onViewDetailsClick: (infraction: Infraction) => void;
  onViewFollowUpsClick: (infraction: Infraction) => void;
  isActionLoading: boolean;
}

function TypeIIInfractionsTable({
  infractions,
  followUps,
  onAddFollowUpClick,
  onViewDetailsClick,
  onViewFollowUpsClick,
  isActionLoading,
}: TypeIIInfractionsTableProps) {
  const getFollowUpsForInfraction = (infractionId: string) => {
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };

  if (infractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground border rounded-md">
        <Info className="w-6 h-6 mb-2" />
        <span className="text-sm">No hay faltas Tipo II registradas.</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Num.</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Seguimientos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {infractions.map((infraction) => {
          const infractionFollowUps = getFollowUpsForInfraction(infraction.id);
          const existingFollowUpNumbers = new Set(
            infractionFollowUps.map((f) => f.followUpNumber)
          );
          const pendingFollowUpCount = 3 - existingFollowUpNumbers.size;
          const isCaseClosed = pendingFollowUpCount === 0;
          const canAddFollowUp = !isCaseClosed;

          return (
            <TableRow key={infraction.id}>
              <TableCell>{formatDate(infraction.date)}</TableCell>
              <TableCell>{infraction.number}</TableCell>
              <TableCell className="max-w-[200px] truncate">
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
                      <strong>Detalles:</strong> {infraction.details || "N/A"}{" "}
                      <br />
                      <strong>Autor:</strong> {infraction.author || "N/A"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
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
                      <div
                        className="text-xs p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                        onClick={() => onViewFollowUpsClick(infraction)}
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
                            infractionFollowUps[infractionFollowUps.length - 1]
                              .details
                          }
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-7 mt-1"
                        onClick={() => onViewFollowUpsClick(infraction)}
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
              </TableCell>
              <TableCell>
                {isCaseClosed ? (
                  <Badge variant="success">Cerrado</Badge>
                ) : (
                  <Badge variant="warning">Abierto</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetailsClick(infraction)}
                      className="p-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver Detalles Completos</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewFollowUpsClick(infraction)}
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
  );
}

// Componente para tabla de Faltas Tipo III
interface TypeIIIInfractionsTableProps {
  infractions: Infraction[];
  onViewDetailsClick: (infraction: Infraction) => void;
}

function TypeIIIInfractionsTable({
  infractions,
  onViewDetailsClick,
}: TypeIIIInfractionsTableProps) {
  if (infractions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground border rounded-md">
        <Info className="w-6 h-6 mb-2" />
        <span className="text-sm">No hay faltas Tipo III registradas.</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Num.</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {infractions.map((infraction) => (
          <TableRow key={infraction.id}>
            <TableCell>{formatDate(infraction.date)}</TableCell>
            <TableCell>{infraction.number}</TableCell>
            <TableCell className="max-w-[200px] truncate">
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
                    <strong>Detalles:</strong> {infraction.details || "N/A"}{" "}
                    <br />
                    <strong>Autor:</strong> {infraction.author || "N/A"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Badge variant="destructive">Grave</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetailsClick(infraction)}
                    className="p-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver Detalles Completos</p>
                </TooltipContent>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
  // Estados para manejar los diálogos
  const [selectedInfractionForDetails, setSelectedInfractionForDetails] =
    useState<Infraction | null>(null);
  const [isFollowUpDetailsOpen, setIsFollowUpDetailsOpen] = useState(false);
  const [isInfractionDetailsModalOpen, setIsInfractionDetailsModalOpen] =
    useState(false);
  const [selectedInfractionForModal, setSelectedInfractionForModal] =
    useState<Infraction | null>(null);

  // Separar infracciones por tipo
  const typeIInfractions = infractions.filter((inf) => inf.type === "Tipo I");
  const typeIIInfractions = infractions.filter((inf) => inf.type === "Tipo II");
  const typeIIIInfractions = infractions.filter(
    (inf) => inf.type === "Tipo III"
  );

  const getFollowUpsForInfraction = (infractionId: string) => {
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };

  // Handlers para los diálogos
  const handleOpenDetailsDialog = (infraction: Infraction) => {
    setSelectedInfractionForDetails(infraction);
    setIsFollowUpDetailsOpen(true);
  };

  const handleOpenInfractionDetailsModal = (infraction: Infraction) => {
    setSelectedInfractionForModal(infraction);
    setIsInfractionDetailsModalOpen(true);
  };

  const hasInfractions = infractions.length > 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">{student.name}</CardTitle>
            <CardDescription>
              ID: {student.id}
              {(student.grado !== "No especificado" ||
                student.level !== "No especificado") && (
                <>
                  {student.grado !== "No especificado" &&
                    ` | Grado: ${student.grado}`}
                  {student.level !== "No especificado" &&
                    ` | Nivel: ${student.level}`}
                </>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {!hasInfractions ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
                <Info className="w-8 h-8 mb-2" />
                <span>Este estudiante no tiene faltas registradas.</span>
              </div>
            ) : (
              <>
                {/* Faltas Tipo I */}
                {typeIInfractions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="px-3 py-1">
                        Faltas Tipo I
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({typeIInfractions.length} registro
                        {typeIInfractions.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <TypeIInfractionsTable
                      infractions={typeIInfractions}
                      onToggleAttendedClick={onToggleAttendedClick}
                      onViewDetailsClick={handleOpenInfractionDetailsModal}
                      isActionLoading={isActionLoading}
                    />
                  </div>
                )}

                {/* Faltas Tipo II */}
                {typeIIInfractions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="warning" className="px-3 py-1">
                        Faltas Tipo II
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({typeIIInfractions.length} registro
                        {typeIIInfractions.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <TypeIIInfractionsTable
                      infractions={typeIIInfractions}
                      followUps={followUps}
                      onAddFollowUpClick={onAddFollowUpClick}
                      onViewDetailsClick={handleOpenInfractionDetailsModal}
                      onViewFollowUpsClick={handleOpenDetailsDialog}
                      isActionLoading={isActionLoading}
                    />
                  </div>
                )}

                {/* Faltas Tipo III */}
                {typeIIIInfractions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="destructive" className="px-3 py-1">
                        Faltas Tipo III
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({typeIIIInfractions.length} registro
                        {typeIIIInfractions.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <TypeIIIInfractionsTable
                      infractions={typeIIIInfractions}
                      onViewDetailsClick={handleOpenInfractionDetailsModal}
                    />
                  </div>
                )}

                {/* Mostrar mensaje si no hay infracciones de ningún tipo (edge case) */}
                {typeIInfractions.length === 0 &&
                  typeIIInfractions.length === 0 &&
                  typeIIIInfractions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="w-8 h-8 mb-2 mx-auto" />
                      <span>No se encontraron faltas con tipos válidos.</span>
                    </div>
                  )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles completos de la falta */}
      {selectedInfractionForModal && (
        <InfractionDetailsModal
          isOpen={isInfractionDetailsModalOpen}
          onOpenChange={setIsInfractionDetailsModalOpen}
          infraction={selectedInfractionForModal}
          student={student}
        />
      )}

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
