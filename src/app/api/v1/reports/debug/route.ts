import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get basic stats about the database
    const totalFaltas = await prisma.faltas.count();
    const totalEstudiantes = await prisma.estudiantes.count();
    
    // Get sample of recent faltas
    const sampleFaltas = await prisma.faltas.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        hash: true,
        tipo_falta: true,
        fecha: true,
        nivel: true,
        seccion: true,
        autor: true,
        school_year_id: true,
        trimestre: true,
      }
    });

    // Get unique values for key fields
    const uniqueNiveles = await prisma.faltas.groupBy({
      by: ['nivel'],
      where: {
        nivel: {
          not: null
        }
      }
    });

    const uniqueSecciones = await prisma.faltas.groupBy({
      by: ['seccion'],
      where: {
        seccion: {
          not: null
        }
      }
    });

    const uniqueTiposFalta = await prisma.faltas.groupBy({
      by: ['tipo_falta'],
      where: {
        tipo_falta: {
          not: null
        }
      }
    });

    return NextResponse.json({
      totalFaltas,
      totalEstudiantes,
      sampleFaltas,
      uniqueNiveles: uniqueNiveles.map(n => n.nivel),
      uniqueSecciones: uniqueSecciones.map(s => s.seccion),
      uniqueTiposFalta: uniqueTiposFalta.map(t => t.tipo_falta),
      userRole: user.role,
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}