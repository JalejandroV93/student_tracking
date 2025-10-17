import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { Role, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const trimestre = searchParams.get('trimestre');
    const nivel = searchParams.get('nivel');
    const tipoFalta = searchParams.get('tipoFalta');
    const schoolYearId = searchParams.get('schoolYearId');

    // Build date filters
    const dateFilters: Record<string, Date> = {};
    if (startDate) {
      dateFilters.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilters.lte = new Date(endDate);
    }

    // Build base filters for role-based access
    const baseFilters: Prisma.FaltasWhereInput = {
      ...(Object.keys(dateFilters).length > 0 && { fecha: dateFilters }),
      ...(trimestre && { trimestre }),
      ...(nivel && { nivel }),
      ...(tipoFalta && { tipo_falta: tipoFalta }),
      ...(schoolYearId && { school_year_id: parseInt(schoolYearId) }),
    };

    // Apply role-based filtering
    if (user.role !== Role.ADMIN) {
      switch (user.role) {
        case Role.PRESCHOOL_COORDINATOR:
          baseFilters.nivel = 'Preschool';
          break;
        case Role.ELEMENTARY_COORDINATOR:
          baseFilters.nivel = 'Elementary';
          break;
        case Role.MIDDLE_SCHOOL_COORDINATOR:
          baseFilters.nivel = 'Middle School';
          break;
        case Role.HIGH_SCHOOL_COORDINATOR:
          baseFilters.nivel = 'High School';
          break;
        case Role.PSYCHOLOGY:
          // Psychology can see all
          break;
        case Role.TEACHER:
          // Teachers only see their assigned groups
          if (user.groupCode) {
            baseFilters.seccion = user.groupCode;
          } else {
            // If no group code, return empty data
            return NextResponse.json([]);
          }
          break;
        default:
          return NextResponse.json({ error: 'Sin permisos para acceder a datos de faltas' }, { status: 403 });
      }
    }

    // Get raw infraction data with related student information
    const rawData = await prisma.faltas.findMany({
      where: baseFilters,
      select: {
        nivel: true,
        tipo_falta: true,
        codigo_estudiante: true,
        seccion: true,
        numero_falta: true,
        descripcion_falta: true,
        autor: true,
        fecha: true,
        trimestre: true,
        estudiante: {
          select: {
            nombre: true,
            firstname: true,
            lastname: true,
          }
        }
      },
      orderBy: [
        { fecha: 'desc' },
        { numero_falta: 'desc' }
      ]
    });

    // Format the data according to the requested fields
    const formattedData = rawData.map(falta => {
      // Build student name from available fields
      let nombreEstudiante = 'No encontrado';
      if (falta.estudiante) {
        if (falta.estudiante.firstname && falta.estudiante.lastname) {
          nombreEstudiante = `${falta.estudiante.firstname} ${falta.estudiante.lastname}`;
        } else if (falta.estudiante.nombre) {
          nombreEstudiante = falta.estudiante.nombre;
        }
      }

      return {
        nivel_academico: falta.nivel,
        tipo_falta: falta.tipo_falta,
        codigo_estudiante: falta.codigo_estudiante,
        nombre_estudiante: nombreEstudiante,
        grado: falta.seccion,
        numero_falta: falta.numero_falta,
        descripcion: falta.descripcion_falta,
        autor: falta.autor,
        fecha: falta.fecha?.toISOString().split('T')[0], // Format as YYYY-MM-DD
        trimestre: falta.trimestre
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo datos en crudo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}