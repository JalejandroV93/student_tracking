"use client";

import { useState } from "react";
import { CSVUploader } from "@/components/faltas/CSVUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProcessingResult } from "@/types/csv-import";
import { FileText, Download, RefreshCw, Info } from "lucide-react";

export default function CSVImportPage() {
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUploadSuccess = (result: ProcessingResult) => {
    setLastResult(result);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    setLastResult(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresco de datos (aquí podrías hacer fetch de estadísticas actualizadas)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const downloadTemplate = () => {
    // Generar un CSV template con las columnas requeridas
    const headers = [
      "Id",
      "Código",
      "Persona",
      "Sección",
      "Fecha De Creación",
      "Autor",
      "Fecha última Edición",
      "último Editor",
      "Fecha",
      "Estudiante con diagnostico?",
      "Falta segun Manual de Convivencia",
      "Descripcion de la falta",
      "Acciones Reparadoras",
      "Acta de Descargos",
    ];

    const sampleData = [
      "1",
      "1234",
      "Estudiante de Ejemplo",
      "Décimo A",
      "27/08/2025 10:00",
      "Profesor Ejemplo",
      "27/08/2025 10:00",
      "Profesor Ejemplo",
      "26/08/2025",
      "No",
      "1.Falta leve de ejemplo",
      "Descripción detallada de la falta",
      "Acciones reparadoras propuestas",
      "Acta de descargos",
    ];

    const csvContent = [headers.join(";"), sampleData.join(";")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_faltas.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Importación de Faltas</h1>
          <p className="text-gray-600">
            Carga masiva de datos de faltas desde archivos CSV
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Información sobre el formato */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Formato requerido:</strong> El archivo CSV debe estar separado
          por punto y coma (;) y contener las columnas: Id, Código, Persona,
          Sección, Fecha De Creación, Autor, Fecha última Edición, último
          Editor, Fecha, Descripcion de la falta, Acciones Reparadoras.
          <br />
          <strong>Tipo de falta:</strong> Debes seleccionar el tipo de falta
          (Tipo I, II o III) antes de cargar el archivo. Este tipo se aplicará a
          todas las faltas del CSV.
          <br />
          <strong>Nivel académico:</strong> Se calcula automáticamente basado en
          la sección del estudiante.
          <br />
          <strong>Duplicados:</strong> Los registros duplicados se detectan
          automáticamente usando un hash generado a partir del código del
          estudiante, fecha de creación, descripción y acciones reparadoras.
        </AlertDescription>
      </Alert>

      {/* Componente principal de carga */}
      <CSVUploader
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Estadísticas de la última carga */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumen de la Última Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{lastResult.totalRows}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.processedRows}
                </div>
                <div className="text-sm text-gray-500">Procesados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {lastResult.duplicates.length}
                </div>
                <div className="text-sm text-gray-500">Duplicados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {lastResult.errors.length}
                </div>
                <div className="text-sm text-gray-500">Errores</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Badge variant={lastResult.success ? "default" : "destructive"}>
                {lastResult.success
                  ? "Completado"
                  : "Completado con advertencias"}
              </Badge>
              <span className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones detalladas */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">1. Preparar el archivo CSV</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Usar separador punto y coma (;)</li>
                <li>• Incluir todas las columnas requeridas</li>
                <li>• Formato de fechas: DD/MM/YYYY</li>
                <li>• Codificar en UTF-8</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Proceso de carga</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Seleccionar tipo de falta (Tipo I, II o III)</li>
                <li>• Seleccionar archivo CSV</li>
                <li>• Revisar duplicados detectados</li>
                <li>• Decidir acción para duplicados</li>
                <li>• Confirmar procesamiento</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Procesamiento automático</h3>
            <p className="text-sm text-gray-600">
              El sistema automáticamente asigna el nivel académico basado en la
              sección (Elementary, Middle School, High School, etc.) y extrae el
              número de falta del campo &ldquo;Falta según Manual de
              Convivencia&rdquo;. El tipo de falta seleccionado se aplica a
              todas las faltas del archivo CSV.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Gestión de duplicados</h3>
            <p className="text-sm text-gray-600">
              El sistema detecta duplicados generando un hash único para cada
              registro basado en: código del estudiante, fecha de creación,
              descripción de la falta y acciones reparadoras. Puedes elegir
              ignorar los duplicados o actualizar la fecha de última edición.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
