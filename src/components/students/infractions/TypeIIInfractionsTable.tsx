import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

import { formatDate } from "@/lib/utils";
import { EmptyInfractionsState } from "./EmptyInfractionsState";
import { getTypeIIInfractionStatus } from "../utils/infraction-utils";
import type { TypeIIInfractionTableProps } from "../types";
import { useAuth } from "@/components/providers/AuthProvider";

export function TypeIIInfractionsTable({
  infractions,
  followUps,
  onAddFollowUpClick,
  onViewDetailsClick,
  onViewFollowUpsClick,
  loadingStates,
}: TypeIIInfractionTableProps) {
  const { user } = useAuth();
  
  // Los directores de grupo (TEACHER) no pueden agregar seguimientos
  const canAddFollowUps = user?.role !== "TEACHER";

  if (infractions.length === 0) {
    return (
      <EmptyInfractionsState message="No hay faltas Tipo II registradas." />
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
          const isLoading = loadingStates[infraction.id] || false;
          const status = getTypeIIInfractionStatus(followUps, infraction.id);

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
                <div className="space-y-1">
                  {/* Contador de seguimientos y estado */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {status.completedCount}/3
                    </Badge>
                  </div>

                  {/* Último seguimiento si existe */}
                  {status.lastFollowUp ? (
                    <div
                      className="text-xs p-2 border rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewFollowUpsClick(infraction)}
                    >
                      <div className="font-medium mb-1 text-primary">
                        Último: Seg. {status.lastFollowUp.followUpNumber}
                      </div>
                      <div className="text-muted-foreground text-xs mb-1">
                        {formatDate(status.lastFollowUp.date)}
                      </div>
                      <p className="text-muted-foreground leading-tight max-h-8 overflow-hidden">
                        {status.lastFollowUp.details}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic p-2">
                      Sin seguimientos registrados
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {status.isCaseClosed ? (
                  <Badge variant="default" className="bg-green-600">
                    Cerrado
                  </Badge>
                ) : (
                  <Badge variant="secondary">Abierto</Badge>
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

                {status.canAddFollowUp && canAddFollowUps && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddFollowUpClick(infraction)}
                        title="Agregar Seguimiento"
                        disabled={isLoading}
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
