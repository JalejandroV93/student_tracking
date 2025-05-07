// src/app/api/followups/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Necesitamos obtener la información del caso y la falta para vincular correctamente
    const seguimientos = await prisma.seguimientos.findMany({
      include: {
        caso: {
          include: {
            falta: true,
          },
        },
      },
    });

    const transformedFollowUps = seguimientos.map((followUp) => {
      // Obtenemos el hash de la falta que sirve como ID de infracción
      const infractionId = followUp.caso.hash_falta;

      return {
        id: `FUP${followUp.id_seguimiento}`, // Consistent ID format
        infractionId: infractionId, // Usar el hash de la falta como ID de infracción
        followUpNumber: followUp.tipo_seguimiento?.includes("Seguimiento")
          ? parseInt(followUp.tipo_seguimiento.split(" ")[1], 10) ||
            followUp.id_seguimiento
          : followUp.id_seguimiento, // Use tipo_seguimiento to get the follow-up number if available
        date: followUp.fecha_seguimiento
          ? followUp.fecha_seguimiento.toISOString().split("T")[0]
          : "", // Format date
        type: followUp.tipo_seguimiento ?? "", // Added type
        details: followUp.detalles ?? "", // Added details
        author: followUp.autor ?? "", // Added author
      };
    });

    return NextResponse.json(transformedFollowUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json(
      { error: "Error fetching follow-ups" },
      { status: 500 }
    );
  }
}

// POST endpoint que acepta ambos formatos de datos
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Recibido en POST /api/followups:", body);

    // Variables para almacenar los datos estandarizados
    let id_caso: number;
    let tipo_seguimiento: string;
    let fecha_seguimiento: string;
    let detalles: string;
    let autor: string;
    let followUpNumber: number;

    // 1. Detectar formato de datos recibidos
    if (
      body.id_caso &&
      body.tipo_seguimiento &&
      body.fecha_seguimiento &&
      body.detalles &&
      body.autor
    ) {
      // Formato del backend
      id_caso = Number(body.id_caso);
      tipo_seguimiento = body.tipo_seguimiento;
      fecha_seguimiento = body.fecha_seguimiento;
      detalles = body.detalles;
      autor = body.autor;
      followUpNumber = body.followUpNumber || 1;
    } else if (body.infractionId) {
      // Formato del frontend (FollowUp)
      // Primero buscamos directamente la falta por su hash (que es el ID primario)
      const falta = await prisma.faltas.findUnique({
        where: {
          hash: body.infractionId,
        },
      });

      // Si encontramos la falta, ahora buscamos el caso asociado
      if (falta) {
        const caso = await prisma.casos.findFirst({
          where: {
            hash_falta: falta.hash,
          },
        });

        if (caso) {
          id_caso = caso.id_caso;
          // Usar número de seguimiento para identificarlo correctamente
          followUpNumber = body.followUpNumber || 1;
          tipo_seguimiento = `Seguimiento ${followUpNumber} - ${
            body.type || "Tipo II"
          }`;
          fecha_seguimiento = body.date;
          detalles = body.details;
          autor = body.author;
        } else {
          // Si no existe un caso para esta falta, intentamos crearlo
          try {
            const nuevoCaso = await prisma.casos.create({
              data: {
                hash_falta: falta.hash,
                fecha_inicio: new Date(),
                estado: "Abierto",
              },
            });

            id_caso = nuevoCaso.id_caso;
            followUpNumber = body.followUpNumber || 1;
            tipo_seguimiento = `Seguimiento ${followUpNumber} - ${
              body.type || "Tipo II"
            }`;
            fecha_seguimiento = body.date;
            detalles = body.details;
            autor = body.author;
          } catch (error) {
            console.error("Error creando caso automáticamente:", error);
            return NextResponse.json(
              {
                error:
                  "Se encontró la falta pero no tiene un caso asociado y no se pudo crear automáticamente",
                infractionId: body.infractionId,
              },
              { status: 500 }
            );
          }
        }
      } else {
        // Si no encontramos la falta, intentamos buscar el caso directamente por hash_falta
        const caso = await prisma.casos.findFirst({
          where: {
            hash_falta: body.infractionId,
          },
        });

        if (!caso) {
          // Diagnóstico adicional - listar algunos casos para debug
          const ejemploCasos = await prisma.casos.findMany({
            take: 3,
            select: {
              id_caso: true,
              hash_falta: true,
            },
          });

          return NextResponse.json(
            {
              error:
                "No se encontró ni la falta ni el caso para el ID proporcionado",
              infractionId: body.infractionId,
              ejemploCasos: ejemploCasos,
            },
            { status: 404 }
          );
        }

        id_caso = caso.id_caso;
        followUpNumber = body.followUpNumber || 1;
        tipo_seguimiento = `Seguimiento ${followUpNumber} - ${
          body.type || "Tipo II"
        }`;
        fecha_seguimiento = body.date;
        detalles = body.details;
        autor = body.author;
      }
    } else {
      // Datos incompletos
      return NextResponse.json(
        {
          error: "Campos requeridos faltantes",
          recibido: body,
          requerido:
            "Formato 1: {id_caso, tipo_seguimiento, fecha_seguimiento, detalles, autor} o Formato 2: {infractionId, date, details, author, followUpNumber}",
        },
        { status: 400 }
      );
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
      followUpNumber: followUpNumber || followUp.id_seguimiento,
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
    return NextResponse.json(
      { error: "Error creating follow-up", details: (error as Error).message },
      { status: 500 }
    );
  }
}
