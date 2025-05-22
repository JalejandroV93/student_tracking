// src/app/api/followups/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let permittedAreaNames: string[] | undefined = undefined;
    let queryWhereClause = {};

    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.PSYCHOLOGY
    ) {
      const areaPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true },
        include: { area: true },
      });
      permittedAreaNames = areaPermissions.map(
        (permission) => permission.area.name
      );

      if (permittedAreaNames.length === 0) {
        return NextResponse.json([]); // No areas permitted, so no follow-ups to show
      }
      queryWhereClause = {
        caso: {
          falta: {
            nivel: { in: permittedAreaNames },
          },
        },
      };
    }

    const seguimientos = await prisma.seguimientos.findMany({
      where: queryWhereClause,
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
      orderBy: { fecha_seguimiento: "desc" }, // Optional: good for listing
    });

    const transformedFollowUps = seguimientos.map((followUp) => {
      const infractionId = followUp.caso.hash_falta;
      return {
        id: `FUP${followUp.id_seguimiento}`,
        infractionId: infractionId,
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
      };
    });

    return NextResponse.json(transformedFollowUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    let errorMessage = "Error fetching follow-ups";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST endpoint que acepta ambos formatos de datos
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Recibido en POST /api/followups:", body);

    let id_caso: number;
    let tipo_seguimiento: string;
    let fecha_seguimiento: string;
    let detalles: string;
    let autor: string;
    let followUpNumber: number;
    let targetNivel: string | null = null;

    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.PSYCHOLOGY
    ) {
      const areaPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true }, // Assuming canView implies canEdit for now
        include: { area: true },
      });
      const permittedAreaNames = areaPermissions.map(
        (permission) => permission.area.name
      );

      if (permittedAreaNames.length === 0) {
        return NextResponse.json(
          { error: "No tiene permiso para crear seguimientos en ninguna área." },
          { status: 403 }
        );
      }

      if (body.infractionId) {
        const falta = await prisma.faltas.findUnique({
          where: { hash: body.infractionId },
        });
        if (falta) {
          targetNivel = falta.nivel;
        }
      } else if (body.id_caso) {
        const casoWithFalta = await prisma.casos.findUnique({
          where: { id_caso: Number(body.id_caso) },
          include: { falta: true },
        });
        if (casoWithFalta && casoWithFalta.falta) {
          targetNivel = casoWithFalta.falta.nivel;
        }
      }

      if (!targetNivel || !permittedAreaNames.includes(targetNivel)) {
        return NextResponse.json(
          { error: "No tiene permiso para agregar seguimientos a infracciones de este nivel." },
          { status: 403 }
        );
      }
    }

    // 1. Detectar formato de datos recibidos y procesar
    if (
      body.id_caso &&
      body.tipo_seguimiento &&
      body.fecha_seguimiento &&
      body.detalles &&
      body.author
    ) {
      id_caso = Number(body.id_caso);
      tipo_seguimiento = body.tipo_seguimiento;
      fecha_seguimiento = body.fecha_seguimiento;
      detalles = body.detalles;
      autor = body.author; // Assuming author is currentUser.name or similar from body
      followUpNumber = body.followUpNumber || 1; // Default if not provided
    } else if (body.infractionId) {
      const falta = await prisma.faltas.findUnique({
        where: { hash: body.infractionId },
      });

      if (falta) {
        // Authorization check for non-admin/psychology was done above using targetNivel
        const caso = await prisma.casos.findFirst({
          where: { hash_falta: falta.hash },
        });

        if (caso) {
          id_caso = caso.id_caso;
        } else {
          // Create caso if not exists
          try {
            const nuevoCaso = await prisma.casos.create({
              data: {
                hash_falta: falta.hash,
                fecha_inicio: new Date(), // Default date
                estado: "Abierto", // Default state
              },
            });
            id_caso = nuevoCaso.id_caso;
          } catch (error) {
            console.error("Error creando caso automáticamente:", error);
            return NextResponse.json(
              { error: "Error al crear caso asociado automáticamente." },
              { status: 500 }
            );
          }
        }
        followUpNumber = body.followUpNumber || 1;
        tipo_seguimiento = `Seguimiento ${followUpNumber} - ${body.type || "Tipo II"}`; // body.type might be 'Type I' or 'Type II'
        fecha_seguimiento = body.date;
        detalles = body.details;
        autor = body.author || currentUser.name || "Sistema"; // Ensure author is set
      } else {
        // Falta not found by infractionId
        return NextResponse.json(
          { error: "Infracción no encontrada para el ID proporcionado." },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Campos requeridos faltantes para crear seguimiento." },
        { status: 400 }
      );
    }
    
    if (!id_caso) { // Should be set by now if logic is correct
        return NextResponse.json({error: "No se pudo determinar el caso para el seguimiento."}, {status: 500});
    }


    // 2. Crear el seguimiento con los datos estandarizados
    const followUp = await prisma.seguimientos.create({
      data: {
        id_caso: id_caso,
        tipo_seguimiento: tipo_seguimiento,
        fecha_seguimiento: new Date(fecha_seguimiento),
        detalles: detalles,
        autor: autor,
      },
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
    });

    // 3. Transformar la respuesta al formato FollowUp
    const transformedFollowUp = {
      id: `FUP${followUp.id_seguimiento}`,
      infractionId: followUp.caso.hash_falta,
      followUpNumber: followUpNumber || followUp.id_seguimiento, // Ensure followUpNumber is sensible
      date: followUp.fecha_seguimiento
        ? followUp.fecha_seguimiento.toISOString().split("T")[0]
        : "",
      type: followUp.tipo_seguimiento,
      details: followUp.detalles,
      author: followUp.autor,
    };

    return NextResponse.json(transformedFollowUp);
  } catch (error) {
    console.error("Error creating follow-up:", error);
    let errorMessage = "Error creating follow-up";
    if (error instanceof Error && error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage, details: (error as Error).message },
      { status: 500 }
    );
  }
}
