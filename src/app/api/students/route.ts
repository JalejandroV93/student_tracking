// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { normalizarSeccion } from "@/lib/constantes";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const students = await prisma.estudiantes.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        seccion: true,
        nivel: true, // Include 'nivel' if needed
      },
    });

    // Normalize the 'seccion' field
    const normalizedStudents = students.map((student) => ({
      id: `${student.id}-${student.codigo}`,
      name: student.nombre ?? "", // Use nullish coalescing for safety
      section: normalizarSeccion(student.seccion ?? ""), // Normalize
      level: student.nivel ?? "", // And added the level to the return
    }));

    return NextResponse.json(normalizedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Error fetching students" },
      { status: 500 }
    );
  }
}