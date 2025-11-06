import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/prismacl/client";
import { asignarNivelAcademico } from "@/lib/academic-level-utils";

// PUT - Actualizar estudiante
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN puede actualizar estudiantes)
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar estudiantes" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const studentId = parseInt(id);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "ID de estudiante inválido" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const existingStudent = await prisma.estudiantes.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      nombre,
      firstname,
      lastname,
      grado,
      seccion,
      school_year_id,
      photo_url,
    } = body;

    // Preparar datos de actualización (solo campos proporcionados)
    const updateData: Partial<{
      nombre: string;
      firstname: string;
      lastname: string;
      grado: string;
      seccion: string;
      school_year_id: number;
      photo_url: string | null;
    }> = {};

    if (nombre !== undefined) updateData.nombre = nombre.trim();
    if (firstname !== undefined) updateData.firstname = firstname.trim();
    if (lastname !== undefined) updateData.lastname = lastname.trim();
    if (grado !== undefined) updateData.grado = grado.trim();
    if (seccion !== undefined) updateData.seccion = seccion.trim();
    if (school_year_id !== undefined) {
      // Verificar que el año académico existe
      const schoolYear = await prisma.schoolYear.findUnique({
        where: { id: parseInt(school_year_id) },
      });

      if (!schoolYear) {
        return NextResponse.json(
          { error: "Año académico no encontrado" },
          { status: 400 }
        );
      }

      updateData.school_year_id = parseInt(school_year_id);
    }
    if (photo_url !== undefined) {
      updateData.photo_url = photo_url?.trim() || null;
    }

    // Si se proporciona firstname y lastname, actualizar nombre completo
    if (firstname !== undefined && lastname !== undefined) {
      updateData.nombre = `${firstname.trim()} ${lastname.trim()}`;
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.estudiantes.update({
      where: { id: studentId },
      data: updateData,
    });

    // Determinar el nivel académico basado en la sección
    const nivel = updatedStudent.seccion ? asignarNivelAcademico(updatedStudent.seccion) : "No especificado";

    return NextResponse.json({
      success: true,
      student: {
        id: updatedStudent.id.toString(),
        name: updatedStudent.nombre,
        code: updatedStudent.codigo.toString(),
        grado: updatedStudent.grado,
        level: nivel,
        photo_url: updatedStudent.photo_url,
        firstname: updatedStudent.firstname,
        lastname: updatedStudent.lastname,
        seccion: updatedStudent.seccion,
      },
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar estudiante
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN puede eliminar estudiantes)
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar estudiantes" },
        { status: 403 }
      );
    }
    const { id } = await params;
    const studentId = parseInt(id);
    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "ID de estudiante inválido" },
        { status: 400 }
      );
    }

    // Verificar que el estudiante existe
    const existingStudent = await prisma.estudiantes.findUnique({
      where: { id: studentId },
      include: {
        faltas: {
          include: {
            casos: {
              include: {
                seguimientos: true,
              },
            },
          },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      );
    }

    // Realizar eliminación en cascada (transacción)
    await prisma.$transaction(async (tx) => {
      // Eliminar seguimientos
      for (const falta of existingStudent.faltas) {
        for (const caso of falta.casos) {
          await tx.seguimientos.deleteMany({
            where: { id_caso: caso.id_caso },
          });
        }
      }

      // Eliminar casos
      for (const falta of existingStudent.faltas) {
        await tx.casos.deleteMany({
          where: { hash_falta: falta.hash },
        });
      }

      // Eliminar faltas
      await tx.faltas.deleteMany({
        where: { id_estudiante: studentId },
      });

      // Eliminar estudiante
      await tx.estudiantes.delete({
        where: { id: studentId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Estudiante eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}