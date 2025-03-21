// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { normalizarSeccion } from "@/lib/constantes"; // Import

const prisma = new PrismaClient();

export async function GET() {
  try {
    const students = await prisma.estudiantes.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        seccion: true, 
        nivel: true,
      },
    });

    // Normalize the 'seccion' field and use correct keys
    const normalizedStudents = students.map((student) => ({
      id: `${student.id}-${student.codigo}`,
      name: student.nombre ?? "",
      section: student.seccion ? normalizarSeccion(student.seccion) : "", // Normalize and handle null
      level: student.nivel ?? "", // Keep level for other purposes if needed
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