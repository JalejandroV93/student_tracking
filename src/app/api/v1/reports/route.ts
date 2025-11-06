import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { DatabaseFilters, FaltasGroupByResult, FormattedCategoryData, FormattedTeacherData, MonthlyTrendRawResult } from '@/types/api-reports';
import { Prisma, Role } from '@/prismacl/client';
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
    
    // Don't add default date filters - if no dates provided, show all records

    // Build base filters for role-based access
    const baseFilters: DatabaseFilters = {
      ...(Object.keys(dateFilters).length > 0 && { fecha: dateFilters }),
      ...(trimestre && { trimestre }),
      ...(nivel && { nivel }),
      ...(tipoFalta && { tipo_falta: tipoFalta }),
      ...(schoolYearId && { school_year_id: parseInt(schoolYearId) }),
    };

    console.log('Debug - Base filters before role filtering:', baseFilters);
    
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
          // Psychology can see all but we might want to limit to Type II
          break;
        case Role.TEACHER:
          // Teachers only see their assigned groups
          if (user.groupCode) {
            baseFilters.seccion = user.groupCode;
          } else {
            // If no group code, return empty data
            return NextResponse.json({
              summary: { total: 0, tipoI: 0, tipoII: 0, tipoIII: 0 },
              faltasPorGrado: [],
              faltasPorNivel: [],
              faltasMasRecurrentes: { porGrado: [], porNivel: [] },
              docentesTopFaltas: [],
              tendenciaMensual: []
            });
          }
          break;
        default:
          return NextResponse.json({ error: 'Sin permisos para generar reportes' }, { status: 403 });
      }
    }

    
    
    // 1. Summary statistics
    const [totalFaltas, faltasTipoI, faltasTipoII, faltasTipoIII] = await Promise.all([
      prisma.faltas.count({ where: baseFilters as Prisma.FaltasWhereInput }),
      prisma.faltas.count({ where: { ...baseFilters, tipo_falta: 'Tipo I' } as Prisma.FaltasWhereInput }),
      prisma.faltas.count({ where: { ...baseFilters, tipo_falta: 'Tipo II' } as Prisma.FaltasWhereInput }),
      prisma.faltas.count({ where: { ...baseFilters, tipo_falta: 'Tipo III' } as Prisma.FaltasWhereInput })
    ]);
    
    console.log('Debug - Count results:', { totalFaltas, faltasTipoI, faltasTipoII, faltasTipoIII });

    // 2. Faltas por sección (simplified approach)
    const faltasPorGrado = await prisma.faltas.groupBy({
      by: ['seccion', 'tipo_falta'],
      where: baseFilters as Prisma.FaltasWhereInput,
      _count: {
        hash: true, // Count using hash field instead of _all
      },
    }) as unknown as FaltasGroupByResult[];

    // 3. Faltas por nivel
    const faltasPorNivel = await prisma.faltas.groupBy({
      by: ['nivel', 'tipo_falta'],
      where: baseFilters as Prisma.FaltasWhereInput,
      _count: {
        hash: true, // Count using hash field instead of _all
      },
    }) as unknown as FaltasGroupByResult[];

    // 4. Faltas más recurrentes por sección
    const faltasRecurrentesPorGrado = await prisma.faltas.groupBy({
      by: ['seccion', 'descripcion_falta'],
      where: baseFilters as Prisma.FaltasWhereInput,
      _count: {
        hash: true, // Count using hash field instead of _all
      },
      orderBy: {
        _count: {
          hash: 'desc',
        },
      },
      take: 10,
    }) as unknown as FaltasGroupByResult[];

    // 5. Faltas más recurrentes por nivel
    const faltasRecurrentesPorNivel = await prisma.faltas.groupBy({
      by: ['nivel', 'descripcion_falta'],
      where: baseFilters as Prisma.FaltasWhereInput,
      _count: {
        hash: true, // Count using hash field instead of _all
      },
      orderBy: {
        _count: {
          hash: 'desc',
        },
      },
      take: 10,
    }) as unknown as FaltasGroupByResult[];

    // 6. Top docentes que registran faltas
    const docentesTopFaltas = await prisma.faltas.groupBy({
      by: ['autor', 'tipo_falta'],
      where: {
        ...baseFilters,
        autor: {
          not: null,
        },
      } as Prisma.FaltasWhereInput,
      _count: {
        hash: true, // Count using hash field instead of _all
      },
      orderBy: {
        _count: {
          hash: 'desc',
        },
      },
      take: 15,
    }) as unknown as FaltasGroupByResult[];


    // Get monthly trend data with proper filtering
    let monthlyTrendQuery = `
      SELECT 
        DATE_TRUNC('month', fecha) as mes,
        tipo_falta,
        COUNT(*) as cantidad
      FROM "Faltas"
      WHERE fecha IS NOT NULL
    `;
    
    const queryParams: (Date | string | number)[] = [];
    
    // Add date filters if provided
    if (dateFilters.gte) {
      monthlyTrendQuery += ` AND fecha >= $${queryParams.length + 1}`;
      queryParams.push(dateFilters.gte);
    }
    
    if (dateFilters.lte) {
      monthlyTrendQuery += ` AND fecha <= $${queryParams.length + 1}`;
      queryParams.push(dateFilters.lte);
    }
    
    // Don't add default date filter - if no dates provided, show all records
    
    if (nivel) {
      monthlyTrendQuery += ` AND nivel = $${queryParams.length + 1}`;
      queryParams.push(nivel);
    }
    
    if (trimestre) {
      monthlyTrendQuery += ` AND trimestre = $${queryParams.length + 1}`;
      queryParams.push(trimestre);
    }
    
    if (tipoFalta) {
      monthlyTrendQuery += ` AND tipo_falta = $${queryParams.length + 1}`;
      queryParams.push(tipoFalta);
    }
    
    if (schoolYearId) {
      monthlyTrendQuery += ` AND school_year_id = $${queryParams.length + 1}`;
      queryParams.push(parseInt(schoolYearId));
    }
    
    monthlyTrendQuery += `
      GROUP BY DATE_TRUNC('month', fecha), tipo_falta
      ORDER BY mes ASC
    `;

    const monthlyTrend = await prisma.$queryRawUnsafe(monthlyTrendQuery, ...queryParams) as MonthlyTrendRawResult[];

    // Convert BigInt to Number in monthly trend data
    const formattedMonthlyTrend = monthlyTrend.map(item => ({
      mes: item.mes,
      tipo_falta: item.tipo_falta,
      cantidad: typeof item.cantidad === 'bigint' ? Number(item.cantidad) : item.cantidad,
    }));

    // Format the data for easier consumption in the frontend
    const formatFaltasPorCategoria = (data: FaltasGroupByResult[]): FormattedCategoryData[] => {
      const result: Record<string, { tipoI: number; tipoII: number; tipoIII: number; total: number }> = {};
      data.forEach((item) => {
        // Use seccion (grado) first, then nivel, with a proper fallback
        const key = item.seccion || item.nivel || 'Sin clasificar';
        if (!result[key]) {
          result[key] = { tipoI: 0, tipoII: 0, tipoIII: 0, total: 0 };
        }
        
        // Parse the tipo_falta properly
        const count = item._count?.hash || 0;
        if (item.tipo_falta === 'Tipo I') {
          result[key].tipoI += count;
        } else if (item.tipo_falta === 'Tipo II') {
          result[key].tipoII += count;
        } else if (item.tipo_falta === 'Tipo III') {
          result[key].tipoIII += count;
        }
        result[key].total += count;
      });
      
      // Sort by total descending and return top entries
      return Object.entries(result)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total);
    };

    const formatDocentesTop = (data: FaltasGroupByResult[]): FormattedTeacherData[] => {
      const result: Record<string, { autor: string; tipoI: number; tipoII: number; tipoIII: number; total: number }> = {};
      data.forEach((item) => {
        const autor = item.autor || 'Sin autor';
        if (!result[autor]) {
          result[autor] = { autor, tipoI: 0, tipoII: 0, tipoIII: 0, total: 0 };
        }
        
        // Parse the tipo_falta properly
        const count = item._count?.hash || 0;
        if (item.tipo_falta === 'Tipo I') {
          result[autor].tipoI += count;
        } else if (item.tipo_falta === 'Tipo II') {
          result[autor].tipoII += count;
        } else if (item.tipo_falta === 'Tipo III') {
          result[autor].tipoIII += count;
        }
        result[autor].total += count;
      });
      
      // Return sorted by total descending
      return Object.values(result).sort((a, b) => b.total - a.total);
    };

    const response = {
      summary: {
        total: totalFaltas,
        tipoI: faltasTipoI,
        tipoII: faltasTipoII,
        tipoIII: faltasTipoIII,
      },
      faltasPorGrado: formatFaltasPorCategoria(faltasPorGrado),
      faltasPorNivel: formatFaltasPorCategoria(faltasPorNivel),
      faltasMasRecurrentes: {
        porGrado: faltasRecurrentesPorGrado.map((item: FaltasGroupByResult) => ({
          grado: item.seccion || 'Sin sección',
          descripcion: item.descripcion_falta || 'Sin descripción',
          cantidad: item._count?.hash || 0,
        })).filter((item: { cantidad: number }) => item.cantidad > 0),
        porNivel: faltasRecurrentesPorNivel.map((item: FaltasGroupByResult) => ({
          nivel: item.nivel || 'Sin nivel',
          descripcion: item.descripcion_falta || 'Sin descripción',
          cantidad: item._count?.hash || 0,
        })).filter((item: { cantidad: number }) => item.cantidad > 0),
      },
      docentesTopFaltas: formatDocentesTop(docentesTopFaltas),
      tendenciaMensual: formattedMonthlyTrend,
      filters: {
        startDate,
        endDate,
        trimestre,
        nivel,
        tipoFalta,
        schoolYearId,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generando reporte:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}