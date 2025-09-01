"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCSVUpload } from "@/hooks/useCSVUpload";
import { useTrimestres } from "@/hooks/useTrimestres";
import { useDuplicateHandling } from "@/hooks/useDuplicateHandling";
import { FaultTypeSelector } from "./FaultTypeSelector";
import { TrimestreSelector } from "./TrimestreSelector";
import { FileUploadArea } from "./FileUploadArea";
import { UploadResults } from "./UploadResults";
import { DuplicatesDialog } from "./DuplicatesDialog";
import type {
  ProcessingResult,
  DuplicateHandlingOptions,
} from "@/types/csv-import";

interface CSVUploaderProps {
  onUploadSuccess?: (result: ProcessingResult) => void;
  onUploadError?: (error: string) => void;
}

export function CSVUploader({
  onUploadSuccess,
  onUploadError,
}: CSVUploaderProps) {
  const [tipoFalta, setTipoFalta] = useState<string>("");
  const [trimestreId, setTrimestreId] = useState<string>("");
  const [isResetting, setIsResetting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Custom hooks
  const {
    isUploading,
    uploadResult,
    uploadProgress,
    uploadStatus,
    uploadFile,
    resetUpload,
  } = useCSVUpload();

  const { trimestresDisponibles, loadingTrimestres, loadTrimestres } =
    useTrimestres();

  const {
    showDuplicatesDialog,
    selectedDuplicates,
    openDuplicatesDialog,
    closeDuplicatesDialog,
    toggleDuplicateSelection,
    selectAllDuplicates,
    clearSelection,
  } = useDuplicateHandling();

  // Función para limpiar todos los estados y permitir una nueva subida
  const handleClearAndReset = useCallback(async () => {
    setIsResetting(true);

    resetUpload();
    setPendingFile(null);
    setTipoFalta("");
    setTrimestreId("");

    // Simular una pequeña pausa para la animación
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsResetting(false);

    toast.success("Formulario limpiado, listo para nueva subida");
  }, [resetUpload]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const result = await uploadFile(
        file,
        tipoFalta,
        trimestreId,
        undefined,
        onUploadSuccess,
        onUploadError
      );

      // Si hay duplicados y no se especificó cómo manejarlos, mostrar el diálogo
      if (result && result.duplicates.length > 0) {
        setPendingFile(file);
        openDuplicatesDialog();
      }
    },
    [
      uploadFile,
      tipoFalta,
      trimestreId,
      onUploadSuccess,
      onUploadError,
      openDuplicatesDialog,
    ]
  );

  const handleDuplicateAction = useCallback(
    async (action: "ignore" | "update") => {
      if (!pendingFile) return;

      const duplicateHandling: DuplicateHandlingOptions = {
        action,
        duplicateHashes:
          action === "update" ? Array.from(selectedDuplicates) : [],
      };

      closeDuplicatesDialog();
      setPendingFile(null);

      await uploadFile(
        pendingFile,
        tipoFalta,
        trimestreId,
        duplicateHandling,
        onUploadSuccess,
        onUploadError
      );
    },
    [
      pendingFile,
      selectedDuplicates,
      closeDuplicatesDialog,
      uploadFile,
      tipoFalta,
      trimestreId,
      onUploadSuccess,
      onUploadError,
    ]
  );

  const handleSelectAllDuplicates = useCallback(() => {
    if (uploadResult?.duplicates) {
      selectAllDuplicates(uploadResult.duplicates);
    }
  }, [uploadResult?.duplicates, selectAllDuplicates]);

  const handleTrimestreOpenChange = useCallback(
    (open: boolean) => {
      if (open && trimestresDisponibles.length === 0) {
        loadTrimestres();
      }
    },
    [trimestresDisponibles.length, loadTrimestres]
  );

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Carga de Faltas desde CSV
            </CardTitle>
            {(uploadResult || tipoFalta || trimestreId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAndReset}
                disabled={isUploading || isResetting}
                className="h-8 w-8 p-0"
                title="Nueva Subida"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo de falta */}
          <FaultTypeSelector
            value={tipoFalta}
            onValueChange={setTipoFalta}
            disabled={isUploading}
          />

          {/* Selector de trimestre */}
          <TrimestreSelector
            value={trimestreId}
            onValueChange={setTrimestreId}
            trimestres={trimestresDisponibles}
            loading={loadingTrimestres}
            onOpenChange={handleTrimestreOpenChange}
            disabled={isUploading}
          />

          {/* Separador */}
          <Separator />

          {/* Área de carga */}
          <FileUploadArea
            tipoFalta={tipoFalta}
            trimestreId={trimestreId}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadStatus={uploadStatus}
            onFileSelect={handleFileSelect}
          />

          {/* Resultados del procesamiento */}
          {uploadResult && <UploadResults result={uploadResult} />}
        </CardContent>
      </Card>

      {/* Diálogo para manejar duplicados */}
      <DuplicatesDialog
        open={showDuplicatesDialog}
        onOpenChange={closeDuplicatesDialog}
        result={uploadResult}
        selectedDuplicates={selectedDuplicates}
        onToggleSelection={toggleDuplicateSelection}
        onSelectAll={handleSelectAllDuplicates}
        onClearSelection={clearSelection}
        onAction={handleDuplicateAction}
      />
    </>
  );
}
