import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!activeSchoolYear) {
      return NextResponse.json({
        success: false,
        error: "No hay año escolar activo",
      });
    }

    const result = {
      schoolYear: {
        id: activeSchoolYear.id,
        name: activeSchoolYear.name,
        startDate: activeSchoolYear.startDate.toISOString().split("T")[0],
        endDate: activeSchoolYear.endDate.toISOString().split("T")[0],
        isActive: activeSchoolYear.isActive,
      },
      trimestres: activeSchoolYear.trimestres.map((t) => ({
        id: t.id,
        name: t.name,
        order: t.order,
        startDate: t.startDate.toISOString().split("T")[0],
        endDate: t.endDate.toISOString().split("T")[0],
      })),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
