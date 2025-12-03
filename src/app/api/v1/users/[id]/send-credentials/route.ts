import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { phidiasCredentialsService } from "@/services/phidias-credentials.service";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/users/[id]/send-credentials
 * Envía las credenciales de acceso a un usuario vía Phidias
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getCurrentUser();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo admin puede enviar credenciales
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Solo administradores pueden enviar credenciales" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        id_phidias: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!user.id_phidias) {
      return NextResponse.json(
        { success: false, error: "El usuario no tiene ID de Phidias configurado" },
        { status: 400 }
      );
    }

    // Parsear el body opcional para subject personalizado
    let subject: string | undefined;
    try {
      const body = await request.json();
      subject = body.subject;
    } catch {
      // Body vacío es válido
    }

    // La contraseña es el documento de identidad (username)
    const password = user.username;

    // Enviar credenciales
    const result = await phidiasCredentialsService.sendCredentials({
      phidiasId: user.id_phidias,
      fullName: user.fullName,
      username: user.username,
      password,
      subject,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Credenciales enviadas a ${user.fullName}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error al enviar credenciales:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
