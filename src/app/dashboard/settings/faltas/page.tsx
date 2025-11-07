'use client';

import { CSVUploader } from "@/components/faltas/CSVUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";



export default function FaltasSettingsPage() {
  return (
    <ContentLayout title="Configuración de Faltas">
      <BreadcrumbNav />
      <div className="container mx-auto py-6 space-y-6">
        

        <div className="grid gap-6">
          {/* Sección principal de carga CSV */}
          <CSVUploader
            onUploadSuccess={(result) => {
              console.log("Upload successful:", result);
            }}
            onUploadError={(error) => {
              console.error("Upload error:", error);
            }}
          />

          {/* Información adicional */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Formato del Archivo CSV
                </CardTitle>
                <CardDescription>
                  Requisitos para el archivo de carga de faltas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Separador</h4>
                  <p className="text-sm text-muted-foreground">
                    El archivo debe usar punto y coma (;) como separador de
                    campos
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Columnas Requeridas</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Id</li>
                    <li>• Código</li>
                    <li>• Persona</li>
                    <li>• Sección</li>
                    <li>• Fecha De Creación</li>
                    <li>• Autor</li>
                    <li>• Fecha</li>
                    <li>• Descripcion de la falta</li>
                    <li>• Acciones Reparadoras</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Formato de Fechas</h4>
                  <p className="text-sm text-muted-foreground">
                    Las fechas deben estar en formato DD/MM/YYYY
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Proceso de Carga
                </CardTitle>
                <CardDescription>
                  Cómo funciona la carga de faltas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Detección de Duplicados
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    El sistema detecta automáticamente registros duplicados
                    usando un hash único basado en el código del estudiante,
                    fecha y descripción de la falta.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Gestión de Estudiantes</h4>
                  <p className="text-sm text-muted-foreground">
                    Si un estudiante no existe en el sistema, se crea
                    automáticamente con los datos del CSV.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Validación</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada fila se valida antes de procesarse. Los errores se
                    reportan al final del proceso.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
