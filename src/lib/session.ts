import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifyToken } from "./tokens";
import { UserPayload } from "@/types/user";

// Obtener el usuario actual a partir del token en las cookies
export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken<UserPayload>(token);
    return payload;
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
    return null;
  }
}

// Función para verificar si un usuario tiene permiso para ver un área específica
export async function hasAreaPermission(
  userId: string,
  areaCode: string
): Promise<boolean> {
  try {
    // Buscar el usuario con su rol
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Si no se encuentra el usuario o no tiene rol, no tiene permisos
    if (!user) {
      return false;
    }

    // Los administradores tienen acceso a todas las áreas
    if (user.role === "ADMIN") {
      return true;
    }

    // Buscar el área por su código
    const area = await prisma.area.findFirst({
      where: { code: areaCode },
    });

    // Si no existe el área, no hay permiso
    if (!area) {
      return false;
    }

    // Buscar el permiso específico
    const permission = await prisma.areaPermissions.findFirst({
      where: {
        userId,
        areaId: area.id,
        canView: true,
      },
    });

    return !!permission;
  } catch (error) {
    console.error("Error al verificar permisos de área:", error);
    return false;
  }
}

// Función para obtener las áreas a las que un usuario tiene permiso
export async function getUserAreaPermissions(
  userId: string
): Promise<string[]> {
  try {
    // Buscar el usuario con su rol
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        AreaPermissions: {
          where: { canView: true },
          include: { area: true },
        },
      },
    });

    // Si no se encuentra el usuario o no tiene rol, devolver array vacío
    if (!user) {
      return [];
    }

    // Los administradores tienen acceso a todas las áreas
    if (user.role === "ADMIN") {
      // Obtener todos los códigos de área
      const allAreas = await prisma.area.findMany({
        select: { code: true },
      });
      return allAreas.map((area) => area.code);
    }

    // Para roles específicos, el permiso está determinado por sus permisos de área
    return user.AreaPermissions.map((permission) => permission.area.code);
  } catch (error) {
    console.error("Error al obtener permisos de área:", error);
    return [];
  }
}
