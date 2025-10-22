// src/app/api/v1/phidias/manual-sync/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { phidiasSyncService } from '@/services/phidias-sync.service';
import { phidiasApiService } from '@/services/phidias-api.service';

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

// Función helper para obtener conteos de sincronización usando la lógica de consolidate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSyncCounts(config: any, activeSchoolYear: any) {
  try {
    // Contar registros locales para este seguimiento (como en consolidate)
    const syncedInfractionsCount = await prisma.faltas.count({
      where: {
        school_year_id: activeSchoolYear.id,
        tipo_falta: config.tipo_falta,
        nivel: config.nivel_academico
      }
    });

    // Obtener conteo total desde Phidias usando la misma lógica de consolidate
    const phidiasResult = await phidiasApiService.getConsolidatedRecords(config.phidias_id);
    
    let phidiasCount = 0;
    let pendingInfractionsCount = 0;
    let needsSync = false;
    let status: 'synced' | 'out_of_sync' | 'error' = 'error';

    if (phidiasResult.success) {
      phidiasCount = phidiasResult.count || 0;
      pendingInfractionsCount = Math.max(0, phidiasCount - syncedInfractionsCount);
      needsSync = syncedInfractionsCount !== phidiasCount;
      status = needsSync ? 'out_of_sync' : 'synced';
    } else {
      // En caso de error, usar lógica de fallback
      needsSync = true;
      status = 'error';
    }

    return {
      syncedInfractionsCount,
      pendingInfractionsCount,
      needsSync,
      status,
      phidiasCount,
      error: phidiasResult.success ? undefined : phidiasResult.error
    };
  } catch (error) {
    console.error(`Error getting sync counts for poll ${config.phidias_id}:`, error);
    return {
      syncedInfractionsCount: 0,
      pendingInfractionsCount: 0,
      needsSync: true,
      status: 'error' as const,
      phidiasCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Función para obtener secciones no sincronizadas
async function getUnsyncedSections() {
  // Obtener el año académico activo
  const activeSchoolYear = await prisma.schoolYear.findFirst({
    where: { isActive: true }
  });

  if (!activeSchoolYear) {
    throw new Error('No se encontró un año académico activo');
  }

  // Obtener configuraciones activas de seguimientos
  const seguimientosConfig = await phidiasSyncService.getActiveSeguimientosConfig();
  
  // Obtener la última sincronización exitosa
  const lastSuccessfulSync = await prisma.phidiasSyncLog.findFirst({
    where: { 
      status: 'success',
      completedAt: { not: null }
    },
    orderBy: { completedAt: 'desc' }
  });

  // Obtener todos los estudiantes para conteo por nivel
  const allStudents = await prisma.estudiantes.findMany({
    where: {
      school_year_id: activeSchoolYear.id
    },
    select: {
      id: true,
      codigo: true,
      seccion: true,
      grado: true
    }
  });

  // Obtener estadísticas por nivel académico usando lógica de consolidate
  const sectionStats = await Promise.all(
    seguimientosConfig.map(async (config) => {
      // Filtrar estudiantes para este nivel
      const studentsForLevel = phidiasSyncService.filterStudentsByLevel(
        allStudents,
        config.nivel_academico
      );
      const studentsCount = studentsForLevel.length;

      // Usar la nueva función que replica la lógica de consolidate
      const syncCounts = await getSyncCounts(config, activeSchoolYear);

      // Obtener la fecha de la última falta para este nivel
      const lastInfraction = await prisma.faltas.findFirst({
        where: {
          school_year_id: activeSchoolYear.id,
          tipo_falta: config.tipo_falta,
          nivel: config.nivel_academico
        },
        orderBy: { fecha_ultima_edicion: 'desc' },
        select: { fecha_ultima_edicion: true }
      });

      return {
        nivel: config.nivel_academico,
        tipoFalta: config.tipo_falta,
        pollId: config.phidias_id,
        configName: config.name,
        studentsCount,
        syncedInfractionsCount: syncCounts.syncedInfractionsCount,
        pendingInfractionsCount: syncCounts.pendingInfractionsCount,
        phidiasCount: syncCounts.phidiasCount,
        lastInfractionDate: lastInfraction?.fecha_ultima_edicion,
        needsSync: syncCounts.needsSync,
        status: syncCounts.status,
        error: syncCounts.error
      };
    })
  );

  return {
    activeSchoolYear: {
      id: activeSchoolYear.id,
      name: activeSchoolYear.name,
      isActive: activeSchoolYear.isActive
    },
    lastSuccessfulSync: lastSuccessfulSync ? {
      id: lastSuccessfulSync.id,
      completedAt: lastSuccessfulSync.completedAt,
      studentsProcessed: lastSuccessfulSync.studentsProcessed,
      recordsCreated: lastSuccessfulSync.recordsCreated,
      recordsUpdated: lastSuccessfulSync.recordsUpdated
    } : null,
    sections: sectionStats,
    summary: {
      totalSections: sectionStats.length,
      sectionsNeedingSync: sectionStats.filter(s => s.needsSync).length,
      sectionsSynced: sectionStats.filter(s => s.status === 'synced').length,
      sectionsWithErrors: sectionStats.filter(s => s.status === 'error').length,
      totalStudents: sectionStats.reduce((sum, s) => sum + s.studentsCount, 0),
      totalSyncedInfractions: sectionStats.reduce((sum, s) => sum + s.syncedInfractionsCount, 0),
      totalPendingInfractions: sectionStats.reduce((sum, s) => sum + s.pendingInfractionsCount, 0),
      totalPhidiasInfractions: sectionStats.reduce((sum, s) => sum + (s.phidiasCount || 0), 0)
    }
  };
}

// GET - Obtener estado de sincronización por secciones
export async function GET(request: NextRequest) {
  try {
    // Validar Bearer token
    if (!validateBearerToken(request)) {
      return NextResponse.json({ error: 'Token de autorización inválido' }, { status: 401 });
    }

    const unsyncedData = await getUnsyncedSections();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: unsyncedData
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
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