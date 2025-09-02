// src/components/case-management/CaseManagementList.tsx
"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarCheck2 } from "lucide-react";
import type { CaseItem } from "@/stores/case-management.store";
import { CaseDetailsDialog } from "./CaseDetailsDialog";
import { CaseTableRow } from "./CaseTableRow";

interface CaseManagementListProps {
  cases: CaseItem[]; // Receive pre-calculated cases
  onSelectStudent: (studentId: string) => void;
}

export const CaseManagementList = React.memo(
  ({ cases, onSelectStudent }: CaseManagementListProps) => {
    // Estado para el diálogo de detalles
    const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
    const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false);

    // Abrir diálogo de detalles
    const handleOpenCaseDetails = useCallback(
      (caseItem: CaseItem, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevenir que se active el onClick de la fila
        setSelectedCase(caseItem);
        setIsCaseDetailsOpen(true);
      },
      []
    );

    const handleCloseDialog = useCallback((open: boolean) => {
      setIsCaseDetailsOpen(open);
      if (!open) {
        setSelectedCase(null);
      }
    }, []);

    return (
      <Card>
        <CardHeader>
          <CardDescription>
            Listado de faltas Tipo II y el estado de sus seguimientos
            requeridos. Los casos abiertos y atrasados aparecen primero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cases.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Fecha Falta</TableHead>
                    <TableHead className="text-center">Seguimientos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Próximo Seguimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <CaseTableRow
                      key={caseItem.id}
                      caseItem={caseItem}
                      onSelectStudent={onSelectStudent}
                      onOpenDetails={handleOpenCaseDetails}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
              <CalendarCheck2 className="w-10 h-10 mb-3" />
              <span>No hay casos de Tipo II registrados</span>
              <span className="text-xs mt-1">(según los filtros actuales)</span>
            </div>
          )}
        </CardContent>

        {/* Diálogo de detalles del caso */}
        <CaseDetailsDialog
          isOpen={isCaseDetailsOpen}
          onOpenChange={handleCloseDialog}
          caseItem={selectedCase}
        />
      </Card>
    );
  }
);

CaseManagementList.displayName = "CaseManagementList";
