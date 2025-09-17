// src/app/api/v1/phidias/test/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { phidiasApiService } from '@/services/phidias-api.service';

// GET - Test de conectividad con Phidias API
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden hacer test de conectividad
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const startTime = Date.now();

    // Validar configuración
    const configValidation = phidiasApiService.validateConfiguration();
    if (!configValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Configuración incompleta',
        details: configValidation.errors,
        duration: Date.now() - startTime
      }, { status: 400 });
    }

    // Test de conectividad
    const connectionTest = await phidiasApiService.testConnection();
    const duration = Date.now() - startTime;

    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con Phidias API',
        duration,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        duration,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing Phidias connection:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}