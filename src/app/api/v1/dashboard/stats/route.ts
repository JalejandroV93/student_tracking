// src/app/api/v1/dashboard/stats/route.ts
import {
  getActiveSchoolYear,
  getAllSchoolYears,
} from "@/lib/school-year-utils";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get("schoolYearId");

    // Determinar qué año académico usar
    let targetSchoolYear;
    if (schoolYearId && schoolYearId !== "active") {
      const id = parseInt(schoolYearId);
      targetSchoolYear = await prisma.schoolYear.findUnique({
        where: { id },
        select: { id: true, name: true, isActive: true },
      });
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "School year not found" },
          { status: 404 }
        );
      }
    } else {
      targetSchoolYear = await getActiveSchoolYear();
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "No active school year found" },
          { status: 400 }
        );
      }
    }

    // Obtener estadísticas básicas para el año académico seleccionado
    const [
      totalFaltas,
      faltasTipoI,
      faltasTipoII,
      faltasTipoIII,
      faltasAtendidas,
      estudiantesUnicos,
      allSchoolYears,
    ] = await Promise.all([
      // Total de faltas del año académico
      prisma.faltas.count({
        where: { school_year_id: targetSchoolYear.id },
      }),

      // Faltas Tipo I del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo I",
        },
      }),

      // Faltas Tipo II del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo II",
        },
      }),

      // Faltas Tipo III del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo III",
        },
      }),

      // Faltas atendidas del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          attended: true,
        },
      }),

      // Estudiantes únicos con faltas en este año académico
      prisma.faltas.findMany({
        where: { school_year_id: targetSchoolYear.id },
        select: { id_estudiante: true, codigo_estudiante: true },
        distinct: ["id_estudiante", "codigo_estudiante"],
      }),

      // Todos los años académicos disponibles
      getAllSchoolYears(),
    ]);

    const stats = {
      schoolYear: {
        id: targetSchoolYear.id,
        name: targetSchoolYear.name,
        isActive: targetSchoolYear.isActive,
      },

      infractions: {
        total: totalFaltas,
        tipoI: faltasTipoI,
        tipoII: faltasTipoII,
        tipoIII: faltasTipoIII,
        attended: faltasAtendidas,
        notAttended: totalFaltas - faltasAtendidas,
      },

      students: {
        withInfractions: estudiantesUnicos.length,
      },

      availableSchoolYears: allSchoolYears,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error fetching dashboard statistics" },
      { status: 500 }
    );
  }
}
