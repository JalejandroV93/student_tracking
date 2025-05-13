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

    // Obtener todos los registros de SyncMetadata
    const metadata = await prisma.syncMetadata.findMany({
      orderBy: {
        tabla: "asc",
      },
    });

    // Obtener último registro de SyncHistory para saber si hay sincronización en curso
    const currentSync = await prisma.syncHistory.findFirst({
      where: {
        status: "running",
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    // Obtener última sincronización exitosa
    const lastSuccessSync = await prisma.syncHistory.findFirst({
      where: {
        status: "success",
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json({
      metadata,
      isSyncing: !!currentSync,
      lastSync: lastSuccessSync?.completedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error obteniendo estado de sincronización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
