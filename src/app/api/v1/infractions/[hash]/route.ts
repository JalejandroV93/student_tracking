import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
// src/app/api/v1/infractions/[hash]/route.ts
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
  
  if (!hash) {
    return NextResponse.json(
      { error: "Infraction hash is required" },
      { status: 400 }
    );
  }

  try {
    // Verify authentication and authorization
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para ver este usuario" },
        { status: 403 }
      );
    }

    // Check if infraction exists before deletion
    const existingInfraction = await prisma.faltas.findUnique({
      where: { hash: hash },
      select: {
        hash: true,
        descripcion_falta: true,
        fecha: true,
        numero_falta: true,
        id_estudiante: true,
        codigo_estudiante: true,
      },
    });

    if (!existingInfraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 }
      );
    }

    

    // Check if this infraction has related cases
    const relatedCases = await prisma.casos.findMany({
      where: {
        hash_falta: hash,
      },
    });

    if (relatedCases.length > 0) {
      // Delete related cases and their follow-ups
      for (const caso of relatedCases) {
        await prisma.seguimientos.deleteMany({
          where: {
            id_caso: caso.id_caso,
          },
        });
        
        await prisma.casos.delete({
          where: {
            id_caso: caso.id_caso,
          },
        });
      }
    }

    // Delete the infraction
    const deletedInfraction = await prisma.faltas.delete({
      where: { hash: hash },
    });
    
    return NextResponse.json({
      message: "Infraction deleted successfully",
      deletedInfraction: {
        hash: deletedInfraction.hash,
        descripcion_falta: deletedInfraction.descripcion_falta,
        fecha: deletedInfraction.fecha,
        numero_falta: deletedInfraction.numero_falta,
      },
    });

  } catch (error) {
    console.error(`Error deleting infraction ${hash}:`, error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Infraction not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to delete infraction" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}