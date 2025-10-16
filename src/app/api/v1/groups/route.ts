import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getActiveSchoolYear } from "@/lib/school-year-utils";

export async function GET() {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el año académico activo
    const activeSchoolYear = await getActiveSchoolYear();
    if (!activeSchoolYear) {
      return NextResponse.json(
        { error: "No active school year found" },
        { status: 400 }
      );
    }

    // Obtener grupos únicos de estudiantes activos (tanto grado como seccion)
    const [gradoGroups, seccionGroups] = await Promise.all([
      prisma.estudiantes.findMany({
        where: {
          school_year_id: activeSchoolYear.id,
          grado: { not: null },
        },
        select: {
          grado: true,
        },
        distinct: ["grado"],
        orderBy: {
          grado: "asc",
        },
      }),
      prisma.estudiantes.findMany({
        where: {
          school_year_id: activeSchoolYear.id,
          seccion: { not: null },
        },
        select: {
          seccion: true,
        },
        distinct: ["seccion"],
        orderBy: {
          seccion: "asc",
        },
      })
    ]);

    console.log("📊 Grupos encontrados:", {
      gradoGroups: gradoGroups.length,
      seccionGroups: seccionGroups.length,
      sampleGrados: gradoGroups.slice(0, 5).map(g => g.grado),
      sampleSecciones: seccionGroups.slice(0, 5).map(s => s.seccion)
    });

    // Combinar y filtrar grupos válidos
    const allGroups = new Set<string>();

    // Agregar grados
    gradoGroups.forEach(group => {
      if (group.grado && group.grado.trim() !== "") {
        allGroups.add(group.grado);
      }
    });

    // Agregar secciones
    seccionGroups.forEach(group => {
      if (group.seccion && group.seccion.trim() !== "") {
        allGroups.add(group.seccion);
      }
    });

    const validGroups = Array.from(allGroups).sort().map((group) => ({
      value: group,
      label: group,
      // También incluir versiones normalizadas para debugging
      normalized: group.toLowerCase().replace(/\s+/g, ''),
    }));

    return NextResponse.json(validGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Error fetching groups" },
      { status: 500 }
    );
  }
}