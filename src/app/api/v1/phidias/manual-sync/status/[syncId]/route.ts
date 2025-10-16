// src/app/api/v1/phidias/manual-sync/status/[syncId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { SyncResult } from '@/types/phidias';

// Verificar Bearer token
function validateBearerToken(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization');
  
  if (!authorization?.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authorization.substring(7);
  const validToken = process.env.MANUAL_SYNC_TOKEN;
  
  if (!validToken || token !== validToken) {
    return false;
  }
  
  return true;
}

// GET - Obtener estado de sincronización específica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ syncId: string }> }
) {
  try {
    // Validar Bearer token
    if (!validateBearerToken(request)) {
      return NextResponse.json({ error: 'Token de autorización inválido' }, { status: 401 });
    }

    const { syncId } = await params;

    if (!syncId) {
      return NextResponse.json({
        error: 'ID de sincronización requerido'
      }, { status: 400 });
    }

    const manualSyncs = global.manualSyncs || {};
    
    if (syncId in manualSyncs) {
      try {
        // Intentar obtener el resultado con timeout
        const result = await Promise.race([
          manualSyncs[syncId],
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        ]);
        
        // Si llegamos aquí, la sincronización terminó
        delete manualSyncs[syncId];
        return NextResponse.json({
          success: true,
          syncId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          result: {
            success: (result as SyncResult).success,
            studentsProcessed: (result as SyncResult).studentsProcessed,
            recordsCreated: (result as SyncResult).recordsCreated,
            recordsUpdated: (result as SyncResult).recordsUpdated,
            duration: (result as SyncResult).duration,
            errors: (result as SyncResult).errors,
            logId: (result as SyncResult).logId
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
          return NextResponse.json({
            success: true,
            syncId,
            status: 'running',
            message: 'Sincronización en progreso',
            startedAt: new Date().toISOString()
          });
        }
        
        // Error en la sincronización
        delete manualSyncs[syncId];
        return NextResponse.json({
          success: false,
          syncId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
          completedAt: new Date().toISOString()
        });
      }
    } else {
      // Buscar en el historial si no está en activos
      // Primero verificar si el syncId corresponde a un log específico
      if (syncId.startsWith('manual_')) {
        const lastSync = await phidiasSyncService.getLastSyncStats();
        if (lastSync) {
          return NextResponse.json({
            success: true,
            syncId,
            status: 'completed',
            completedAt: lastSync.completedAt,
            result: {
              success: lastSync.status === 'success',
              studentsProcessed: lastSync.studentsProcessed,
              recordsCreated: lastSync.recordsCreated,
              recordsUpdated: lastSync.recordsUpdated,
              duration: lastSync.duration,
              errors: lastSync.errors,
              logId: lastSync.id
            },
            message: 'Resultado obtenido del historial (sincronización ya completada)'
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        syncId,
        status: 'not_found',
        message: 'Sincronización no encontrada. Es posible que haya expirado o no haya existido.'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Error getting manual sync status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}