// src/app/api/v1/followups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";



// GET endpoint para obtener un seguimiento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const followUpId = (await params).id.replace("FUP", ""); // Remove FUP prefix
    const id = parseInt(followUpId, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de seguimiento inválido" },
        { status: 400 }
      );
    }

    const followUp = await prisma.seguimientos.findUnique({
      where: {
        id_seguimiento: id,
      },
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: "Seguimiento no encontrado" },
        { status: 404 }
      );
    }

    // Transform to FollowUp format
    const transformedFollowUp = {
      id: `FUP${followUp.id_seguimiento}`,
      infractionId: followUp.caso.hash_falta,
      followUpNumber: followUp.tipo_seguimiento?.includes("Seguimiento")
        ? parseInt(followUp.tipo_seguimiento.split(" ")[1], 10) ||
          followUp.id_seguimiento
        : followUp.id_seguimiento,
      date: followUp.fecha_seguimiento
        ? followUp.fecha_seguimiento.toISOString().split("T")[0]
        : "",
      type: followUp.tipo_seguimiento ?? "",
      details: followUp.detalles ?? "",
      author: followUp.autor ?? "",
      // TODO: Añadir cuando estén disponibles los nuevos campos
      // createdAt: followUp.created_at
      //   ? followUp.created_at.toISOString().split("T")[0]
      //   : undefined,
      // updatedAt: followUp.updated_at
      //   ? followUp.updated_at.toISOString().split("T")[0]
      //   : undefined,
      // updatedBy: followUp.updated_by || undefined,
    };

    return NextResponse.json(transformedFollowUp);
  } catch (error) {
    console.error("Error fetching follow-up:", error);
    return NextResponse.json(
      { error: "Error al obtener seguimiento" },
      { status: 500 }
    );
  }
}

// PUT endpoint para actualizar un seguimiento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const followUpId = (await params).id.replace("FUP", ""); // Remove FUP prefix
    const id = parseInt(followUpId, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de seguimiento inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validar que el seguimiento existe
    const existingFollowUp = await prisma.seguimientos.findUnique({
      where: {
        id_seguimiento: id,
      },
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
    });

    if (!existingFollowUp) {
      return NextResponse.json(
        { error: "Seguimiento no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el seguimiento
    const updatedFollowUp = await prisma.seguimientos.update({
      where: {
        id_seguimiento: id,
      },
      data: {
        fecha_seguimiento: body.date ? new Date(body.date) : undefined,
        detalles: body.details,
        // TODO: Añadir cuando esté disponible el nuevo campo
        // updated_by: currentUser.fullName || currentUser.username,
        // updated_at se actualiza automáticamente con @updatedAt
      },
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
    });

    // Transform to FollowUp format
    const transformedFollowUp = {
      id: `FUP${updatedFollowUp.id_seguimiento}`,
      infractionId: updatedFollowUp.caso.hash_falta,
      followUpNumber: updatedFollowUp.tipo_seguimiento?.includes("Seguimiento")
        ? parseInt(updatedFollowUp.tipo_seguimiento.split(" ")[1], 10) ||
          updatedFollowUp.id_seguimiento
        : updatedFollowUp.id_seguimiento,
      date: updatedFollowUp.fecha_seguimiento
        ? updatedFollowUp.fecha_seguimiento.toISOString().split("T")[0]
        : "",
      type: updatedFollowUp.tipo_seguimiento ?? "",
      details: updatedFollowUp.detalles ?? "",
      author: updatedFollowUp.autor ?? "",
      // TODO: Añadir cuando estén disponibles los nuevos campos
      // createdAt: updatedFollowUp.created_at
      //   ? updatedFollowUp.created_at.toISOString().split("T")[0]
      //   : undefined,
      // updatedAt: updatedFollowUp.updated_at
      //   ? updatedFollowUp.updated_at.toISOString().split("T")[0]
      //   : undefined,
      // updatedBy: updatedFollowUp.updated_by || undefined,
    };

    return NextResponse.json(transformedFollowUp);
  } catch (error) {
    console.error("Error updating follow-up:", error);
    return NextResponse.json(
      { error: "Error al actualizar seguimiento" },
      { status: 500 }
    );
  }
}

// DELETE endpoint para eliminar un seguimiento (opcional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }   
): Promise<NextResponse> {
  try {
    // Verificar autenticación
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const followUpId = (await params).id.replace("FUP", ""); // Remove FUP prefix
    const id = parseInt(followUpId, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de seguimiento inválido" },
        { status: 400 }
      );
    }

    // Verificar que el seguimiento existe
    const existingFollowUp = await prisma.seguimientos.findUnique({
      where: {
        id_seguimiento: id,
      },
    });

    if (!existingFollowUp) {
      return NextResponse.json(
        { error: "Seguimiento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el seguimiento
    await prisma.seguimientos.delete({
      where: {
        id_seguimiento: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting follow-up:", error);
    return NextResponse.json(
      { error: "Error al eliminar seguimiento" },
      { status: 500 }
    );
  }
}
