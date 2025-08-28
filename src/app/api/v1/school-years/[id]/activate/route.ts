import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Verificar que el año escolar existe
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: schoolYearId },
    });

    if (!schoolYear) {
      return NextResponse.json(
        { success: false, error: "Año escolar no encontrado" },
        { status: 404 }
      );
    }

    // Transacción para desactivar todos los años y activar el seleccionado
    const result = await prisma.$transaction(async (tx) => {
      // Desactivar todos los años escolares
      await tx.schoolYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Activar el año escolar seleccionado
      const updatedSchoolYear = await tx.schoolYear.update({
        where: { id: schoolYearId },
        data: { isActive: true },
        include: {
          trimestres: {
            orderBy: { order: "asc" },
          },
        },
      });

      return updatedSchoolYear;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Año escolar activado exitosamente",
    });
  } catch (error) {
    console.error("Error activating school year:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
