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
        tipo_falta: true,
        numero_falta: true,
        descripcion_falta: true,
        detalle_falta: true,
        acciones_reparadoras: true,
        autor: true,
        fecha: true,
        trimestre: true,
        nivel: true,
      },
    });

    const normalizedInfractions = infractions.map((infraction) => ({
      id: infraction.hash,
      studentId: infraction.id_estudiante.toString(),
      type: normalizarTipoFalta(infraction.tipo_falta ?? ""),
      number: infraction.numero_falta?.toString() ?? "",
      date: infraction.fecha?.toISOString().split("T")[0] ?? "",
      description: infraction.descripcion_falta ?? "",
      details: infraction.detalle_falta ?? "",
      remedialActions: infraction.acciones_reparadoras ?? "",
      author: infraction.autor ?? "",
      trimester: infraction.trimestre ?? "",
      level: infraction.nivel ?? "",
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
