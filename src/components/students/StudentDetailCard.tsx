// src/components/students/StudentDetailCard.tsx
import React from "react"; // Import React for potential fragment usage
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
import { Badge } from "@/components/ui/badge";
import { Plus, Info, Circle, CheckCircle, Loader2 } from "lucide-react"; // Add icons
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { formatDate, cn } from "@/lib/utils"; // Import cn
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStudentsStore } from "@/stores/students.store"; // Import the store

interface StudentDetailCardProps {
  student: Student;
  infractions: Infraction[]; // Expect sorted infractions
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void;
}

export function StudentDetailCard({
  student,
  infractions,
  followUps,
  onAddFollowUpClick,
}: StudentDetailCardProps) {
  // Get the action and loading state from the store
  const toggleInfractionAttended = useStudentsStore(
    (state) => state.toggleInfractionAttended
  );
  const detailLoading = useStudentsStore((state) => state.detailLoading);

  const getFollowUpsForInfraction = (infractionId: string) => {
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };

  // Handler for the attend button
  const handleToggleAttended = async (infraction: Infraction) => {
    await toggleInfractionAttended(infraction.id, infraction.attended);
    // Potentially trigger a refetch of alerts data here if the store action doesn't
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {infractions.map((infraction) => {
                  const infractionFollowUps = getFollowUpsForInfraction(
                    infraction.id
                  );
                  const isCaseClosed =
                    infraction.type === "Tipo II" &&
                    infractionFollowUps.length === 3;
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
                          {/* TooltipContent remains the same */}
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
                      {/* Follow-up cell remains largely the same */}
                      <TableCell>
                        {infraction.type === "Tipo II" ? (
                          <div className="space-y-1">
                            {infractionFollowUps.length > 0 ? (
                              infractionFollowUps.map((followUp) => (
                                <Tooltip key={followUp.id}>
                                  <TooltipTrigger asChild>
                                    <div className="text-xs cursor-help">
                                      <span className="font-medium">
                                        {followUp.followUpNumber}:
                                      </span>{" "}
                                      {formatDate(followUp.date)}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="start">
                                    <p className="max-w-xs break-words">
                                      <strong>Fecha:</strong>{" "}
                                      {formatDate(followUp.date)} <br />
                                      <strong>Autor:</strong>{" "}
                                      {followUp.author || "N/A"} <br />
                                      <strong>Detalles:</strong>{" "}
                                      {followUp.details || "N/A"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Sin seguimientos
                              </span>
                            )}

                            {!isCaseClosed && (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-600/50 py-0.5 px-1.5 text-[10px]"
                              >
                                Pendiente: {3 - infractionFollowUps.length}
                              </Badge>
                            )}

                            {isCaseClosed && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600/50 py-0.5 px-1.5 text-[10px]"
                              >
                                Cerrado
                              </Badge>
                            )}
                          </div>
                        ) : 
                        infraction.type === "Tipo I" ? (
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
                      <TableCell className="text-right space-x-1">
                        {infraction.type === "Tipo I" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost" // Use ghost for less emphasis
                                size="sm"
                                onClick={() => handleToggleAttended(infraction)}
                                disabled={detailLoading} // Disable while loading
                                className={cn(
                                  "hover:bg-transparent p-1 h-auto",
                                  infraction.attended
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-gray-500 hover:text-gray-700"
                                )}
                              >
                                {detailLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {!detailLoading &&
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

                        {canAddFollowUp && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddFollowUpClick(infraction)}
                                title="Agregar Seguimiento"
                                disabled={detailLoading}
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
            // No infractions message remains the same
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
              <Info className="w-8 h-8 mb-2" />
              <span>Este estudiante no tiene faltas registradas.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
