// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  transformFollowUp,
  transformInfraction,
  transformStudent,
} from "@/lib/utils";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const countOnly = searchParams.get("countOnly");

    // Si solo necesitamos el conteo, hacemos una consulta optimizada
    if (countOnly === "true") {
      const count = await prisma.estudiantes.count();
      return NextResponse.json({ count });
    }

    if (studentId) {
      // Fetch single student with infractions and follow-ups
      const id = parseInt(studentId, 10);

      const student = await prisma.estudiantes.findUnique({
        where: {
          id: id,
        },
        include: {
          faltas: {
            include: {
              casos: {
                include: {
                  seguimientos: true,
                },
              },
            },
            orderBy: { fecha: 'desc' }
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      // Transform the student data
      const transformedStudent = transformStudent(student);

      // Transform infractions and follow-ups
      const transformedInfractions = student.faltas.map(transformInfraction);
      const followUps = student.faltas.flatMap((falta) =>
        falta.casos.flatMap((caso) => caso.seguimientos)
      );

      const transformedFollowUps = followUps.map(transformFollowUp);

      return NextResponse.json({
        student: transformedStudent,
        infractions: transformedInfractions,
        followUps: transformedFollowUps,
      });
    } else {
      // Fetch all students with complete data
      const students = await prisma.estudiantes.findMany({
        select: {
          id: true,
          codigo: true,
          nombre: true,
          grado: true,
          nivel: true,
        },
        orderBy: { nombre: 'asc' }
      });

      // Transform students with their infractions
      const transformedStudents = students.map(transformStudent);

      return NextResponse.json(transformedStudents, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Error fetching students" },
      { status: 500 }
    );
  }
}
