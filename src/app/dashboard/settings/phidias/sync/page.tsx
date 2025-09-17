"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncControl } from "@/components/phidias/sync-control";
import { PhidiasSyncLog } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface SyncError {
  studentId: number;
  error: string;
}

export default function PhidiasSyncPage() {
  const [syncLogs, setSyncLogs] = useState<PhidiasSyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSyncLogs = async () => {
    try {
      const response = await fetch('/api/v1/phidias/sync/logs');
      if (response.ok) {
        const logs = await response.json();
        setSyncLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Exitoso</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'partial':
        return <Badge variant="secondary">Parcial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold">Control de Sincronización Phidias</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la sincronización de datos entre el sistema local y Phidias
        </p>
      </div>

      <SyncControl />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronizaciones</CardTitle>
          <CardDescription>
            Últimas sincronizaciones realizadas con Phidias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando historial...</p>
          ) : syncLogs.length === 0 ? (
            <p className="text-muted-foreground">No hay sincronizaciones registradas</p>
          ) : (
            <div className="space-y-4">
              {syncLogs.map((log) => {
                const errors = log.errors as SyncError[] | null;
                
                return (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <Badge variant="outline">{log.syncType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.startedAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      {log.duration && (
                        <span className="text-sm text-muted-foreground">
                          Duración: {log.duration}s
                        </span>
                      )}
                    </div>
                    
                    {log.status === 'success' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Procesados:</span> {log.studentsProcessed}
                        </div>
                        <div>
                          <span className="font-medium">Creados:</span> {log.recordsCreated}
                        </div>
                        <div>
                          <span className="font-medium">Actualizados:</span> {log.recordsUpdated}
                        </div>
                      </div>
                    )}
                    
                    {errors && errors.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <span className="font-medium text-red-700">Errores:</span>
                        <ul className="text-red-600 mt-1">
                          {errors.slice(0, 3).map((error: SyncError, index: number) => (
                            <li key={index} className="truncate">
                              Estudiante {error.studentId}: {error.error}
                            </li>
                          ))}
                          {errors.length > 3 && (
                            <li className="text-muted-foreground">
                              ... y {errors.length - 3} errores más
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}