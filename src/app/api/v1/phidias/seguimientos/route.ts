// src/app/api/v1/phidias/seguimientos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

// GET - Obtener configuraciones de seguimientos
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver las configuraciones
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get('schoolYearId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const whereClause: {
      school_year_id?: number;
      isActive?: boolean;
    } = {};
    
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

    if (activeOnly) {
      whereClause.isActive = true;
    }

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

    return NextResponse.json(seguimientos);

  } catch (error) {
    console.error('Error fetching seguimientos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva configuración de seguimiento
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden crear configuraciones
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      phidias_id,
      name,
      description,
      tipo_falta,
      nivel_academico,
      school_year_id,
      isActive
    } = body;

    // Validaciones
    if (!phidias_id || !name || !tipo_falta || !nivel_academico || !school_year_id) {
      return NextResponse.json(
        { error: 'Campos requeridos: phidias_id, name, tipo_falta, nivel_academico, school_year_id' },
        { status: 400 }
      );
    }

    // Validar que el año académico existe
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: parseInt(school_year_id) }
    });

    if (!schoolYear) {
      return NextResponse.json(
        { error: 'Año académico no encontrado' },
        { status: 400 }
      );
    }

    // Validar que no existe ya un seguimiento con el mismo phidias_id para este año
    const existingSeguimiento = await prisma.phidiasSeguimiento.findFirst({
      where: {
        phidias_id: parseInt(phidias_id),
        school_year_id: parseInt(school_year_id)
      }
    });

    if (existingSeguimiento) {
      return NextResponse.json(
        { error: 'Ya existe un seguimiento con este ID de Phidias para este año académico' },
        { status: 400 }
      );
    }

    // Validar tipo_falta
    const tiposFaltaValidos = ['Tipo I', 'Tipo II', 'Tipo III'];
    if (!tiposFaltaValidos.includes(tipo_falta)) {
      return NextResponse.json(
        { error: 'Tipo de falta debe ser: Tipo I, Tipo II, o Tipo III' },
        { status: 400 }
      );
    }

    // Validar nivel_academico
    const nivelesValidos = ['Preschool', 'Elementary', 'Middle School', 'High School'];
    if (!nivelesValidos.includes(nivel_academico)) {
      return NextResponse.json(
        { error: 'Nivel académico debe ser: Preschool, Elementary, Middle School, o High School' },
        { status: 400 }
      );
    }

    const nuevoSeguimiento = await prisma.phidiasSeguimiento.create({
      data: {
        phidias_id: parseInt(phidias_id),
        name,
        description: description || null,
        tipo_falta,
        nivel_academico,
        school_year_id: parseInt(school_year_id),
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(nuevoSeguimiento, { status: 201 });

  } catch (error) {
    console.error('Error creating seguimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración de seguimiento
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden actualizar configuraciones
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del seguimiento es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el seguimiento existe
    const existingSeguimiento = await prisma.phidiasSeguimiento.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSeguimiento) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado' },
        { status: 404 }
      );
    }

    // Validar datos si se proporcionan
    if (updateData.tipo_falta) {
      const tiposFaltaValidos = ['Tipo I', 'Tipo II', 'Tipo III'];
      if (!tiposFaltaValidos.includes(updateData.tipo_falta)) {
        return NextResponse.json(
          { error: 'Tipo de falta debe ser: Tipo I, Tipo II, o Tipo III' },
          { status: 400 }
        );
      }
    }

    if (updateData.nivel_academico) {
      const nivelesValidos = ['Preschool', 'Elementary', 'Middle School', 'High School'];
      if (!nivelesValidos.includes(updateData.nivel_academico)) {
        return NextResponse.json(
          { error: 'Nivel académico debe ser: Preschool, Elementary, Middle School, o High School' },
          { status: 400 }
        );
      }
    }

    if (updateData.school_year_id) {
      const schoolYear = await prisma.schoolYear.findUnique({
        where: { id: parseInt(updateData.school_year_id) }
      });

      if (!schoolYear) {
        return NextResponse.json(
          { error: 'Año académico no encontrado' },
          { status: 400 }
        );
      }
    }

    // Si se actualiza phidias_id, verificar que no cause duplicados
    if (updateData.phidias_id && updateData.phidias_id !== existingSeguimiento.phidias_id) {
      const duplicateCheck = await prisma.phidiasSeguimiento.findFirst({
        where: {
          phidias_id: parseInt(updateData.phidias_id),
          school_year_id: updateData.school_year_id || existingSeguimiento.school_year_id,
          id: { not: parseInt(id) }
        }
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Ya existe un seguimiento con este ID de Phidias para este año académico' },
          { status: 400 }
        );
      }
    }

    const seguimientoActualizado = await prisma.phidiasSeguimiento.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        phidias_id: updateData.phidias_id ? parseInt(updateData.phidias_id) : undefined,
        school_year_id: updateData.school_year_id ? parseInt(updateData.school_year_id) : undefined
      },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json(seguimientoActualizado);

  } catch (error) {
    console.error('Error updating seguimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar configuración de seguimiento
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden eliminar configuraciones
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del seguimiento es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el seguimiento existe
    const existingSeguimiento = await prisma.phidiasSeguimiento.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSeguimiento) {
      return NextResponse.json(
        { error: 'Seguimiento no encontrado' },
        { status: 404 }
      );
    }

    await prisma.phidiasSeguimiento.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Seguimiento eliminado exitosamente' });

  } catch (error) {
    console.error('Error deleting seguimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}