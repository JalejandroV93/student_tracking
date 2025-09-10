import { transformInfraction, transformStudent } from "@/lib/utils";
import {
  getActiveSchoolYear,
  getSchoolYearById,
} from "@/lib/school-year-utils";
import { prisma } from "@/lib/prisma";
// src/app/api/students/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const countOnly = searchParams.get("countOnly");
    const schoolYearId = searchParams.get("schoolYearId");

    // Determinar qué año académico usar
    let targetSchoolYear;
    if (schoolYearId && schoolYearId !== "active") {
      targetSchoolYear = await getSchoolYearById(parseInt(schoolYearId));
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "School year not found" },
          { status: 404 }
        );
      }
    } else {
      targetSchoolYear = await getActiveSchoolYear();
      if (!targetSchoolYear) {
        return NextResponse.json(
          { error: "No active school year found" },
          { status: 400 }
        );
      }
    }

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
            orderBy: { fecha: "desc" },
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
      const transformedInfractions = student.faltas.map((falta) =>
        transformInfraction(falta, String(student.id))
      );

      // Mapeo para vincular correctamente cada seguimiento con su falta correspondiente
      const followUps: {
        id: string;
        infractionId: string; // Utilizamos el hash de la falta, no el id_caso
        followUpNumber: number;
        date: string;
        type: string;
        details: string;
        author: string;
      }[] = [];
      student.faltas.forEach((falta) => {
        falta.casos.forEach((caso) => {
          caso.seguimientos.forEach((seguimiento) => {
            followUps.push({
              id: `FUP${seguimiento.id_seguimiento}`,
              infractionId: falta.hash, // Utilizamos el hash de la falta, no el id_caso
              followUpNumber: seguimiento.tipo_seguimiento?.includes(
                "Seguimiento"
              )
                ? parseInt(seguimiento.tipo_seguimiento.split(" ")[1], 10) ||
                  seguimiento.id_seguimiento
                : seguimiento.id_seguimiento,
              date: seguimiento.fecha_seguimiento
                ? seguimiento.fecha_seguimiento.toISOString().split("T")[0]
                : "",
              type: seguimiento.tipo_seguimiento ?? "",
              details: seguimiento.detalles ?? "",
              author: seguimiento.autor ?? "",
            });
          });
        });
      });

      return NextResponse.json({
        student: transformedStudent,
        infractions: transformedInfractions,
        followUps: followUps,
      });
    } else {
      // Fetch all students with their most recent infraction data for grado/nivel
      // from the specific school year
      const students = await prisma.estudiantes.findMany({
        select: {
          id: true,
          codigo: true,
          nombre: true,
          faltas: {
            where: {
              school_year_id: targetSchoolYear.id,
            },
            select: {
              nivel: true,
              seccion: true,
              fecha: true,
            },
            orderBy: { fecha: "desc" },
            take: 1,
          },
        },
        orderBy: { nombre: "asc" },
      });

      // Transform students with their infractions
      const transformedStudents = students.map((student) => {
        const latestInfraction = student.faltas[0];
        return transformStudent(
          student,
          latestInfraction?.seccion || undefined,
          latestInfraction?.nivel || undefined
        );
      });

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
