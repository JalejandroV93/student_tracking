// src/components/students/StudentDetailCard.tsx
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Use Badge for status
import { Plus, Info } from "lucide-react";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { formatDate } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // For showing details on hover

interface StudentDetailCardProps {
  student: Student;
  infractions: Infraction[]; // Expect sorted infractions
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void; // Callback to open dialog
}

export function StudentDetailCard({
  student,
  infractions,
  followUps,
  onAddFollowUpClick,
}: StudentDetailCardProps) {

  const getFollowUpsForInfraction = (infractionId: string) => {
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber); // Sort by number
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
            {/* Maybe add some action buttons here like "Edit Student" if needed */}
        </CardHeader>
        <CardContent>
            <h3 className="text-lg font-semibold mb-3 mt-2">Historial de Faltas</h3>
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
                    const isCaseClosed = infractionFollowUps.length === 3;
                    const canAddFollowUp = infraction.type === "Tipo II" && !isCaseClosed;

                    return (
                    <TableRow key={infraction.id}>
                        <TableCell>{formatDate(infraction.date)}</TableCell>
                        <TableCell>
                            <Badge variant={
                                infraction.type === 'Tipo I' ? 'secondary' :
                                infraction.type === 'Tipo II' ? 'warning' : // Custom variant needed
                                infraction.type === 'Tipo III' ? 'destructive' : 'outline'
                            }>
                                {infraction.type}
                            </Badge>
                        </TableCell>
                         <TableCell>{infraction.number}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help">{infraction.description || "-"}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="start">
                                    <p className="max-w-xs break-words">
                                        <strong>Descripción:</strong> {infraction.description || "N/A"} <br/>
                                        <strong>Detalles:</strong> {infraction.details || "N/A"} <br/>
                                        <strong>Acciones:</strong> {infraction.remedialActions || "N/A"} <br/>
                                        <strong>Autor:</strong> {infraction.author || "N/A"}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
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
                                            <strong>Fecha:</strong> {formatDate(followUp.date)} <br/>
                                            <strong>Autor:</strong> {followUp.author || "N/A"} <br/>
                                            <strong>Detalles:</strong> {followUp.details || "N/A"}
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
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600/50 py-0.5 px-1.5 text-[10px]">
                                Pendiente: {3 - infractionFollowUps.length}
                                </Badge>
                            )}

                            {isCaseClosed && (
                                <Badge variant="outline" className="text-green-600 border-green-600/50 py-0.5 px-1.5 text-[10px]">
                                Cerrado
                                </Badge>
                            )}
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                        </TableCell>
                        <TableCell className="text-right">
                        {canAddFollowUp && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddFollowUpClick(infraction)}
                                title="Agregar Seguimiento"
                            >
                                <Plus className="h-4 w-4" />
                                {/* <span className="sr-only">Agregar Seguimiento</span> */}
                            </Button>
                            )}
                            {/* Add button to view full infraction details? */}
                             {/* <Button
                                variant="ghost"
                                size="sm"
                                title="Ver Detalles de Falta"
                                className="ml-1"
                                // onClick={() => openInfractionDetailsModal(infraction)}
                            >
                                <Info className="h-4 w-4" />
                            </Button> */}
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
                 <Info className="w-8 h-8 mb-2"/>
                <span>Este estudiante no tiene faltas registradas.</span>
            </div>
            )}
        </CardContent>
        </Card>
     </TooltipProvider>
  );
}