"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Database,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { 
  SeguimientoStatus,
  SeguimientosStatusResponse
} from '@/types/phidias';

export function SeguimientosStatusPanel() {
  const [data, setData] = useState<SeguimientosStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSeguimientosStatus = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('/api/v1/phidias/consolidate');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        
        if (showRefreshing) {
          toast.success('Estado de seguimientos actualizado');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al obtener estado de seguimientos');
      }
    } catch (error) {
      console.error('Error fetching seguimientos status:', error);
      toast.error('Error de conexión al obtener estado de seguimientos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSeguimientosStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'out_of_sync':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-500">Sincronizado</Badge>;
      case 'out_of_sync':
        return <Badge variant="secondary" className="bg-yellow-500">Desincronizado</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getCountIcon = (localCount: number, phidiasCount: number) => {
    if (localCount > phidiasCount) {
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    } else if (localCount < phidiasCount) {
      return <TrendingDown className="h-4 w-4 text-orange-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getSummaryStats = () => {
    if (!data) return null;

    const { summary } = data;
    const syncPercentage = summary.total > 0 ? Math.round((summary.synced / summary.total) * 100) : 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.synced}</div>
          <div className="text-sm text-muted-foreground">Sincronizados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.outOfSync}</div>
          <div className="text-sm text-muted-foreground">Desincronizados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
          <div className="text-sm text-muted-foreground">Con errores</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{syncPercentage}%</div>
          <div className="text-sm text-muted-foreground">Sincronización</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de Sincronización de Seguimientos
          </CardTitle>
          <CardDescription>
            Comparación de registros entre sistema local y Phidias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de Sincronización de Seguimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar la información de seguimientos</p>
            <Button 
              onClick={() => fetchSeguimientosStatus()} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de Sincronización de Seguimientos
            </CardTitle>
            <CardDescription>
              Comparación de registros entre sistema local y Phidias
              {data.summary.lastChecked && (
                <span className="block mt-1 text-xs">
                  Última verificación: {formatDistanceToNow(new Date(data.summary.lastChecked), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            onClick={() => fetchSeguimientosStatus(true)} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {getSummaryStats()}
        
        <div className="space-y-4">
          {data.seguimientos.map((seguimiento: SeguimientoStatus) => (
            <div key={seguimiento.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(seguimiento.status)}
                  <div>
                    <h4 className="font-medium">{seguimiento.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {seguimiento.tipo_falta}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {seguimiento.nivel_academico}
                      </Badge>
                      <span>ID: {seguimiento.phidias_id}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(seguimiento.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Sistema local:</span>
                  <span className="font-mono">{seguimiento.localCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Phidias:</span>
                  <span className="font-mono">{seguimiento.phidiasCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getCountIcon(seguimiento.localCount, seguimiento.phidiasCount)}
                  <span className="font-medium">Diferencia:</span>
                  <span className="font-mono">
                    {seguimiento.localCount - seguimiento.phidiasCount > 0 ? '+' : ''}
                    {seguimiento.localCount - seguimiento.phidiasCount}
                  </span>
                </div>
              </div>

              {seguimiento.error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <span className="font-medium">Error:</span> {seguimiento.error}
                </div>
              )}
            </div>
          ))}

          {data.seguimientos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay seguimientos configurados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}