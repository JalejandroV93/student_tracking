"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useSyncInfo } from "@/hooks/useSyncInfo";
import { SyncStatusTable } from "@/components/admin/SyncStatusTable";
import { SyncHistoryTable } from "@/components/admin/SyncHistoryTable";
import { ContentLayoutSkeleton } from "@/components/admin/content-layout-skeleton";

export default function SyncPage() {
  const {
    syncMetadata,
    isSyncing,
    lastSyncTime,
    syncHistory,
    isLoading,
    error,
    triggerSync,
    refreshSyncStatus,
  } = useSyncInfo();

  useEffect(() => {
    refreshSyncStatus();
  }, [refreshSyncStatus]);

  const handleSyncRequest = async () => {
    try {
      await triggerSync();
      toast.success("Sincronización iniciada exitosamente");
    } catch (error) {
      toast.error("Error al iniciar la sincronización");
      console.error("Error al iniciar la sincronización:", error);
    }
  };

  if (isLoading) {
    return <ContentLayoutSkeleton title="Administración de Sincronización" />;
  }

  if (error) {
    return (
      <ContentLayout title="Administración de Sincronización">
        <Card className="mb-6">
          <CardHeader className="bg-destructive/10">
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              Ocurrió un error al cargar la información de sincronización
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error.message || "Error desconocido"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={refreshSyncStatus}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Administración de Sincronización">
      <div className="grid gap-6">
        <Card className="mb-2">
          <CardHeader>
            <CardTitle>Estado de Sincronización</CardTitle>
            <CardDescription>
              Estado actual de la sincronización con Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Última sincronización:
                  </p>
                  <p className="text-lg font-semibold">
                    {lastSyncTime
                      ? new Date(lastSyncTime).toLocaleString("es-CO")
                      : "Nunca"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={refreshSyncStatus}
                    disabled={isSyncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button onClick={handleSyncRequest} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar Ahora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado por Entidad</CardTitle>
            <CardDescription>
              Última sincronización de cada entidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SyncStatusTable metadata={syncMetadata} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Sincronización</CardTitle>
            <CardDescription>
              Registro de las últimas sincronizaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SyncHistoryTable history={syncHistory} />
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
