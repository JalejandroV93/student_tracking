import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateSchoolYearRequest } from "@/types/school-year";

export async function GET() {
  try {
    const schoolYears = await prisma.schoolYear.findMany({
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ success: true, data: schoolYears });
  } catch (error) {
    console.error("Error fetching school years:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSchoolYearRequest = await request.json();

    // Validaciones
    if (
      !body.name ||
      !body.startDate ||
      !body.endDate ||
      !body.trimestres ||
      body.trimestres.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos. Se requiere nombre, fechas y trimestres.",
        },
        { status: 400 }
      );
    }

    if (body.trimestres.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Se requieren exactamente 3 trimestres." },
        { status: 400 }
      );
    }

    // Verificar que no exista un año escolar con el mismo nombre
    const existingSchoolYear = await prisma.schoolYear.findUnique({
      where: { name: body.name },
    });

    if (existingSchoolYear) {
      return NextResponse.json(
        { success: false, error: "Ya existe un año escolar con ese nombre." },
        { status: 400 }
      );
    }

    // Crear el año escolar con sus trimestres
    const schoolYear = await prisma.schoolYear.create({
      data: {
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        description: body.description,
        isActive: false, // Por defecto no está activo
        trimestres: {
          create: body.trimestres.map((trimestre) => ({
            name: trimestre.name,
            order: trimestre.order,
            startDate: new Date(trimestre.startDate),
            endDate: new Date(trimestre.endDate),
          })),
        },
      },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: schoolYear,
      message: "Año escolar creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating school year:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
