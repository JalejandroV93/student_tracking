"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useStudentCSVUpload } from "@/hooks/useStudentCSVUpload";

interface StudentCSVUploaderProps {
  onUploadComplete?: () => void;
  schoolYears: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
}

export function StudentCSVUploader({
  onUploadComplete,
  schoolYears,
}: StudentCSVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>("");
  const { isUploading, progress, result, error, uploadFile, reset } = useStudentCSVUpload();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      reset(); // Limpiar resultados anteriores
    }
  }, [reset]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !selectedSchoolYear) return;

    await uploadFile(selectedFile, parseInt(selectedSchoolYear));
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [selectedFile, selectedSchoolYear, uploadFile, onUploadComplete]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setSelectedSchoolYear("");
    reset();
  }, [reset]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Estudiantes desde CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información sobre el formato */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El archivo CSV debe contener las siguientes columnas separadas por punto y coma (;):
              <br />
              <strong>Grado, Apellido, Nombre, Código, Id, URL de la foto</strong>
              <br />
              Ejemplo: &quot;Décimo A;García;Juan;12345;1001;https://example.com/foto.jpg&quot;
            </AlertDescription>
          </Alert>

          {/* Selección de año académico */}
          <div className="space-y-2">
            <Label htmlFor="schoolYear">Año Académico *</Label>
            <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año académico" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((year) => (
                  <SelectItem key={year.id} value={year.id.toString()}>
                    {year.name} {year.isActive && "(Activo)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">Archivo CSV *</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
          </div>

          {/* Progreso */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivo...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedSchoolYear || isUploading}
              className="flex-1"
            >
              {isUploading ? "Procesando..." : "Importar Estudiantes"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isUploading}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Resultados de la Importación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total de filas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.created}</div>
                  <div className="text-sm text-muted-foreground">Creados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{result.updated}</div>
                  <div className="text-sm text-muted-foreground">Actualizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
              </div>

              <Alert>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              {/* Mostrar errores si los hay */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Errores encontrados:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-200">
                        <span className="font-medium">Fila {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}