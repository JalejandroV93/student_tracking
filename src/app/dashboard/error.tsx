// src/app/dashboard/error.tsx
"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Terminal,
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Wifi,
  Server,
} from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";

interface ErrorInfo {
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
}

// Determinar el tipo de error y su información
function getErrorInfo(
  error: Error & { digest?: string; status?: number }
): ErrorInfo {
  const status = error.status || 0;

  if (status === 401) {
    return {
      type: "auth",
      title: "Error de Autenticación",
      description:
        "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
      icon: Terminal,
      action: "login",
    };
  }

  if (status === 403) {
    return {
      type: "forbidden",
      title: "Acceso Denegado",
      description: "No tiene permisos para acceder a esta información.",
      icon: AlertTriangle,
    };
  }

  if (status === 404) {
    return {
      type: "notFound",
      title: "Datos No Encontrados",
      description:
        "Los datos solicitados no fueron encontrados. Es posible que hayan sido eliminados.",
      icon: Terminal,
    };
  }

  if (status >= 500 && status < 600) {
    return {
      type: "server",
      title: "Error del Servidor",
      description:
        "Problema en el servidor. Nuestro equipo ha sido notificado.",
      icon: Server,
    };
  }

  if (error.message?.includes("fetch")) {
    return {
      type: "network",
      title: "Error de Conexión",
      description:
        "No se pudo conectar con el servidor. Verifique su conexión a internet.",
      icon: Wifi,
    };
  }

  return {
    type: "unknown",
    title: "Error Inesperado",
    description:
      error.message ||
      "Ha ocurrido un error inesperado. Por favor intente nuevamente.",
    icon: Bug,
  };
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  const errorInfo = getErrorInfo(error);
  const IconComponent = errorInfo.icon;

  useEffect(() => {
    // Logging más detallado del error
    console.group("Dashboard Error");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    console.error("Status:", error.status);
    console.error("Digest:", error.digest);
    console.groupEnd();

    // TODO: Enviar error a servicio de monitoreo
    // trackError(error);
  }, [error]);

  const handleAction = () => {
    if (errorInfo.action === "login") {
      window.location.href = "/access";
      return;
    }
    reset();
  };

  return (
    <ContentLayout title="Resumen">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <IconComponent className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-destructive">
              {errorInfo.title}
            </h2>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detalles del Error</AlertTitle>
              <AlertDescription className="mt-2">
                {errorInfo.description}
              </AlertDescription>
            </Alert>

            {/* Información técnica (solo en development) */}
            {process.env.NODE_ENV === "development" && (
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Información de Desarrollo</AlertTitle>
                <AlertDescription className="text-xs">
                  <details className="mt-2">
                    <summary className="cursor-pointer">
                      Ver detalles técnicos
                    </summary>
                    <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  </details>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Button onClick={handleAction} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                {errorInfo.action === "login" ? "Iniciar Sesión" : "Reintentar"}
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </div>

            {/* Sugerencias adicionales basadas en el tipo de error */}
            {errorInfo.type === "network" && (
              <div className="text-sm text-muted-foreground text-center">
                <p>Sugerencias:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Verifique su conexión a internet</li>
                  <li>• Intente recargar la página</li>
                  <li>• Contacte al administrador si persiste</li>
                </ul>
              </div>
            )}

            {errorInfo.type === "server" && (
              <div className="text-sm text-muted-foreground text-center">
                <p>El error ha sido reportado automáticamente.</p>
                <p className="text-xs mt-1">ID: {error.digest || "N/A"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
