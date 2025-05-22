import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { UserPayload, AreaPermission } from "@/types/user"; // Import AreaPermission
import { Role } from "@prisma/client"; // Import Role
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUser(); // This is likely from lib/session, gets basic payload
    if (!sessionUser) {
      return NextResponse.json(null, { status: 401 });
    }

    const url = new URL(request.url);
    const includePermissions =
      url.searchParams.get("includePermissions") === "true";

    // Fetch core user details
    const userFromDb = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        document: true,
        phonenumber: true,
        role: true,
      },
    });

    if (!userFromDb) {
      return NextResponse.json(null, { status: 404 });
    }

    let areaPermissionsData: AreaPermission[] = []; // Inicializar como arreglo vacío por defecto

    if (includePermissions) {
      if (userFromDb.role === Role.ADMIN) {
        const allAreas = await prisma.area.findMany();
        areaPermissionsData = allAreas.map((area) => ({
          id: 0, // Placeholder ID for admin-derived permission
          areaId: area.id,
          canView: true,
          area: { id: area.id, code: area.code, name: area.name },
        }));
      } else {
        // Explícitamente escribir el tipo del resultado de la consulta de prisma
        const userAreaPermissionsResult: AreaPermission[] =
          await prisma.areaPermissions.findMany({
            where: { userId: userFromDb.id, canView: true },
            select: {
              id: true,
              areaId: true,
              canView: true,
              area: { select: { id: true, code: true, name: true } },
            },
          });
        areaPermissionsData = userAreaPermissionsResult;
      }
    } else {
      // Siempre incluir los permisos, incluso si no se solicitan explícitamente
      if (userFromDb.role === Role.ADMIN) {
        // Para administradores, buscar solo los IDs de áreas sin incluir detalles completos
        const allAreaIds = await prisma.area.findMany({
          select: { id: true },
        });
        areaPermissionsData = allAreaIds.map((area) => ({
          id: 0,
          areaId: area.id,
          canView: true,
          area: { id: area.id, code: "", name: "" }, // Datos mínimos
        }));
      } else {
        // Para otros roles, buscar sus permisos básicos
        const userPermissions = await prisma.areaPermissions.findMany({
          where: { userId: userFromDb.id, canView: true },
          select: { id: true, areaId: true, canView: true },
        });

        areaPermissionsData = userPermissions.map((perm) => ({
          id: perm.id,
          areaId: perm.areaId,
          canView: perm.canView,
          area: { id: perm.areaId, code: "", name: "" }, // Datos mínimos
        }));
      }
    }

    // Construct the response payload ensuring all fields from UserPayload are included
    const responsePayload: UserPayload = {
      id: userFromDb.id,
      username: userFromDb.username,
      fullName: userFromDb.fullName,
      email: userFromDb.email,
      document: userFromDb.document,
      phonenumber: userFromDb.phonenumber,
      role: userFromDb.role,
      jti: sessionUser.jti, // ensure all original UserPayload fields from session are present
      iat: sessionUser.iat,
      exp: sessionUser.exp,
      sub: sessionUser.sub, // Assuming 'sub' might be part of the original session payload
      AreaPermissions: areaPermissionsData,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    let errorMessage = "Error al obtener usuario";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
