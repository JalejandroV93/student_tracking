import { useState, useCallback } from "react";

type SyncMetadataItem = {
  tabla: string;
  ultima_actualizacion: string; // Fecha ISO
};

type SyncHistoryItem = {
  id: number;
  status: "success" | "error" | "running";
  startedAt: string;
  completedAt?: string;
  error?: string;
};

export function useSyncInfo() {
  const [syncMetadata, setSyncMetadata] = useState<SyncMetadataItem[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshSyncStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener el estado de sincronización
      const metadataResponse = await fetch("/api/v1/admin/sync/status");

      if (!metadataResponse.ok) {
        throw new Error(
          `Error obteniendo estado de sincronización: ${metadataResponse.statusText}`
        );
      }

      const data = await metadataResponse.json();
      setSyncMetadata(data.metadata || []);
      setLastSyncTime(data.lastSync || null);
      setIsSyncing(data.isSyncing || false);

      // Obtener el historial de sincronización
      const historyResponse = await fetch("/api/v1/admin/sync/history");

      if (!historyResponse.ok) {
        throw new Error(
          `Error obteniendo historial de sincronización: ${historyResponse.statusText}`
        );
      }

      const historyData = await historyResponse.json();
      setSyncHistory(historyData.history || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      console.error("Error al obtener información de sincronización:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    try {
      setIsSyncing(true);

      const response = await fetch("/api/v1/admin/sync/trigger", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Error iniciando sincronización: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Actualizar estado después de iniciar sincronización
      if (result.success) {
        // Esperar 2 segundos y actualizar estado para ver progreso
        setTimeout(() => {
          refreshSyncStatus();
        }, 2000);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      console.error("Error al iniciar sincronización:", err);
      throw err;
    }
  }, [refreshSyncStatus]);

  return {
    syncMetadata,
    syncHistory,
    isSyncing,
    lastSyncTime,
    isLoading,
    error,
    triggerSync,
    refreshSyncStatus,
  };
}
