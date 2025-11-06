import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import z from "zod";
import { Role } from "@/prismacl/client";

// Esquema de validación para actualizar usuario
const updateUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  fullName: z.string().min(3),
  email: z.string().email().nullable().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role),
  groupCode: z.string().optional(), // Código del grupo para directores de grupo
  areaPermissions: z.array(
    z.object({
      areaId: z.number(),
      canView: z.boolean(),
    })
  ),
});

// GET: Obtener un usuario específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id as string; 
    // Verificar autenticación y permisos
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo administradores o el propio usuario pueden ver sus detalles
    if (currentUser.role !== "ADMIN" && currentUser.id !== userId) {
      return NextResponse.json(
        { error: "No tienes permisos para ver este usuario" },
        { status: 403 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        groupCode: true,
        createdAt: true,
        updatedAt: true,
        AreaPermissions: {
          include: {
            area: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un usuario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id as string; // Asegurarse de que el ID es un string
    // Verificar autenticación y permisos
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar si es el usuario actual o un administrador
    const isOwnUser = currentUser.id === userId;
    const isAdmin = currentUser.role === "ADMIN";

    // Solo administradores o el propio usuario pueden actualizar su perfil
    if (!isAdmin && !isOwnUser) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar este usuario" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, fullName, email, password, role, groupCode, areaPermissions } =
      result.data;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el nombre de usuario está en uso por otro usuario
    const usernameInUse = await prisma.user.findFirst({
      where: {
        username,
        id: { not: userId },
      },
    });

    if (usernameInUse) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso" },
        { status: 400 }
      );
    }

    // Preparar datos para actualizar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      username,
      fullName,
      email,
    };

    // Solo los administradores pueden actualizar roles y groupCode
    if (isAdmin) {
      updateData.role = role;
      updateData.groupCode = groupCode || null;
    }

    // Si se proporciona una nueva contraseña, actualizarla
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Actualizar el usuario
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Solo los administradores pueden actualizar permisos de área
    if (isAdmin && areaPermissions && areaPermissions.length > 0) {
      // Eliminar permisos existentes
      await prisma.areaPermissions.deleteMany({
        where: { userId },
      });

      // Crear nuevos permisos
      await prisma.areaPermissions.createMany({
        data: areaPermissions.map((permission) => ({
          userId,
          areaId: permission.areaId,
          canView: permission.canView,
        })),
      });
    }

    // Obtener el usuario actualizado con sus permisos
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        AreaPermissions: {
          include: {
            area: true,
          },
        },
      },
    });

    return NextResponse.json(userWithPermissions);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un usuario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id as string; // Asegurarse de que el ID es un string
    // Verificar autenticación y permisos
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo administradores pueden eliminar usuarios
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios" },
        { status: 403 }
      );
    }

    // No permitir eliminar al usuario administrador actual
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar permisos de área asociados
    await prisma.areaPermissions.deleteMany({
      where: { userId },
    });

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Usuario eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
