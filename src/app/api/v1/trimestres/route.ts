import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Obtener todos los trimestres con información del año escolar
    const trimestres = await prisma.trimestre.findMany({
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ schoolYear: { startDate: "desc" } }, { order: "asc" }],
    });

    // Formatear los datos para el selector
    const trimestresFormateados = trimestres.map((trimestre) => ({
      id: trimestre.id,
      name: trimestre.name,
      order: trimestre.order,
      schoolYearId: trimestre.schoolYearId,
      schoolYearName: trimestre.schoolYear.name,
      isActive: trimestre.schoolYear.isActive,
      startDate: trimestre.startDate.toISOString().split("T")[0],
      endDate: trimestre.endDate.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      trimestres: trimestresFormateados,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching trimestres:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
