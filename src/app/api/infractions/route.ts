// src/app/api/infractions/route.ts - Corrected Mapping
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verificarConexionBD } from '@/lib/db'

import { transformInfraction } from "@/lib/utils";

const prisma = new PrismaClient();



export async function GET() {
  try {
    const estaConectado = await verificarConexionBD()

    if (!estaConectado) {
      return Response.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 503 }
      )
    }
    // Fetch raw data needed for transformation
    const infractionsRaw = await prisma.faltas.findMany({
      select: {
        hash: true,
        id_estudiante: true,
        codigo_estudiante: true,
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

    const transformedInfractions = infractionsRaw.map(transformInfraction);



    return NextResponse.json(transformedInfractions);
  } catch (error) {
    console.error("Error fetching infractions:", error);
    return NextResponse.json(
      { error: "Error fetching infractions" },
      { status: 500 }
    );
  }
}