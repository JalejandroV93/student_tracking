// src/app/api/v1/phidias/manual-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { phidiasApiService } from '@/services/phidias-api.service';
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

// Almacén en memoria para sincronizaciones activas
declare global {
  var manualSyncs: Record<string, Promise<SyncResult>> | undefined;
}

// POST - Iniciar sincronización manual
export async function POST(request: NextRequest) {
  try {
    // Validar Bearer token
    if (!validateBearerToken(request)) {
      return NextResponse.json({ error: 'Token de autorización inválido' }, { status: 401 });
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
    const { 
      syncAll = false, 
      specificLevel, 
      specificSection, 
      specificStudentId,
      async = true 
    } = body;

    // Validar parámetros
    if (!syncAll && !specificLevel && !specificSection && !specificStudentId) {
      return NextResponse.json({
        error: 'Debe especificar al menos uno: syncAll=true, specificLevel, specificSection, o specificStudentId'
      }, { status: 400 });
    }

    // Generar ID único para esta sincronización
    const syncId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Configurar opciones de sincronización
    const syncOptions = {
      triggeredBy: 'manual-api',
      specificLevel: specificLevel || specificSection, // specificSection se mapea a specificLevel
      specificStudentId
    };

    let syncPromise: Promise<SyncResult>;
    
    if (specificStudentId) {
      syncPromise = phidiasSyncService.syncSpecificStudent(specificStudentId, 'manual-api');
    } else if (specificLevel || specificSection) {
      syncPromise = phidiasSyncService.syncSpecificLevel(specificLevel || specificSection, 'manual-api');
    } else {
      // Sincronización completa
      syncPromise = phidiasSyncService.syncWithPhidias(syncOptions);
    }

    if (async) {
      // Modo asíncrono: retornar inmediatamente con el ID del proceso
      global.manualSyncs = global.manualSyncs || {};
      global.manualSyncs[syncId] = syncPromise;

      // Limpiar el sync después de 2 horas
      setTimeout(() => {
        if (global.manualSyncs?.[syncId]) {
          delete global.manualSyncs[syncId];
        }
      }, 7200000); // 2 horas

      const scopeMessage = specificStudentId ? ` para estudiante ${specificStudentId}` :
                          (specificLevel || specificSection) ? ` para nivel/sección ${specificLevel || specificSection}` :
                          ' completa';

      return NextResponse.json({
        success: true,
        message: `Sincronización manual iniciada${scopeMessage}`,
        syncId,
        status: 'started',
        mode: 'async',
        options: syncOptions,
        checkStatusUrl: `/api/v1/phidias/manual-sync/status/${syncId}`
      }, { status: 202 });
    } else {
      // Modo síncrono: esperar a que termine la sincronización
      const result = await syncPromise;
      
      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Sincronización completada exitosamente' : 'Sincronización completada con errores',
        syncId,
        status: 'completed',
        mode: 'sync',
        result: {
          studentsProcessed: result.studentsProcessed,
          recordsCreated: result.recordsCreated,
          recordsUpdated: result.recordsUpdated,
          duration: result.duration,
          errors: result.errors
        }
      }, { status: result.success ? 200 : 207 }); // 207 Multi-Status para éxito parcial
    }

  } catch (error) {
    console.error('Error initiating manual sync:', error);
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

// GET - Obtener estado de sincronización específica
export async function GET(request: NextRequest) {
  try {
    // Validar Bearer token
    if (!validateBearerToken(request)) {
      return NextResponse.json({ error: 'Token de autorización inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const syncId = searchParams.get('syncId');

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
          result: {
            success: (result as SyncResult).success,
            studentsProcessed: (result as SyncResult).studentsProcessed,
            recordsCreated: (result as SyncResult).recordsCreated,
            recordsUpdated: (result as SyncResult).recordsUpdated,
            duration: (result as SyncResult).duration,
            errors: (result as SyncResult).errors
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout') {
          return NextResponse.json({
            success: true,
            syncId,
            status: 'running',
            message: 'Sincronización en progreso'
          });
        }
        
        // Error en la sincronización
        delete manualSyncs[syncId];
        return NextResponse.json({
          success: false,
          syncId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    } else {
      // Buscar en el historial si no está en activos
      const lastSync = await phidiasSyncService.getLastSyncStats();
      if (lastSync) {
        return NextResponse.json({
          success: true,
          syncId,
          status: 'completed',
          result: lastSync,
          message: 'Resultado obtenido del historial (sincronización ya completada)'
        });
      }
      
      return NextResponse.json({
        success: false,
        syncId,
        status: 'not_found',
        message: 'Sincronización no encontrada'
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