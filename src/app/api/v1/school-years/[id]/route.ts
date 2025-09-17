import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateSchoolYearRequest } from "@/types/school-year";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolYearId = parseInt(id);
    
    if (isNaN(schoolYearId)) {
      return NextResponse.json(
        { success: false, error: "ID de año escolar inválido" },
        { status: 400 }
      );
    }

    const body: UpdateSchoolYearRequest = await request.json();

    // Verificar que el año escolar existe
    const existingSchoolYear = await prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!existingSchoolYear) {
      return NextResponse.json(
        { success: false, error: "Año escolar no encontrado" },
        { status: 404 }
      );
    }

    // Si se está activando este año escolar, desactivar todos los demás
    if (body.isActive === true) {
      await prisma.schoolYear.updateMany({
        where: { id: { not: schoolYearId } },
        data: { isActive: false },
      });
    }

    // Actualizar el año escolar
    const updatedData: {
      name?: string;
      phidias_id?: number | null;
      startDate?: Date;
      endDate?: Date;
      description?: string | null;
      isActive?: boolean;
    } = {};
    if (body.name !== undefined) updatedData.name = body.name;
    if (body.phidias_id !== undefined) updatedData.phidias_id = body.phidias_id;
    if (body.startDate !== undefined) updatedData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updatedData.endDate = new Date(body.endDate);
    if (body.description !== undefined) updatedData.description = body.description;
    if (body.isActive !== undefined) updatedData.isActive = body.isActive;

    const schoolYear = await prisma.schoolYear.update({
      where: { id: schoolYearId },
      data: updatedData,
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: schoolYear,
      message: "Año escolar actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating school year:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schoolYearId = parseInt(id);
    
    if (isNaN(schoolYearId)) {
      return NextResponse.json(
        { success: false, error: "ID de año escolar inválido" },
        { status: 400 }
      );
    }

    // Verificar que el año escolar existe
    const existingSchoolYear = await prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!existingSchoolYear) {
      return NextResponse.json(
        { success: false, error: "Año escolar no encontrado" },
        { status: 404 }
      );
    }

    // No permitir eliminar el año escolar activo
    if (existingSchoolYear.isActive) {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar el año escolar activo" },
        { status: 400 }
      );
    }

    // Eliminar el año escolar (los trimestres se eliminan en cascada)
    await prisma.schoolYear.delete({
      where: { id: schoolYearId },
    });

    return NextResponse.json({
      success: true,
      message: "Año escolar eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting school year:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
