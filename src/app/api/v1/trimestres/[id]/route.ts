import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trimestreId = parseInt((await params).id);

    if (isNaN(trimestreId)) {
      return NextResponse.json(
        { error: "ID de trimestre inválido" },
        { status: 400 }
      );
    }

    const trimestre = await prisma.trimestre.findUnique({
      where: { id: trimestreId },
      include: {
        schoolYear: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!trimestre) {
      return NextResponse.json(
        { error: "Trimestre no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: trimestre.id,
      name: trimestre.name,
      order: trimestre.order,
      schoolYearId: trimestre.schoolYearId,
      schoolYearName: trimestre.schoolYear.name,
      startDate: trimestre.startDate.toISOString().split("T")[0],
      endDate: trimestre.endDate.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching trimestre:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
