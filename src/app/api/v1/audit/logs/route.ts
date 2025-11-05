// src/app/api/v1/audit/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { auditService } from '@/services/audit.service';

/**
 * GET /api/v1/audit/logs
 * Obtiene logs de auditoría con filtros
 * Solo accesible para administradores
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver logs de auditoría
    if (user.role !== 'ADMIN') {
      // Log access denied
      await auditService.logAccessDenied(
        user.id,
        user.username,
        '/api/v1/audit/logs',
        'Solo administradores pueden acceder a logs de auditoría',
        request
      );

      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const userId = searchParams.get('userId') || undefined;
    const username = searchParams.get('username') || undefined;
    const action = searchParams.get('action') as any || undefined;
    const entityType = searchParams.get('entityType') as any || undefined;
    const status = searchParams.get('status') as any || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Date filters
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await auditService.getLogs({
      userId,
      username,
      action,
      entityType,
      status,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
