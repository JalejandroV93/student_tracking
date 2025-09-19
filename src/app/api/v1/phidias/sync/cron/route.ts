// src/app/api/v1/phidias/sync/cron/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { phidiasApiService } from '@/services/phidias-api.service';

export async function POST(request: NextRequest) {
  try {
    // Verificar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🕒 Iniciando sincronización automática diaria con Phidias...');

    // Validar configuración del servicio de Phidias
    const configValidation = phidiasApiService.validateConfiguration();
    if (!configValidation.valid) {
      console.error('❌ Configuración de Phidias incompleta:', configValidation.errors);
      return NextResponse.json({
        error: 'Configuración de Phidias incompleta',
        details: configValidation.errors
      }, { status: 400 });
    }

    // Iniciar sincronización automática
    const syncPromise = phidiasSyncService.syncWithPhidias({
      triggeredBy: 'cron-daily'
    });

    // No esperamos la respuesta completa para evitar timeouts
    syncPromise
      .then((result) => {
        console.log('✅ Sincronización automática completada exitosamente:', {
          success: result.success,
          studentsProcessed: result.studentsProcessed,
          recordsCreated: result.recordsCreated,
          recordsUpdated: result.recordsUpdated,
          duration: result.duration
        });
      })
      .catch((error) => {
        console.error('❌ Error en sincronización automática:', error);
      });

    return NextResponse.json({
      message: 'Sincronización automática iniciada exitosamente',
      timestamp: new Date().toISOString(),
      triggeredBy: 'cron-daily'
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Error crítico en cron de sincronización:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}