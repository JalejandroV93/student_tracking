import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET: Obtener todas las áreas
export async function GET() {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todas las áreas
    const areas = await prisma.area.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    return NextResponse.json(
      { error: "Error al obtener áreas" },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva área
export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo administradores pueden crear áreas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para crear áreas" },
        { status: 403 }
      );
    }

    const { name, code } = await request.json();

    // Validaciones básicas
    if (!name || !code) {
      return NextResponse.json(
        { error: "El nombre y código son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un área con el mismo código
    const existingArea = await prisma.area.findFirst({
      where: { code },
    });

    if (existingArea) {
      return NextResponse.json(
        { error: "Ya existe un área con ese código" },
        { status: 400 }
      );
    }

    // Crear el área
    const newArea = await prisma.area.create({
      data: {
        name,
        code,
      },
    });

    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    console.error("Error al crear área:", error);
    return NextResponse.json({ error: "Error al crear área" }, { status: 500 });
  }
}
