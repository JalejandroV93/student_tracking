// src/app/api/v1/cron/sync-phidias/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { phidiasApiService } from '@/services/phidias-api.service';

// Verificar si la solicitud proviene de un cron job autorizado
function isCronRequestAuthorized(request: NextRequest): boolean {
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

// GET - Endpoint para cron jobs de sincronización automática
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar autorización del cron job
    if (!isCronRequestAuthorized(request)) {
      console.warn('🚫 Unauthorized cron job attempt from:', {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        error: 'Unauthorized cron job request' 
      }, { status: 401 });
    }

    console.log('🤖 Starting automated daily sync at:', new Date().toISOString());

    // Validar configuración del servicio de Phidias
    const configValidation = phidiasApiService.validateConfiguration();
    if (!configValidation.valid) {
      console.error('❌ Phidias configuration validation failed:', configValidation.errors);
      
      return NextResponse.json({
        success: false,
        error: 'Configuración de Phidias incompleta',
        details: configValidation.errors,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Ejecutar sincronización completa
    const syncResult = await phidiasSyncService.syncWithPhidias({
      triggeredBy: 'system-cron-daily'
    });

    const duration = Math.round((Date.now() - startTime) / 1000);
    
    if (syncResult.success) {
      console.log('✅ Daily sync completed successfully:', {
        studentsProcessed: syncResult.studentsProcessed,
        recordsCreated: syncResult.recordsCreated,
        recordsUpdated: syncResult.recordsUpdated,
        duration: `${duration}s`,
        errors: syncResult.errors?.length || 0
      });

      return NextResponse.json({
        success: true,
        message: '🎉 Sincronización diaria completada exitosamente',
        results: {
          studentsProcessed: syncResult.studentsProcessed,
          recordsCreated: syncResult.recordsCreated,
          recordsUpdated: syncResult.recordsUpdated,
          duration,
          errorsCount: syncResult.errors?.length || 0,
          logId: syncResult.logId
        },
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Daily sync failed:', {
        error: syncResult.errors,
        duration: `${duration}s`
      });

      return NextResponse.json({
        success: false,
        message: '⚠️ Sincronización diaria falló',
        error: syncResult.errors || 'Error desconocido',
        duration,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('💥 Critical error in daily sync:', {
      error: errorMessage,
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      message: '💥 Error crítico en sincronización diaria',
      error: errorMessage,
      duration,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST - Endpoint alternativo para sistemas que prefieren POST
export async function POST(request: NextRequest) {
  return GET(request);
}