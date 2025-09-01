"use client";

import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import type { ProcessingResult } from "@/types/csv-import";

interface UploadResultsProps {
  result: ProcessingResult;
}

export const UploadResults = React.memo(function UploadResults({
  result,
}: UploadResultsProps) {
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

  return (
    <div className="space-y-4">
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{result.totalRows}</div>
            <div className="text-sm text-gray-500">Total de filas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {result.processedRows}
            </div>
            <div className="text-sm text-gray-500">Procesadas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {result.errors.length}
            </div>
            <div className="text-sm text-gray-500">Errores</div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de resultado */}
      <Alert
        className={result.success ? "border-green-500" : "border-yellow-500"}
      >
        {result.success ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>

      {/* Duplicados encontrados */}
      {result.duplicates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">
                Duplicados Encontrados ({result.duplicates.length})
              </h3>
            </div>
            <div className="space-y-2">
              {result.duplicates.slice(0, 3).map((duplicate, index) => (
                <div
                  key={index}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <p className="text-sm font-medium">{duplicate.description}</p>
                  <p className="text-xs text-gray-500">
                    Hash: {duplicate.hash.substring(0, 16)}...
                  </p>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p>
                      Registro existente:{" "}
                      {formatDate(duplicate.existingRecord.fecha_creacion)}
                      {duplicate.existingRecord.ultimo_editor &&
                        ` - ${duplicate.existingRecord.ultimo_editor}`}
                    </p>
                    <p>
                      Nuevo registro:{" "}
                      {formatDate(duplicate.newRecord.fecha_creacion)}
                      {duplicate.newRecord.ultimo_editor &&
                        ` - ${duplicate.newRecord.ultimo_editor}`}
                    </p>
                  </div>
                </div>
              ))}
              {result.duplicates.length > 3 && (
                <p className="text-sm text-gray-500">
                  ... y {result.duplicates.length - 3} más
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errores */}
      {result.errors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <X className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">
                Errores de Procesamiento ({result.errors.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.errors.map((error, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 border border-red-200 rounded"
                >
                  <p className="text-sm font-medium text-red-800">
                    Fila {error.row}: {error.error}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
