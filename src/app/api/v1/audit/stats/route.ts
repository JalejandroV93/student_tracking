// src/app/api/v1/audit/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { auditService } from '@/services/audit.service';

/**
 * GET /api/v1/audit/stats
 * Obtiene estadísticas de auditoría
 * Solo accesible para administradores
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver estadísticas
    if (user.role !== 'ADMIN') {
      await auditService.logAccessDenied(
        user.id,
        user.username,
        '/api/v1/audit/stats',
        'Solo administradores pueden acceder a estadísticas de auditoría',
        request
      );

      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Date filters
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const userId = searchParams.get('userId') || undefined;

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const stats = await auditService.getStats({
      startDate,
      endDate,
      userId,
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
