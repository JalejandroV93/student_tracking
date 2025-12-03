import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { phidiasCredentialsService } from "@/services/phidias-credentials.service";
import { NextRequest, NextResponse } from "next/server";

interface BulkSendRequest {
  userIds: string[];
  subject?: string;
}

/**
 * POST /api/v1/users/send-credentials/bulk
 * Envía las credenciales de acceso a múltiples usuarios vía Phidias
 */
export async function POST(request: NextRequest) {
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
        {
          success: false,
          error: "Solo administradores pueden enviar credenciales",
        },
        { status: 403 }
      );
    }

    const body: BulkSendRequest = await request.json();

    if (
      !body.userIds ||
      !Array.isArray(body.userIds) ||
      body.userIds.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Se requiere al menos un ID de usuario" },
        { status: 400 }
      );
    }

    // Obtener los usuarios
    const users = await prisma.user.findMany({
      where: {
        id: { in: body.userIds },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        id_phidias: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se encontraron usuarios" },
        { status: 404 }
      );
    }

    // Filtrar usuarios con y sin id_phidias
    const usersWithPhidias = users.filter((u) => u.id_phidias);
    const usersWithoutPhidias = users.filter((u) => !u.id_phidias);

    // Si ninguno tiene id_phidias, retornar error
    if (usersWithPhidias.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ninguno de los usuarios seleccionados tiene ID de Phidias configurado",
          skipped: usersWithoutPhidias.map((u) => ({
            userId: u.id,
            username: u.username,
            reason: "Sin ID de Phidias",
          })),
        },
        { status: 400 }
      );
    }

    // Preparar datos para el envío
    const usersToSend = usersWithPhidias.map((user) => ({
      userId: user.id,
      phidiasId: user.id_phidias!,
      fullName: user.fullName,
      username: user.username,
      password: user.username, // La contraseña es el documento de identidad
    }));

    // Enviar credenciales en lote
    const result = await phidiasCredentialsService.sendBulkCredentials({
      users: usersToSend,
      subject: body.subject,
    });

    // Agregar usuarios omitidos al resultado
    const skipped = usersWithoutPhidias.map((u) => ({
      userId: u.id,
      username: u.username,
      success: false,
      error: "Sin ID de Phidias",
    }));

    return NextResponse.json({
      success: result.failed === 0 && skipped.length === 0,
      total: users.length,
      sent: result.sent,
      failed: result.failed,
      skipped: skipped.length,
      results: [...result.results, ...skipped],
    });
  } catch (error) {
    console.error("Error al enviar credenciales en lote:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
