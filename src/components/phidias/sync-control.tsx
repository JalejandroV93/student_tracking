'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Play, 
  AlertTriangle,
  Activity,
  Database,
  Filter,
  User 
} from 'lucide-react';
import { toast } from 'sonner';

interface SyncStatus {
  status: 'idle' | 'running' | 'completed' | 'error' | 'not_found';
  result?: {
    success: boolean;
    studentsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    duration: number;
    startedAt: string;
    completedAt?: string;
    errors?: Array<{ studentId: number; error: string }>;
  };
  message?: string;
  error?: string;
}

interface SyncProgress {
  processed: number;
  total: number;
  message: string;
  phase: string;
  currentLevel?: string;
  currentStudent?: { id: number; name?: string };
}

export function SyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncId, setSyncId] = useState<string | null>(null);
  
  // Nuevas opciones de filtrado
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [specificStudentId, setSpecificStudentId] = useState<string>('');
  const [syncType, setSyncType] = useState<'all' | 'level' | 'student'>('all');

  // Cargar estado inicial
  useEffect(() => {
    loadLastSyncStatus();
  }, []);

  // Polling para sincronización en progreso
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (syncStatus.status === 'running' && syncId) {
      intervalId = setInterval(() => {
        checkSyncStatus(syncId);
      }, 2000); // Verificar cada 2 segundos
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [syncStatus.status, syncId]);

  const loadLastSyncStatus = async () => {
    try {
      const response = await fetch('/api/v1/phidias/sync');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSyncStatus({
            status: 'completed',
            result: {
              success: data.status === 'success',
              studentsProcessed: data.studentsProcessed || 0,
              recordsCreated: data.recordsCreated || 0,
              recordsUpdated: data.recordsUpdated || 0,
              duration: data.duration || 0,
              startedAt: data.startedAt,
              completedAt: data.completedAt,
              errors: data.errors ? JSON.parse(JSON.stringify(data.errors)) : []
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const checkSyncStatus = async (currentSyncId: string) => {
    try {
      const response = await fetch(`/api/v1/phidias/sync?syncId=${currentSyncId}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'completed') {
          setSyncStatus({
            status: 'completed',
            result: data.result
          });
          setSyncProgress(null);
          setSyncId(null);
          
          if (data.result?.success) {
            toast.success('Sincronización completada exitosamente');
          } else {
            toast.error('Sincronización completada con errores');
          }
        } else if (data.status === 'error') {
          setSyncStatus({
            status: 'error',
            error: data.error
          });
          setSyncProgress(null);
          setSyncId(null);
          toast.error(`Error en sincronización: ${data.error}`);
        }
        // Si está 'running', mantener el estado actual
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const startSync = async () => {
    setIsLoading(true);
    setSyncProgress({ processed: 0, total: 0, message: 'Iniciando sincronización...', phase: 'loading_config' });
    
    try {
      // Preparar payload según el tipo de sincronización
      const payload: {
        specificLevel?: string;
        specificStudentId?: number;
      } = {};

      if (syncType === 'level' && selectedLevel) {
        payload.specificLevel = selectedLevel;
      } else if (syncType === 'student' && specificStudentId) {
        payload.specificStudentId = parseInt(specificStudentId);
      }

      const response = await fetch('/api/v1/phidias/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setSyncId(data.syncId);
        setSyncStatus({ status: 'running' });
        toast.success(data.message || 'Sincronización iniciada');
      } else {
        const errorData = await response.json();
        setSyncStatus({
          status: 'error',
          error: errorData.error || 'Error desconocido'
        });
        toast.error(`Error iniciando sincronización: ${errorData.error}`);
      }
    } catch {
      setSyncStatus({
        status: 'error',
        error: 'Error de conexión'
      });
      toast.error('Error de conexión al iniciar sincronización');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/v1/phidias/test');
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Conexión exitosa con Phidias (${data.duration}ms)`);
      } else {
        toast.error(`Error de conexión: ${data.error}`);
      }
    } catch {
      toast.error('Error probando conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return syncStatus.result?.success ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-600">En progreso</Badge>;
      case 'completed':
        return syncStatus.result?.success ? 
          <Badge variant="default" className="bg-green-600">Completado</Badge> : 
          <Badge variant="default" className="bg-yellow-600">Con errores</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Sin ejecutar</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sincronización con Phidias
        </CardTitle>
        <CardDescription>
          Sincroniza los seguimientos y faltas desde el sistema Phidias
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Opciones de sincronización */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Opciones de Sincronización</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sync-type">Tipo de Sincronización</Label>
              <Select value={syncType} onValueChange={(value) => setSyncType(value as 'all' | 'level' | 'student')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="level">Nivel específico</SelectItem>
                  <SelectItem value="student">Estudiante específico (Debug)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {syncType === 'level' && (
              <div className="space-y-2">
                <Label htmlFor="level-select">Nivel Académico</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preschool">Preschool</SelectItem>
                    <SelectItem value="Elementary">Elementary</SelectItem>
                    <SelectItem value="Middle School">Middle School</SelectItem>
                    <SelectItem value="High School">High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {syncType === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="student-id">ID del Estudiante</Label>
                <Input
                  id="student-id"
                  type="number"
                  placeholder="Ej: 12345"
                  value={specificStudentId}
                  onChange={(e) => setSpecificStudentId(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <Separator />
        
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Estado actual:</span>
            {getStatusBadge()}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={isLoading || syncStatus.status === 'running'}
            >
              <Database className="h-4 w-4 mr-2" />
              Probar Conexión
            </Button>
            
            <Button
              onClick={startSync}
              disabled={
                isLoading || 
                syncStatus.status === 'running' ||
                (syncType === 'level' && !selectedLevel) ||
                (syncType === 'student' && !specificStudentId)
              }
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              {syncType === 'all' ? 'Sincronizar Todo' : 
               syncType === 'level' ? `Sincronizar ${selectedLevel}` :
               `Sincronizar Estudiante ${specificStudentId}`}
            </Button>
          </div>
        </div>

        {/* Progreso de sincronización */}
        {syncStatus.status === 'running' && syncProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{syncProgress.message}</span>
              <span className="text-muted-foreground">
                {syncProgress.total > 0 && `${syncProgress.processed}/${syncProgress.total}`}
              </span>
            </div>
            
            {syncProgress.total > 0 && (
              <Progress 
                value={(syncProgress.processed / syncProgress.total) * 100} 
                className="w-full h-2"
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>Fase: {syncProgress.phase}</div>
              {syncProgress.currentLevel && (
                <div>Nivel actual: {syncProgress.currentLevel}</div>
              )}
              {syncProgress.currentStudent && (
                <div className="md:col-span-2">
                  <User className="inline h-3 w-3 mr-1" />
                  Estudiante: {syncProgress.currentStudent.name} (ID: {syncProgress.currentStudent.id})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultados de la última sincronización */}
        {syncStatus.status === 'completed' && syncStatus.result && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Última Sincronización</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {syncStatus.result.studentsProcessed}
                  </div>
                  <div className="text-xs text-muted-foreground">Estudiantes</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {syncStatus.result.recordsCreated}
                  </div>
                  <div className="text-xs text-muted-foreground">Creados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {syncStatus.result.recordsUpdated}
                  </div>
                  <div className="text-xs text-muted-foreground">Actualizados</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {formatDuration(syncStatus.result.duration)}
                  </div>
                  <div className="text-xs text-muted-foreground">Duración</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Iniciado: {formatDate(syncStatus.result.startedAt)}</div>
                {syncStatus.result.completedAt && (
                  <div>Completado: {formatDate(syncStatus.result.completedAt)}</div>
                )}
              </div>

              {/* Errores si los hay */}
              {syncStatus.result.errors && syncStatus.result.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-red-600">
                    Errores ({syncStatus.result.errors.length})
                  </h5>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {syncStatus.result.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        Estudiante {error.studentId}: {error.error}
                      </div>
                    ))}
                    {syncStatus.result.errors.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        ... y {syncStatus.result.errors.length - 5} errores más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {syncStatus.status === 'error' && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-red-600">Error</h4>
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {syncStatus.error}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}