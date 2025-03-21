import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const followUps = await prisma.seguimientos.findMany({
      select: {
        id_seguimiento: true,
        id_caso: true,
        tipo_seguimiento: true,
        fecha_seguimiento: true,
        detalles: true,
        autor: true,
      },
    })

    return NextResponse.json(followUps)
  } catch (error) {
    console.error("Error fetching follow-ups:", error)
    return NextResponse.json(
      { error: "Error fetching follow-ups" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_caso, tipo_seguimiento, fecha_seguimiento, detalles, autor } = body

    const followUp = await prisma.seguimientos.create({
      data: {
        id_caso,
        tipo_seguimiento,
        fecha_seguimiento,
        detalles,
        autor,
      },
    })

    return NextResponse.json(followUp)
  } catch (error) {
    console.error("Error creating follow-up:", error)
    return NextResponse.json(
      { error: "Error creating follow-up" },
      { status: 500 }
    )
  }
}