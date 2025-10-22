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
import { FileText, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

import { formatDate } from "@/lib/utils";
import { EmptyInfractionsState } from "./EmptyInfractionsState";
import type { TypeIIIInfractionTableProps } from "../types";

export function TypeIIIInfractionsTable({
  infractions,
  onViewDetailsClick,
  onDeleteInfractionClick,
  userRole,
  loadingStates,
}: TypeIIIInfractionTableProps) {
  if (infractions.length === 0) {
    return (
      <EmptyInfractionsState message="No hay faltas Tipo III registradas." />
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
          const isLoading = loadingStates?.[infraction.id] || false;
          
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

              {/* Delete button - only show for ADMIN users */}
              {userRole === "ADMIN" && onDeleteInfractionClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteInfractionClick(infraction)}
                      disabled={isLoading}
                      className="p-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar Falta</p>
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
