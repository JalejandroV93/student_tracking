import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const settings = await prisma.alertSettings.findMany()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching alert settings:", error)
    return NextResponse.json(
      { error: "Error fetching alert settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seccion, primary_threshold, secondary_threshold } = body

    const setting = await prisma.alertSettings.upsert({
      where: { seccion },
      update: {
        primary_threshold,
        secondary_threshold,
      },
      create: {
        seccion,
        primary_threshold,
        secondary_threshold,
      },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error("Error updating alert settings:", error)
    return NextResponse.json(
      { error: "Error updating alert settings" },
      { status: 500 }
    )
  }
}