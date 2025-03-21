import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { normalizarTipoFalta } from "@/lib/constants"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const infractions = await prisma.faltas.findMany({
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
    })

    // Normalizar tipos de falta
    const normalizedInfractions = infractions.map(infraction => ({
      ...infraction,
      tipo_falta: normalizarTipoFalta(infraction.tipo_falta || ""),
    }))

    return NextResponse.json(normalizedInfractions)
  } catch (error) {
    console.error("Error fetching infractions:", error)
    return NextResponse.json(
      { error: "Error fetching infractions" },
      { status: 500 }
    )
  }
}