import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import z from "zod";

const bulkAssignSchema = z.object({
  userIds: z.array(z.string()).min(1, "Debe seleccionar al menos un usuario"),
  groupCode: z.string().min(1, "Debe seleccionar un grupo"),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para asignar grupos masivamente" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = bulkAssignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { userIds, groupCode } = result.data;

    // Verificar que todos los usuarios existen y son TEACHER sin grupo asignado
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: "TEACHER",
        groupCode: null,
      },
      select: {
        id: true,
        fullName: true,
        groupCode: true,
      },
    });

    if (users.length !== userIds.length) {
      return NextResponse.json(
        {
          error:
            "Algunos usuarios no existen, no son directores de grupo o ya tienen grupo asignado",
        },
        { status: 400 }
      );
    }

    // Verificar que el grupo existe
    const groups = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/v1/groups`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!groups.ok) {
      return NextResponse.json(
        { error: "Error al verificar grupos disponibles" },
        { status: 500 }
      );
    }

    const availableGroups = await groups.json();
    const groupExists = availableGroups.some(
      (g: { value: string }) => g.value === groupCode
    );

    if (!groupExists) {
      return NextResponse.json(
        { error: "El grupo seleccionado no existe" },
        { status: 400 }
      );
    }

    // Verificar que el grupo no esté ya asignado a otro director
    const existingAssignment = await prisma.user.findFirst({
      where: {
        role: "TEACHER",
        groupCode: groupCode,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          error: `El grupo ${groupCode} ya está asignado a ${existingAssignment.fullName}`,
        },
        { status: 400 }
      );
    }

    // Realizar la asignación masiva
    const updateResult = await prisma.user.updateMany({
      where: {
        id: { in: userIds },
        role: "TEACHER",
        groupCode: null,
      },
      data: {
        groupCode: groupCode,
      },
    });

    return NextResponse.json({
      message: `Se asignó el grupo ${groupCode} a ${updateResult.count} director(es) de grupo`,
      updatedCount: updateResult.count,
      assignedGroup: groupCode,
    });
  } catch (error) {
    console.error("Error en asignación masiva de grupos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para ver usuarios sin grupo asignado" },
        { status: 403 }
      );
    }

    // Obtener usuarios TEACHER sin grupo asignado
    const unassignedTeachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        groupCode: null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return NextResponse.json({
      unassignedTeachers,
      count: unassignedTeachers.length,
    });
  } catch (error) {
    console.error("Error obteniendo usuarios sin grupo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
