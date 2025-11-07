// src/middleware.ts (Middleware for Route Protection)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/tokens";
import { UserPayload } from "@/types/user";
import { Role } from "@/prismacl/client";

// Rutas protegidas que requieren autenticación
const protectedRoutes = ["/dashboard"];

// Mapeo de secciones a códigos de área
const sectionToAreaCode: Record<string, string> = {
  preschool: "PRESCHOOL",
  elementary: "ELEMENTARY",
  middle: "MIDDLE",
  high: "HIGH",
};

// Mapeo de roles a áreas permitidas
const roleAreaMap: Record<Role, string[]> = {
  [Role.ADMIN]: ["PRESCHOOL", "ELEMENTARY", "MIDDLE", "HIGH"],
  [Role.PRESCHOOL_COORDINATOR]: ["PRESCHOOL"],
  [Role.ELEMENTARY_COORDINATOR]: ["ELEMENTARY"],
  [Role.MIDDLE_SCHOOL_COORDINATOR]: ["MIDDLE"],
  [Role.HIGH_SCHOOL_COORDINATOR]: ["HIGH"],
  [Role.PSYCHOLOGY]: ["PRESCHOOL", "ELEMENTARY", "MIDDLE", "HIGH"],
  [Role.TEACHER]: [], // Los profesores manejan grupos específicos, no áreas generales
  [Role.USER]: [],
  [Role.STUDENT]: [],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  let user: UserPayload | null = null;
  let isLoggedIn = false;

  if (token) {
    try {
      // Verificar el token
      user = await verifyToken<UserPayload>(token);
      isLoggedIn = true;
    } catch (error) {
      console.error("Error verifying token in middleware:", error);
      isLoggedIn = false;
    }
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Si la ruta está protegida y el usuario no está logueado, redirigir al login
  if (isProtectedRoute && !isLoggedIn) {
    const absoluteURL = new URL("/", request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // Si el usuario está autenticado, verificar permisos por área para ciertas rutas
  if (isLoggedIn && user) {
    // Verificar rutas por área (como alertas, casos, estudiantes por sección)
    const pathname = request.nextUrl.pathname;

    // Rutas de configuración - solo para administradores
    if (
      pathname.startsWith("/dashboard/settings") &&
      user.role !== Role.ADMIN
    ) {
      // Redirigir al dashboard principal si no es administrador
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Patrones para rutas específicas de áreas
    const areaPatterns = [
      /^\/dashboard\/alerts\/([^\/]+)$/,
      /^\/dashboard\/case-management\/([^\/]+)$/,
      /^\/dashboard\/students\/([^\/]+)$/,
    ];

    // Comprobar si la ruta coincide con alguno de los patrones de área
    for (const pattern of areaPatterns) {
      const match = pathname.match(pattern);
      if (match && match[1]) {
        const section = match[1];

        // Si es "todas las secciones" y no es admin, redirigir a su área específica
        if (section === "all" && user.role !== Role.ADMIN) {
          // Determinar a qué área debe acceder según su rol
          let redirectSection = "";

          if (user.role === Role.PRESCHOOL_COORDINATOR)
            redirectSection = "preschool";
          else if (user.role === Role.ELEMENTARY_COORDINATOR)
            redirectSection = "elementary";
          else if (user.role === Role.MIDDLE_SCHOOL_COORDINATOR)
            redirectSection = "middle";
          else if (user.role === Role.HIGH_SCHOOL_COORDINATOR)
            redirectSection = "high";

          // Si se determinó una sección, redirigir
          if (redirectSection) {
            const redirectURL = pathname.replace(section, redirectSection);
            return NextResponse.redirect(new URL(redirectURL, request.url));
          }
        }

        const areaCode = sectionToAreaCode[section];

        // Si es una sección específica
        if (areaCode) {
          // Los administradores siempre tienen acceso a todas las áreas
          if (user.role === Role.ADMIN) {
            break; // Permitir acceso y continuar
          }

          // Verificar si el rol del usuario tiene permiso para esta área
          const allowedAreas = roleAreaMap[user.role] || [];
          if (!allowedAreas.includes(areaCode)) {
            // Redirigir al dashboard si no tiene permisos para esta área
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
