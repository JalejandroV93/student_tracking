import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import path from "path";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  try {
    // Verificar que el usuario es administrador
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar si ya hay una sincronización en curso
    const currentSync = await prisma.syncHistory.findFirst({
      where: {
        status: "running",
      },
    });

    if (currentSync) {
      return NextResponse.json(
        {
          error: "Ya hay una sincronización en curso",
          syncId: currentSync.id,
        },
        { status: 409 }
      );
    }

    // Crear registro de sincronización
    const syncRecord = await prisma.syncHistory.create({
      data: {
        status: "running",
      },
    });

    // Ejecutar la sincronización en un proceso separado
    const scriptPath = path.join(process.cwd(), "scripts", "sync.ts");
    const syncProcess = exec(`tsx ${scriptPath} ${syncRecord.id}`);

    // Registrar el resultado de la sincronización
    syncProcess.on("exit", async (code) => {
      if (code === 0) {
        // Sincronización exitosa
        await prisma.syncHistory.update({
          where: { id: syncRecord.id },
          data: {
            status: "success",
            completedAt: new Date(),
          },
        });
      } else {
        // Error en la sincronización
        await prisma.syncHistory.update({
          where: { id: syncRecord.id },
          data: {
            status: "error",
            completedAt: new Date(),
            error: `La sincronización falló con código ${code}`,
          },
        });
      }
    });

    syncProcess.stderr?.on("data", async (data) => {
      // Actualizar con error
      await prisma.syncHistory.update({
        where: { id: syncRecord.id },
        data: {
          error: data.toString(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Sincronización iniciada",
      syncId: syncRecord.id,
    });
  } catch (error) {
    console.error("Error iniciando sincronización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
