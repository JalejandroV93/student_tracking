import { transformInfraction } from "@/lib/utils";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
// src/app/api/infractions/route.ts
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let queryOptions: any = {
      select: {
        hash: true,
        id_estudiante: true,
        codigo_estudiante: true,
        tipo_falta: true,
        numero_falta: true,
        fecha: true,
        descripcion_falta: true,
        detalle_falta: true,
        acciones_reparadoras: true,
        autor: true,
        trimestre: true,
        nivel: true,
        attended: true,
        created_at: true,
        updated_at: true,
        attended_at: true,
      },
      orderBy: { fecha: "desc" },
      where: {}, // Initialize where clause
    };

    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.PSYCHOLOGY
    ) {
      const areaPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true },
        include: { area: true },
      });

      const permittedAreaNames = areaPermissions.map(
        (permission) => permission.area.name
      );

      if (permittedAreaNames.length === 0) {
        // If no permitted areas, return empty list
        return NextResponse.json([]);
      }
      // Apply area filtering for non-admin/psychology users
      queryOptions.where.nivel = { in: permittedAreaNames };
    }
    
    // The current route doesn't support fetching by studentId or infractionId (hash) directly in the query params for GET all.
    // If it did, further checks would be needed here for single item access.
    // For example, if a studentId was passed:
    // const { searchParams } = new URL(request.url);
    // const studentIdParam = searchParams.get("studentId");
    // if (studentIdParam) {
    //   queryOptions.where.id_estudiante = parseInt(studentIdParam); // Assuming studentId is part of Faltas
    // }

    const infractions = await prisma.faltas.findMany(queryOptions);

    const transformedInfractions = infractions.map((infraction) => {
      // Ensure id_estudiante and codigo_estudiante are not null before constructing studentId
      const studentId = infraction.id_estudiante && infraction.codigo_estudiante 
        ? `${infraction.id_estudiante}-${infraction.codigo_estudiante}`
        : `unknown-student`; // Fallback or error handling

      return transformInfraction(infraction, studentId);
    });

    return NextResponse.json(transformedInfractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    let errorMessage = "Error fetching infractions";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
