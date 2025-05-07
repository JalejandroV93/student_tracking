// src/app/api/infractions/[hash]/attend/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AttendRequestBody {
  attended: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;
  if (!hash) {
    return NextResponse.json(
      { error: "Infraction hash is required" },
      { status: 400 }
    );
  }

  try {
    const body: AttendRequestBody = await request.json();
    const { attended } = body;

    if (typeof attended !== "boolean") {
      return NextResponse.json(
        { error: "Invalid 'attended' value in request body" },
        { status: 400 }
      );
    }

    const updatedInfraction = await prisma.faltas.update({
      where: { hash: hash },
      data: {
        attended: attended,
        // Optionally update an 'attended_at' timestamp if needed
        attended_at: attended ? new Date() : null,
      },
      // Select only necessary fields to return if needed
      select: {
        hash: true,
        attended: true,
      },
    });

    if (!updatedInfraction) {
      return NextResponse.json(
        { error: "Infraction not found" },
        { status: 404 }
      );
    }

    console.log(`Infraction ${hash} marked as attended: ${attended}`);
    return NextResponse.json(updatedInfraction);
  } catch (error) {
    console.error(`Error updating infraction ${hash} attended status:`, error);
    if (error instanceof SyntaxError) {
      // JSON parsing error
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Prisma specific errors can be checked here if necessary
    // e.g., if (error.code === 'P2025') return not found
    return NextResponse.json(
      { error: "Failed to update infraction status" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
