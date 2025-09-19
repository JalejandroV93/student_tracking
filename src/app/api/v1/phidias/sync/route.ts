// src/app/api/v1/phidias/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { phidiasApiService } from '@/services/phidias-api.service';
import { SyncResult } from '@/types/phidias';

// Verificar si la solicitud proviene de un cron job autorizado
function isCronRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');
  const cronSecret = request.headers.get('x-cron-signature');
  const authorization = request.headers.get('authorization');
  
  // Verificar si es Vercel cron
  if (userAgent?.includes('vercel-cron/1.0')) {
    return true;
  }
  
  // Verificar si tiene secret de cron personalizado
  if (cronSecret && cronSecret === process.env.CRON_SECRET) {
    return true;
  }
  
  // Verificar si tiene token de cron en Authorization
  if (authorization && authorization === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  
  return false;
}


// Extender el tipo global para incluir activeSyncs
declare global {
  // eslint-disable-next-line no-var
  var activeSyncs: Record<string, Promise<SyncResult>> | undefined;
}


// POST - Iniciar sincronización manual o automática (cron)
export async function POST(request: NextRequest) {
  try {
    // Verificar si es una solicitud de cron job
    const isCronJob = isCronRequest(request);
    
    let user = null;
    
    if (!isCronJob) {
      // Para sincronización manual, validar usuario
      user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      // Solo administradores y coordinadores pueden iniciar sincronización manual
      const allowedRoles = [
        'ADMIN',
        'PRESCHOOL_COORDINATOR',
        'ELEMENTARY_COORDINATOR',
        'MIDDLE_SCHOOL_COORDINATOR',
        'HIGH_SCHOOL_COORDINATOR',
        'PSYCHOLOGY'
      ];

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
      }
    } else {
      console.log('🤖 Cron job sync initiated at:', new Date().toISOString());
    }

    // Validar configuración del servicio de Phidias
    const configValidation = phidiasApiService.validateConfiguration();
    if (!configValidation.valid) {
      return NextResponse.json({
        error: 'Configuración de Phidias incompleta',
        details: configValidation.errors
      }, { status: 400 });
    }

    // Obtener opciones del body
    const body = await request.json().catch(() => ({}));
    const { specificLevel, specificStudentId } = body;

    // Iniciar sincronización en segundo plano
    const syncOptions = {
      triggeredBy: user?.id || 'system-cron',
      specificLevel,
      specificStudentId
    };

    let syncPromise: Promise<SyncResult>;
    
    if (specificStudentId) {
      syncPromise = phidiasSyncService.syncSpecificStudent(specificStudentId, user?.id || 'system-cron');
    } else if (specificLevel) {
      syncPromise = phidiasSyncService.syncSpecificLevel(specificLevel, user?.id || 'system-cron');
    } else {
      syncPromise = phidiasSyncService.syncWithPhidias(syncOptions);
    }

    // Retornar inmediatamente con el ID del proceso
    const syncId = Date.now().toString();
    
    // Store the promise in a simple in-memory store (en producción usar Redis)
    global.activeSyncs = global.activeSyncs || {};
    global.activeSyncs[syncId] = syncPromise;

    // Limpiar el sync después de 1 hora
    setTimeout(() => {
      if (global.activeSyncs?.[syncId]) {
        delete global.activeSyncs[syncId];
      }
    }, 3600000); // 1 hora

    const messagePrefix = isCronJob ? '🤖 Sincronización automática iniciada' : 'Sincronización manual iniciada';
    const messageDetails = specificStudentId ? ` para estudiante ${specificStudentId}` : 
                          specificLevel ? ` para nivel ${specificLevel}` : '';

    return NextResponse.json({
      message: `${messagePrefix}${messageDetails}`,
      syncId,
      status: 'started',
      triggeredBy: user?.id || 'system-cron',
      type: isCronJob ? 'automatic' : 'manual',
      options: syncOptions
    }, { status: 202 });

  } catch (error) {
    console.error('Error initiating sync:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de sincronización o historial
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const syncId = searchParams.get('syncId');
    const history = searchParams.get('history') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (history) {
      // Retornar historial de sincronizaciones
      const syncHistory = await phidiasSyncService.getSyncHistory(limit);
      return NextResponse.json(syncHistory);
    }

    if (syncId) {
      // Verificar estado de sincronización específica
      const activeSyncs = global.activeSyncs || {};
      
      if (syncId in activeSyncs) {
        try {
          const result = await Promise.race([
            activeSyncs[syncId],
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 1000)
            )
          ]);
          
          // Si llegamos aquí, la sincronización terminó
          delete activeSyncs[syncId];
          return NextResponse.json({
            status: 'completed',
            result
          });
        } catch (error) {
          if (error instanceof Error && error.message === 'Timeout') {
            return NextResponse.json({
              status: 'running',
              message: 'Sincronización en progreso'
            });
          }
          
          // Error en la sincronización
          delete activeSyncs[syncId];
          return NextResponse.json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      } else {
        // Buscar en el historial si no está en activos
        const lastSync = await phidiasSyncService.getLastSyncStats();
        if (lastSync) {
          return NextResponse.json({
            status: 'completed',
            result: lastSync
          });
        }
        
        return NextResponse.json({
          status: 'not_found',
          message: 'Sincronización no encontrada'
        }, { status: 404 });
      }
    }

    // Si no se especifica syncId, retornar último estado
    const lastSync = await phidiasSyncService.getLastSyncStats();
    return NextResponse.json(lastSync);

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar sincronización (si es posible)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden cancelar sincronizaciones
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const syncId = searchParams.get('syncId');

    if (!syncId) {
      return NextResponse.json(
        { error: 'ID de sincronización requerido' },
        { status: 400 }
      );
    }

    const activeSyncs = global.activeSyncs || {};
    
    if (syncId in activeSyncs) {
      // Remover de sincronizaciones activas
      delete activeSyncs[syncId];
      
      return NextResponse.json({
        message: 'Sincronización cancelada',
        syncId
      });
    }

    return NextResponse.json({
      message: 'Sincronización no encontrada o ya completada',
      syncId
    }, { status: 404 });

  } catch (error) {
    console.error('Error canceling sync:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}