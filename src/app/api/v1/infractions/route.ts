import { transformInfraction } from "@/lib/utils";
import {
  getActiveSchoolYear,
  getSchoolYearById,
} from "@/lib/school-year-utils";
import { PrismaClient } from "@prisma/client";
// src/app/api/infractions/route.ts
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get("schoolYearId");

    // Determinar qué año académico usar
    let targetSchoolYear;
    if (schoolYearId && schoolYearId !== "active") {
      // Si se especifica un año académico específico
      targetSchoolYear = await getSchoolYearById(parseInt(schoolYearId));
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "School year not found" },
          { status: 404 }
        );
      }
    } else {
      // Si no se especifica o se pide el activo, usar el año académico activo
      targetSchoolYear = await getActiveSchoolYear();
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "No active school year found" },
          { status: 400 }
        );
      }
    }

    const infractions = await prisma.faltas.findMany({
      where: {
        school_year_id: targetSchoolYear.id,
      },
      orderBy: { fecha: "desc" },
    });

    const transformedInfractions = infractions.map((infraction) => {
      const studentId = `${infraction.id_estudiante}-${infraction.codigo_estudiante}`;
      /* console.log(
        `Transformando infracción: ${infraction.hash} para estudiante ID: ${studentId}`
      ); */

      return transformInfraction(infraction, studentId);
    });

    return NextResponse.json(transformedInfractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    return NextResponse.json(
      { error: "Error fetching infractions" },
      { status: 500 }
    );
  }
}
