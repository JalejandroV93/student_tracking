"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import type {
  UploadResponse,
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ProcessingResult | null>(
    null
  );
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(
    new Set()
  );
  const [tipoFalta, setTipoFalta] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to safely format dates
  const formatDate = (dateValue: Date | string | null | undefined): string => {
    if (!dateValue) return "N/A";

    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que se haya seleccionado el tipo de falta
    if (!tipoFalta) {
      toast.error(
        "Debe seleccionar el tipo de falta antes de cargar el archivo"
      );
      // Limpiar la selección del archivo
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

    uploadFile(file);
  };

  const uploadFile = async (
    file: File,
    duplicateHandling?: DuplicateHandlingOptions
  ) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipoFalta", tipoFalta);

      if (duplicateHandling) {
        formData.append("duplicateHandling", JSON.stringify(duplicateHandling));
      }

      const response = await fetch("/api/v1/faltas/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el archivo");
      }

      if (data.result) {
        setUploadResult(data.result);

        // Si hay duplicados y no se especificó cómo manejarlos, mostrar el diálogo
        if (data.result.duplicates.length > 0 && !duplicateHandling) {
          setPendingFile(file);
          setShowDuplicatesDialog(true);
          setSelectedDuplicates(new Set()); // Reset selection
        } else {
          // Procesamiento exitoso
          toast.success(data.result.message);
          onUploadSuccess?.(data.result);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDuplicateAction = async (action: "ignore" | "update") => {
    if (!pendingFile) return;

    const duplicateHandling: DuplicateHandlingOptions = {
      action,
      duplicateHashes:
        action === "update" ? Array.from(selectedDuplicates) : [],
    };

    setShowDuplicatesDialog(false);
    setPendingFile(null);
    setSelectedDuplicates(new Set());

    await uploadFile(pendingFile, duplicateHandling);
  };

  const toggleDuplicateSelection = (hash: string) => {
    const newSelection = new Set(selectedDuplicates);
    if (newSelection.has(hash)) {
      newSelection.delete(hash);
    } else {
      newSelection.add(hash);
    }
    setSelectedDuplicates(newSelection);
  };

  const selectAllDuplicates = () => {
    if (uploadResult?.duplicates) {
      setSelectedDuplicates(
        new Set(uploadResult.duplicates.map((d) => d.hash))
      );
    }
  };

  const clearSelection = () => {
    setSelectedDuplicates(new Set());
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga de Faltas desde CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de tipo de falta */}
          <div className="space-y-2">
            <Label htmlFor="tipo-falta" className="text-sm font-medium">
              Tipo de Falta *
            </Label>
            <Select value={tipoFalta} onValueChange={setTipoFalta}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de falta que se está cargando" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tipo I">Tipo I</SelectItem>
                <SelectItem value="Tipo II">Tipo II</SelectItem>
                <SelectItem value="Tipo III">Tipo III</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Este tipo se aplicará a todas las faltas del archivo CSV que se
              cargue.
            </p>
          </div>

          {/* Separador */}
          <Separator />

          {/* Área de carga */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Selecciona un archivo CSV</p>
              <p className="text-sm text-gray-500">
                El archivo debe estar separado por punto y coma (;) y contener
                las columnas requeridas. Todas las faltas del archivo serán
                marcadas como {tipoFalta || "[Tipo no seleccionado]"}.
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
              disabled={isUploading || !tipoFalta}
              size="lg"
              className="mt-4"
            >
              {isUploading ? "Procesando..." : "Seleccionar archivo"}
            </Button>
            {!tipoFalta && (
              <p className="text-sm text-red-500 mt-2">
                Primero debes seleccionar el tipo de falta
              </p>
            )}
          </div>

          {/* Indicador de progreso */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Procesando archivo...
                </span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
          )}

          {/* Resultados del procesamiento */}
          {uploadResult && (
            <div className="space-y-4">
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {uploadResult.totalRows}
                    </div>
                    <div className="text-sm text-gray-500">Total de filas</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.processedRows}
                    </div>
                    <div className="text-sm text-gray-500">Procesadas</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.errors.length}
                    </div>
                    <div className="text-sm text-gray-500">Errores</div>
                  </CardContent>
                </Card>
              </div>

              {/* Mensaje de resultado */}
              <Alert
                className={
                  uploadResult.success
                    ? "border-green-500"
                    : "border-yellow-500"
                }
              >
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <AlertDescription>{uploadResult.message}</AlertDescription>
              </Alert>

              {/* Duplicados encontrados */}
              {uploadResult.duplicates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Duplicados Encontrados ({uploadResult.duplicates.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {uploadResult.duplicates
                        .slice(0, 3)
                        .map((duplicate, index) => (
                          <div
                            key={index}
                            className="p-3 bg-yellow-50 border border-yellow-200 rounded"
                          >
                            <p className="text-sm font-medium">
                              {duplicate.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              Hash: {duplicate.hash.substring(0, 16)}...
                            </p>
                          </div>
                        ))}
                      {uploadResult.duplicates.length > 3 && (
                        <p className="text-sm text-gray-500">
                          ... y {uploadResult.duplicates.length - 3} más
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Errores */}
              {uploadResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <X className="h-5 w-5 text-red-500" />
                      Errores de Procesamiento ({uploadResult.errors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
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
          )}
        </CardContent>
      </Card>

      {/* Diálogo para manejar duplicados */}
      <Dialog
        open={showDuplicatesDialog}
        onOpenChange={setShowDuplicatesDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registros Duplicados Encontrados</DialogTitle>
            <DialogDescription>
              Se encontraron {uploadResult?.duplicates.length} registros que ya
              existen en la base de datos. Selecciona los que deseas actualizar
              o ignora todos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllDuplicates}>
                Seleccionar todos
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpiar selección
              </Button>
              <Badge variant="secondary">
                {selectedDuplicates.size} seleccionados
              </Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadResult?.duplicates.map((duplicate) => (
                <div
                  key={duplicate.hash}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedDuplicates.has(duplicate.hash)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleDuplicateSelection(duplicate.hash)}
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
              <Button
                variant="outline"
                onClick={() => handleDuplicateAction("ignore")}
              >
                Ignorar todos
              </Button>
              <Button
                onClick={() => handleDuplicateAction("update")}
                disabled={selectedDuplicates.size === 0}
              >
                Actualizar seleccionados ({selectedDuplicates.size})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
