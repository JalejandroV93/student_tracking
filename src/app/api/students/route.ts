// src/app/api/students/route.ts (MODIFIED TO HANDLE SINGLE STUDENT FETCH)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { transformFollowUp, transformInfraction, transformStudent } from "@/lib/utils";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (studentId) {
      // Fetch single student with infractions and follow-ups
      const [idPart, codePart] = studentId.split("-");
      const id = parseInt(idPart, 10);
      const code = parseInt(codePart, 10);


      const student = await prisma.estudiantes.findUnique({
        where: {
          id_codigo: {
             id: id,
             codigo: code,
          }

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
          },
        },
      });


      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

        // Transform the student data
      const transformedStudent = transformStudent(student);

      // Transform infractions and follow-ups
      const transformedInfractions = student.faltas.map(transformInfraction);
      const followUps = student.faltas.flatMap(falta =>
        falta.casos.flatMap(caso => caso.seguimientos)
      );

      const transformedFollowUps = followUps.map(transformFollowUp)


      return NextResponse.json({
        student: transformedStudent,
        infractions: transformedInfractions,
        followUps: transformedFollowUps
      });

    } else {
      // Fetch all students (original logic)
      const students = await prisma.estudiantes.findMany({
        select: {
          id: true,
          codigo: true,
          nombre: true,
          grado: true,
          nivel: true,
        },
      });

      const normalizedStudents = students.map(transformStudent);
      return NextResponse.json(normalizedStudents);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Error fetching students" },
      { status: 500 }
    );
  }
}