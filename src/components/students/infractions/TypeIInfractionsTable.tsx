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
import { CheckCircle, Circle, Loader2, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

import { formatDate, cn } from "@/lib/utils";
import { EmptyInfractionsState } from "./EmptyInfractionsState";
import type { TypeIInfractionTableProps } from "../types";

export function TypeIInfractionsTable({
  infractions,
  onToggleAttendedClick,
  onViewDetailsClick,
  loadingStates,
}: TypeIInfractionTableProps) {
  if (infractions.length === 0) {
    return (
      <EmptyInfractionsState message="No hay faltas Tipo I registradas." />
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
        {infractions.map((infraction) => {
          const isLoading = loadingStates[infraction.id] || false;

          return (
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
                      disabled={isLoading}
                      className={cn(
                        "hover:bg-transparent p-1 h-auto",
                        infraction.attended
                          ? "text-green-600 hover:text-green-700"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : infraction.attended ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
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
          );
        })}
      </TableBody>
    </Table>
  );
}
