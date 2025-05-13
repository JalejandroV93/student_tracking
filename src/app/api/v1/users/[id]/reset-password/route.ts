import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import z from "zod";

// Esquema de validación para resetear contraseña
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// POST: Resetear contraseña de usuario (solo para administradores)
export async function POST(
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

    // Solo administradores pueden resetear contraseñas
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para resetear contraseñas" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() },
        { status: 400 }
      );
    }

    const { newPassword } = result.data;

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

    // Actualizar la contraseña
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Resetear intentos fallidos y desbloquear si estaba bloqueado
        failedLoginAttempts: 0,
        isBlocked: false,
      },
    });

    return NextResponse.json(
      { message: "Contraseña restablecida correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al resetear contraseña:", error);
    return NextResponse.json(
      { error: "Error al resetear contraseña" },
      { status: 500 }
    );
  }
}
