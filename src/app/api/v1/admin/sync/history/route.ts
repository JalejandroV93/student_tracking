import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    // Verificar que el usuario es administrador
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener historial de sincronización (últimos 10 registros)
    const history = await prisma.syncHistory.findMany({
      orderBy: {
        startedAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      history,
    });
  } catch (error) {
    console.error("Error obteniendo historial de sincronización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
