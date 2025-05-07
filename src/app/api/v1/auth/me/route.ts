import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getUserAreaPermissions } from "@/lib/session";
import { UserPayload } from "@/types/user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Obtener el usuario actual
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    // Verificar si se solicitan los permisos
    const url = new URL(request.url);
    const includePermissions =
      url.searchParams.get("includePermissions") === "true";

    // Obtener el usuario completo desde Prisma
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        document: true,
        phonenumber: true,
        role: true,
        ...(includePermissions
          ? {
              AreaPermissions: {
                include: {
                  area: true,
                },
              },
            }
          : {}),
      },
    });

    if (!fullUser) {
      return NextResponse.json(null, { status: 404 });
    }

    // Si se solicitan permisos, formatearlos
    if (includePermissions) {
      // Preparar respuesta con permisos formateados
      const permissionsByArea: Record<string, boolean> = {};

      // Los administradores siempre tienen todos los permisos
      if (fullUser.role === "ADMIN") {
        // Obtener todas las áreas
        const areas = await prisma.area.findMany();
        areas.forEach((area) => {
          permissionsByArea[area.code] = true;
        });
      } else if (fullUser.AreaPermissions) {
        // Mapear permisos por área
        fullUser.AreaPermissions.forEach((permission) => {
          if (permission.canView) {
            permissionsByArea[permission.area.code] = true;
          }
        });
      }

      // Respuesta con permisos
      const userWithPermissions = {
        id: fullUser.id,
        username: fullUser.username,
        fullName: fullUser.fullName,
        email: fullUser.email,
        document: fullUser.document,
        phonenumber: fullUser.phonenumber,
        role: fullUser.role,
        permissions: permissionsByArea,
      };

      return NextResponse.json(userWithPermissions);
    }

    // Respuesta sin permisos (solo datos básicos)
    const userResponse = {
      id: fullUser.id,
      username: fullUser.username,
      fullName: fullUser.fullName,
      email: fullUser.email,
      document: fullUser.document,
      phonenumber: fullUser.phonenumber,
      role: fullUser.role,
    };

    return NextResponse.json(userResponse as UserPayload);
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
