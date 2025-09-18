"use client";

import { StudentCSVUploader } from "@/components/students/StudentCSVUploader";
import { StudentImportSkeleton } from "@/components/students/StudentImportSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense, useEffect, useState } from "react";

interface SchoolYear {
  id: number;
  name: string;
  isActive: boolean;
}

export function StudentImportTab() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await fetch("/api/v1/school-years");
        if (!response.ok) {
          throw new Error("Error al cargar los años académicos");
        }
        const result = await response.json();
        if (result.success) {
          // Transformar los datos al formato esperado
          const transformedData = result.data.map(
            (year: { id: number; name: string; isActive: boolean }) => ({
              id: year.id,
              name: year.name,
              isActive: year.isActive,
            })
          );
          setSchoolYears(transformedData);
        } else {
          throw new Error(
            result.error || "Error al cargar los años académicos"
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolYears();
  }, []);

  const handleUploadComplete = () => {
    // Aquí podrías agregar alguna acción después de la importación
    // como recargar datos o mostrar una notificación
    console.log("Importación completada exitosamente");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <StudentImportSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Importación de Estudiantes</h3>
        <p className="text-muted-foreground mt-2">
          Importa estudiantes masivamente desde archivos CSV de Phidias
        </p>
      </div>

      <div className="grid gap-6">
        {/* Información importante */}
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Formato del archivo CSV:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>El archivo debe estar separado por punto y coma (;)</li>
                <li>
                  Debe contener exactamente estas columnas en este orden:{" "}
                  <strong>
                    Grado, Apellido, Nombre, Código, Id, URL de la foto
                  </strong>
                </li>
                <li>
                  El campo Grado debe contener valores como: &quot;Décimo
                  A&quot;, &quot;Kínder 5 B&quot;, &quot;Segundo A&quot;, etc.
                </li>
                <li>Los códigos de estudiante deben ser únicos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Funcionamiento:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Si un estudiante ya existe (mismo código), se actualizará su
                  información
                </li>
                <li>Si un estudiante no existe, se creará uno nuevo</li>
                <li>
                  Se asigna automáticamente el nivel académico basado en el
                  grado
                </li>
                <li>
                  Los estudiantes se asocian al año académico seleccionado
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Componente de importación */}
        <Suspense
          fallback={
            <Card className="border-none">
              <CardContent className="p-8">
                <div className="text-center">Cargando...</div>
              </CardContent>
            </Card>
          }
        >
          <StudentCSVUploader
            schoolYears={schoolYears}
            onUploadComplete={handleUploadComplete}
          />
        </Suspense>
      </div>
    </div>
  );
}
