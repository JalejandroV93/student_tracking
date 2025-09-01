"use client";

import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UploadStatus } from "@/hooks/useCSVUpload";

interface FileUploadAreaProps {
  tipoFalta: string;
  trimestreId: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadStatus: UploadStatus;
  onFileSelect: (file: File) => void;
}

export const FileUploadArea = React.memo(function FileUploadArea({
  tipoFalta,
  trimestreId,
  isUploading,
  uploadProgress,
  uploadStatus,
  onFileSelect,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar que se haya seleccionado el tipo de falta
      if (!tipoFalta) {
        toast.error(
          "Debe seleccionar el tipo de falta antes de cargar el archivo"
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validar que se haya seleccionado el trimestre
      if (!trimestreId) {
        toast.error("Debe seleccionar el trimestre antes de cargar el archivo");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validar que sea un archivo CSV
      if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
        toast.error("Por favor selecciona un archivo CSV válido");
        return;
      }

      // Si el archivo es muy grande (>5MB), mostrar advertencia
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande. Máximo 5MB permitido.");
        return;
      }

      onFileSelect(file);
    },
    [tipoFalta, trimestreId, onFileSelect]
  );

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">Selecciona un archivo CSV</p>
          <p className="text-sm text-gray-500">
            El archivo debe estar separado por punto y coma (;) y contener las
            columnas requeridas. Todas las faltas del archivo serán marcadas
            como {tipoFalta || "[Tipo no seleccionado]"} y asignadas al{" "}
            {trimestreId
              ? `trimestre seleccionado`
              : "[Trimestre no seleccionado]"}
            .
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !tipoFalta || !trimestreId}
          size="lg"
          className="mt-4"
        >
          {isUploading ? "Procesando..." : "Seleccionar archivo"}
        </Button>
        {(!tipoFalta || !trimestreId) && (
          <div className="text-sm text-red-500 mt-2 space-y-1">
            {!tipoFalta && <p>• Debes seleccionar el tipo de falta</p>}
            {!trimestreId && <p>• Debes seleccionar el trimestre</p>}
          </div>
        )}
      </div>

      {/* Indicador de progreso mejorado */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                {uploadStatus === "uploading" && "Subiendo archivo..."}
                {uploadStatus === "processing" && "Procesando datos..."}
                {uploadStatus === "completed" && "Completado"}
              </span>
            </div>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
          <div className="text-xs text-gray-400 space-y-1">
            {uploadStatus === "uploading" && (
              <p>• Transfiriendo archivo al servidor...</p>
            )}
            {uploadStatus === "processing" && (
              <>
                <p>• Validando formato del archivo...</p>
                <p>• Procesando registros de faltas...</p>
                <p>• Verificando duplicados...</p>
              </>
            )}
            {uploadStatus === "completed" && (
              <p>• Procesamiento completado exitosamente</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
