"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import type { ProcessingResult } from "@/types/csv-import";

interface DuplicatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ProcessingResult | null;
  selectedDuplicates: Set<string>;
  onToggleSelection: (hash: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAction: (action: "ignore" | "update") => void;
}

export const DuplicatesDialog = React.memo(function DuplicatesDialog({
  open,
  onOpenChange,
  result,
  selectedDuplicates,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onAction,
}: DuplicatesDialogProps) {
  // Helper function to safely format dates
  const formatDate = useCallback(
    (dateValue: Date | string | null | undefined): string => {
      if (!dateValue) return "N/A";

      try {
        const date =
          dateValue instanceof Date ? dateValue : new Date(dateValue);
        return date.toLocaleDateString();
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Fecha inválida";
      }
    },
    []
  );

  if (!result?.duplicates || result.duplicates.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registros Duplicados Encontrados</DialogTitle>
          <DialogDescription>
            Se encontraron {result.duplicates.length} registros que ya existen
            en la base de datos. Selecciona los que deseas actualizar o ignora
            todos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={onClearSelection}>
              Limpiar selección
            </Button>
            <Badge variant="secondary">
              {selectedDuplicates.size} seleccionados
            </Badge>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.duplicates.map((duplicate) => (
              <div
                key={duplicate.hash}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedDuplicates.has(duplicate.hash)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => onToggleSelection(duplicate.hash)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {duplicate.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Registro existente:{" "}
                      {formatDate(duplicate.existingRecord.fecha_creacion)}
                      {duplicate.existingRecord.ultimo_editor &&
                        ` - ${duplicate.existingRecord.ultimo_editor}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Nuevo registro:{" "}
                      {formatDate(duplicate.newRecord.fecha_creacion)}
                      {duplicate.newRecord.ultimo_editor &&
                        ` - ${duplicate.newRecord.ultimo_editor}`}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border ${
                      selectedDuplicates.has(duplicate.hash)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedDuplicates.has(duplicate.hash) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onAction("ignore")}>
              Ignorar todos
            </Button>
            <Button
              onClick={() => onAction("update")}
              disabled={selectedDuplicates.size === 0}
            >
              Actualizar seleccionados ({selectedDuplicates.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
