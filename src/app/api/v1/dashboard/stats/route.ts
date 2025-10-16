// src/app/api/v1/dashboard/stats/route.ts
import {
  getActiveSchoolYear,
  getAllSchoolYears,
} from "@/lib/school-year-utils";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get("schoolYearId");

    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    // Construir filtros adicionales según el rol del usuario
    let additionalFilters = {};
    
    // Si es director de grupo (TEACHER), solo ver estadísticas de su grupo
    if (currentUser.role === "TEACHER") {
      const fullUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { groupCode: true },
      });
      
      if (!fullUser?.groupCode) {
        // Si no tiene grupo asignado, no puede ver estadísticas
        return NextResponse.json({
          success: true,
          data: {
            schoolYear: {
              id: targetSchoolYear.id,
              name: targetSchoolYear.name,
              isActive: targetSchoolYear.isActive,
            },
            infractions: {
              total: 0,
              tipoI: 0,
              tipoII: 0,
              tipoIII: 0,
              attended: 0,
              notAttended: 0,
            },
            students: {
              withInfractions: 0,
            },
            availableSchoolYears: await getAllSchoolYears(),
          },
        });
      }
      
      // Obtener estudiantes de su grupo
      const groupStudents = await prisma.estudiantes.findMany({
        where: {
          school_year_id: targetSchoolYear.id,
          grado: fullUser.groupCode,
        },
        select: { id: true, codigo: true },
      });
      
      const studentIds = groupStudents.map(s => s.id);
      additionalFilters = { id_estudiante: { in: studentIds } };
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
        where: { 
          school_year_id: targetSchoolYear.id,
          ...additionalFilters
        },
      }),

      // Faltas Tipo I del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo I",
          ...additionalFilters
        },
      }),

      // Faltas Tipo II del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo II",
          ...additionalFilters
        },
      }),

      // Faltas Tipo III del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          tipo_falta: "Tipo III",
          ...additionalFilters
        },
      }),

      // Faltas atendidas del año académico
      prisma.faltas.count({
        where: {
          school_year_id: targetSchoolYear.id,
          attended: true,
          ...additionalFilters
        },
      }),

      // Estudiantes únicos con faltas en este año académico
      prisma.faltas.findMany({
        where: { 
          school_year_id: targetSchoolYear.id,
          ...additionalFilters
        },
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
