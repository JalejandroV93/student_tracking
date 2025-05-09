// src/app/dashboard/error.tsx
"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcionalmente registrar el error en algún servicio
    console.error(error);
  }, [error]);

  return (
    <ContentLayout title="Resumen">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center">
        <Alert variant="destructive" className="max-w-md mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error al Cargar Datos</AlertTitle>
          <AlertDescription>
            {error.message || "Ocurrió un error inesperado"}. Intente recargar o
            contacte soporte.
          </AlertDescription>
        </Alert>
        <Button onClick={reset} variant="outline">
          Reintentar Carga
        </Button>
      </div>
    </ContentLayout>
  );
}
