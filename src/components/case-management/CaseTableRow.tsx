// src/components/case-management/CaseTableRow.tsx
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CalendarCheck2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CaseItem } from "@/stores/case-management.store";

interface CaseTableRowProps {
  caseItem: CaseItem;
  onSelectStudent: (studentId: string) => void;
  onOpenDetails: (caseItem: CaseItem, e: React.MouseEvent) => void;
}

export const CaseTableRow = React.memo(
  ({ caseItem, onSelectStudent, onOpenDetails }: CaseTableRowProps) => {
    const handleRowClick = React.useCallback(() => {
      onSelectStudent(caseItem.studentId);
    }, [caseItem.studentId, onSelectStudent]);

    const handleDetailsClick = React.useCallback(
      (e: React.MouseEvent) => {
        onOpenDetails(caseItem, e);
      },
      [caseItem, onOpenDetails]
    );

    return (
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={handleRowClick}
        title={`Ver detalles de ${caseItem.studentName}`}
      >
        <TableCell className="font-medium">{caseItem.studentName}</TableCell>
        <TableCell>{caseItem.studentGrade}</TableCell>
        <TableCell>{formatDate(caseItem.infractionDate)}</TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <Badge variant="outline">{caseItem.followUps.length}/3</Badge>
            {caseItem.followUps.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={handleDetailsClick}
                title="Ver seguimientos"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={caseItem.status === "closed" ? "success" : "warning"}>
            {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
          </Badge>
        </TableCell>
        <TableCell>
          {caseItem.nextFollowUpDate ? (
            <div className="text-sm flex items-center space-x-2">
              <CalendarClock
                className={`h-4 w-4 flex-shrink-0 ${
                  caseItem.isNextFollowUpOverdue
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              />
              <div className="min-w-0">
                <div
                  className={`font-medium truncate ${
                    caseItem.isNextFollowUpOverdue ? "text-destructive" : ""
                  }`}
                >
                  {formatDate(caseItem.nextFollowUpDate)}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  (Seguimiento {caseItem.nextFollowUpNumber})
                  {caseItem.isNextFollowUpOverdue && " - Atrasado"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground flex items-center space-x-2">
              <CalendarCheck2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Completado</span>
            </div>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDetailsClick}
            title="Ver detalles completos"
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Detalles</span>
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

CaseTableRow.displayName = "CaseTableRow";
