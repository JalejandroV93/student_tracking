// src/app/api/v1/phidias/manual-sync/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { phidiasSyncService } from '@/services/phidias-sync.service';

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

  // Obtener estadísticas por nivel académico
  const sectionStats = await Promise.all(
    seguimientosConfig.map(async (config) => {
      // Contar estudiantes por nivel
      const studentsCount = await prisma.estudiantes.count({
        where: {
          school_year_id: activeSchoolYear.id,
          OR: [
            { seccion: config.nivel_academico },
            { grado: { contains: config.nivel_academico } }
          ]
        }
      });

      // Contar faltas sincronizadas desde la última sincronización exitosa
      const syncedInfractionsCount = await prisma.faltas.count({
        where: {
          school_year_id: activeSchoolYear.id,
          tipo_falta: config.tipo_falta,
          nivel: config.nivel_academico,
          ...(lastSuccessfulSync?.completedAt ? {
            created_at: { gte: lastSuccessfulSync.completedAt }
          } : {})
        }
      });

      // Obtener la fecha de la última falta sincronizada para este nivel
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
        syncedInfractionsCount,
        lastInfractionDate: lastInfraction?.fecha_ultima_edicion,
        needsSync: studentsCount > 0 && (
          !lastSuccessfulSync || 
          (lastInfraction?.fecha_ultima_edicion && lastInfraction.fecha_ultima_edicion < new Date(Date.now() - 24 * 60 * 60 * 1000)) // Más de 24 horas
        )
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
      totalStudents: sectionStats.reduce((sum, s) => sum + s.studentsCount, 0)
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