// src/app/api/infractions/route.ts - Corrected Mapping
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { transformInfraction } from "@/lib/utils";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const infractions = await prisma.faltas.findMany({
      select: {
        hash: true,
        id_estudiante: true,
        tipo_falta: true,
        numero_falta: true,
        fecha: true,
        descripcion_falta: true,
        detalle_falta: true,
        acciones_reparadoras: true,
        autor: true,
        trimestre: true,
        nivel: true,
      },
      orderBy: { fecha: "desc" },
    });

    // Añadir el campo codigo_estudiante a cada infracción
    const infractionsWithCode = infractions.map(infraction => ({
      ...infraction,
      codigo_estudiante: infraction.id_estudiante // Asumiendo que id_estudiante puede servir como código
    }));

    const transformedInfractions = infractionsWithCode.map(transformInfraction);

    return NextResponse.json(transformedInfractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    return NextResponse.json(
      { error: "Error fetching infractions" },
      { status: 500 }
    );
  }
}
