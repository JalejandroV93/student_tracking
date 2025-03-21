// src/app/api/followups/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const followUps = await prisma.seguimientos.findMany({
      select: {
        id_seguimiento: true,
        id_caso: true,
        tipo_seguimiento: true, // Include if needed
        fecha_seguimiento: true,
        detalles: true,         // Include if needed
        autor: true,              // Include if needed
      },
    });

    const transformedFollowUps = followUps.map((followUp) => ({
      id: `FUP${followUp.id_seguimiento}`, // Consistent ID format
      infractionId: `${followUp.id_caso}`, // Ensure correct infraction ID format
      followUpNumber: followUp.id_seguimiento, // Use id_seguimiento as followUpNumber
      date: followUp.fecha_seguimiento ? followUp.fecha_seguimiento.toISOString().split("T")[0] : "", // Format date
      type: followUp.tipo_seguimiento ?? "", // Added type
      details: followUp.detalles ?? "", // Added details
      author: followUp.autor ?? "", // Added author
    }));

    return NextResponse.json(transformedFollowUps);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json(
      { error: "Error fetching follow-ups" },
      { status: 500 }
    );
  }
}

// POST remains largely the same, but ensure data consistency
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate that the required fields are present in the request body
        if (!body.id_caso || !body.tipo_seguimiento || !body.fecha_seguimiento || !body.detalles || !body.autor) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { id_caso, tipo_seguimiento, fecha_seguimiento, detalles, autor } = body;

        const followUp = await prisma.seguimientos.create({
            data: {
                id_caso: Number(id_caso), // Convert id_caso to number
                tipo_seguimiento,
                fecha_seguimiento: new Date(fecha_seguimiento), // Ensure date is valid
                detalles,
                autor,
            },
        });

         const transformedFollowUp = {
            id: `FUP${followUp.id_seguimiento}`,
            infractionId: `${followUp.id_caso}`,
            followUpNumber: followUp.id_seguimiento,
            date: followUp.fecha_seguimiento ? followUp.fecha_seguimiento.toISOString().split("T")[0] : "",
            type: followUp.tipo_seguimiento,
            details: followUp.detalles,
            author: followUp.autor
        };


        return NextResponse.json(transformedFollowUp);
    } catch (error) {
        console.error("Error creating follow-up:", error);
        return NextResponse.json({ error: "Error creating follow-up" }, { status: 500 });
    }
}
