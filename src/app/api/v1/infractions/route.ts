import { transformInfraction } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
// src/app/api/infractions/route.ts
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const infractions = await prisma.faltas.findMany({
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
