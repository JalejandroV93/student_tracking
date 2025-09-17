import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { asignarNivelAcademico } from '@/lib/academic-level-utils';

export async function GET() {
  try {
    // Verificar año académico activo
    const activeYear = await prisma.schoolYear.findFirst({
      where: { isActive: true }
    });

    if (!activeYear) {
      return NextResponse.json({ 
        error: 'No hay año académico activo',
        totalSchoolYears: await prisma.schoolYear.count()
      });
    }

    // Total de estudiantes
    const totalStudents = await prisma.estudiantes.count();
    
    // Estudiantes en año activo
    const studentsInActiveYear = await prisma.estudiantes.count({
      where: { school_year_id: activeYear.id }
    });

    // Estudiantes con sección
    const studentsWithSection = await prisma.estudiantes.count({
      where: { 
        school_year_id: activeYear.id,
        seccion: { not: null }
      }
    });

    // Secciones distintas en el año activo
    const sectionsData = await prisma.estudiantes.findMany({
      where: { 
        school_year_id: activeYear.id,
        seccion: { not: null }
      },
      select: { seccion: true },
      distinct: ['seccion']
    });

    // Analizar por nivel
    const levelAnalysis: Record<string, { sections: string[], count: number }> = {};
    
    for (const section of sectionsData) {
      if (section.seccion) {
        const level = asignarNivelAcademico(section.seccion);
        
        if (!levelAnalysis[level]) {
          levelAnalysis[level] = { sections: [], count: 0 };
        }
        
        levelAnalysis[level].sections.push(section.seccion);
        
        // Contar estudiantes en esta sección
        const sectionCount = await prisma.estudiantes.count({
          where: {
            school_year_id: activeYear.id,
            seccion: section.seccion
          }
        });
        
        levelAnalysis[level].count += sectionCount;
      }
    }

    return NextResponse.json({
      activeSchoolYear: {
        id: activeYear.id,
        name: activeYear.name,
        isActive: activeYear.isActive
      },
      counts: {
        totalStudents,
        studentsInActiveYear,
        studentsWithSection
      },
      levelAnalysis,
      allSections: sectionsData.map(s => s.seccion).sort()
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Error interno', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}