// src/app/api/infractions/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { normalizarTipoFalta } from "@/lib/constantes";

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
        descripcion_falta: true, // Include if needed in the UI
        detalle_falta: true,     // Include if needed in the UI
        acciones_reparadoras: true, // Include if needed
        autor: true,              // Include if needed
        fecha: true,
        trimestre: true,          // Include if needed
        nivel: true,              // Include if needed
      },
    });

    const normalizedInfractions = infractions.map((infraction) => ({
      id: infraction.hash,
      studentId: `${infraction.id_estudiante}-${infraction.codigo_estudiante}`,
      type: normalizarTipoFalta(infraction.tipo_falta ?? ""),
      number: infraction.numero_falta?.toString() ?? "",
      date: infraction.fecha?.toISOString().split("T")[0] ?? "", // Format date
      description: infraction.descripcion_falta ?? "", // Added description
      details: infraction.detalle_falta ?? "",     // Added details
      remedialActions: infraction.acciones_reparadoras ?? "", // Added
      author: infraction.autor ?? "", // Added
      trimester: infraction.trimestre ?? "", // Added
      level: infraction.nivel ?? "",  // Added
    }));

    return NextResponse.json(normalizedInfractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    return NextResponse.json(
      { error: "Error fetching infractions" },
      { status: 500 }
    );
  }
}