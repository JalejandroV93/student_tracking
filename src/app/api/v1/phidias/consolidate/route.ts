// src/app/api/v1/phidias/consolidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { phidiasApiService } from '@/services/phidias-api.service';
import { SeguimientoStatus } from 'src/types/phidias';
// GET - Obtener estado de sincronización de seguimientos
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver el estado de sincronización
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get('schoolYearId');

    const whereClause: {
      school_year_id?: number;
      isActive?: boolean;
    } = { isActive: true };

    if (schoolYearId) {
      whereClause.school_year_id = parseInt(schoolYearId);
    } else {
      // Por defecto, mostrar solo del año académico activo
      const activeSchoolYear = await prisma.schoolYear.findFirst({
        where: { isActive: true }
      });
      
      if (activeSchoolYear) {
        whereClause.school_year_id = activeSchoolYear.id;
      }
    }

    // Obtener configuraciones de seguimientos activos
    const seguimientos = await prisma.phidiasSeguimiento.findMany({
      where: whereClause,
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { nivel_academico: 'asc' },
        { tipo_falta: 'asc' },
        { name: 'asc' }
      ]
    });

    const statusResults: SeguimientoStatus[] = [];

    // Obtener conteos locales y de Phidias para cada seguimiento
    for (const seguimiento of seguimientos) {
      try {
        // Contar registros locales para este seguimiento
        const localCount = await prisma.faltas.count({
          where: {
            school_year_id: seguimiento.school_year_id,
            tipo_falta: seguimiento.tipo_falta,
            nivel: seguimiento.nivel_academico
          }
        });

        // Obtener conteo de registros desde Phidias
        const phidiasResult = await phidiasApiService.getConsolidatedRecords(seguimiento.phidias_id);

        let phidiasCount = 0;
        let error: string | undefined;
        let status: 'synced' | 'out_of_sync' | 'error' = 'error';

        if (phidiasResult.success) {
          phidiasCount = phidiasResult.count || 0;
          status = localCount === phidiasCount ? 'synced' : 'out_of_sync';
        } else {
          error = phidiasResult.error;
          status = 'error';
        }

        statusResults.push({
          id: seguimiento.id,
          phidias_id: seguimiento.phidias_id,
          name: seguimiento.name,
          tipo_falta: seguimiento.tipo_falta,
          nivel_academico: seguimiento.nivel_academico,
          isActive: seguimiento.isActive,
          localCount,
          phidiasCount,
          status,
          error,
          lastChecked: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Error checking status for seguimiento ${seguimiento.phidias_id}:`, error);
        
        statusResults.push({
          id: seguimiento.id,
          phidias_id: seguimiento.phidias_id,
          name: seguimiento.name,
          tipo_falta: seguimiento.tipo_falta,
          nivel_academico: seguimiento.nivel_academico,
          isActive: seguimiento.isActive,
          localCount: 0,
          phidiasCount: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
          lastChecked: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      seguimientos: statusResults,
      summary: {
        total: statusResults.length,
        synced: statusResults.filter(s => s.status === 'synced').length,
        outOfSync: statusResults.filter(s => s.status === 'out_of_sync').length,
        errors: statusResults.filter(s => s.status === 'error').length,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching seguimientos status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}