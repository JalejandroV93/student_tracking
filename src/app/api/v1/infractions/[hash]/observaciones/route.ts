// src/app/api/v1/infractions/[hash]/observaciones/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


interface ObservacionRequestBody {
  observaciones: string;
  autor?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json(
      { error: "Infraction hash is required" },
      { status: 400 }
    );
  }

  try {
    const body: ObservacionRequestBody = await request.json();
    const { observaciones, autor } = body;

    if (!observaciones || observaciones.trim() === "") {
      return NextResponse.json(
        { error: "Observaciones cannot be empty" },
        { status: 400 }
      );
    }

    const updatedInfraction = await prisma.faltas.update({
      where: { hash: hash },
      data: {
        observaciones: observaciones,
        observaciones_autor: autor || "Usuario",
        observaciones_fecha: new Date(),
        updated_at: new Date(),
      },
      select: {
        hash: true,
        observaciones: true,
        observaciones_autor: true,
        observaciones_fecha: true,
      },
    });

    if (!updatedInfraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 }
      );
    }

    console.log(
      `Observación agregada a la falta ${hash} por ${autor || "Usuario"}`
    );
    return NextResponse.json(updatedInfraction);
  } catch (error) {
    console.error(`Error adding observaciones to infraction ${hash}:`, error);
    if (error instanceof SyntaxError) {
      // JSON parsing error
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to add observaciones" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to retrieve observaciones
export async function GET(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json(
      { error: "Infraction hash is required" },
      { status: 400 }
    );
  }

  try {
    const infraction = await prisma.faltas.findUnique({
      where: { hash: hash },
      select: {
        observaciones: true,
        observaciones_autor: true,
        observaciones_fecha: true,
      },
    });

    if (!infraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(infraction);
  } catch (error) {
    console.error(
      `Error retrieving observaciones for infraction ${hash}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to retrieve observaciones" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
