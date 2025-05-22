import { transformInfraction, transformStudent } from "@/lib/utils";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
// src/app/api/students/route.ts
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const countOnly = searchParams.get("countOnly");

    let permittedAreaNames: string[] = [];
    if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.PSYCHOLOGY) {
      const areaPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true },
        include: { area: true },
      });
      permittedAreaNames = areaPermissions.map(
        (permission) => permission.area.name
      );
      if (permittedAreaNames.length === 0 && !studentId) { // if studentId is present, we check later
        if (countOnly === "true") {
            return NextResponse.json({ count: 0 });
        }
        return NextResponse.json([]);
      }
    }

    const isRestrictedUser = currentUser.role !== Role.ADMIN && currentUser.role !== Role.PSYCHOLOGY;

    // Si solo necesitamos el conteo, hacemos una consulta optimizada
    if (countOnly === "true") {
      const count = await prisma.estudiantes.count({
        where: isRestrictedUser
          ? { nivel: { in: permittedAreaNames } }
          : {},
      });
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

      if (isRestrictedUser && student.nivel && !permittedAreaNames.includes(student.nivel)) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this student's area." },
          { status: 403 }
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
      // Fetch all students with complete data
      const students = await prisma.estudiantes.findMany({
        where: isRestrictedUser
          ? { nivel: { in: permittedAreaNames } }
          : {},
        select: {
          id: true,
          codigo: true,
          nombre: true,
          grado: true,
          nivel: true,
        },
        orderBy: { nombre: "asc" },
      });
      
      if (isRestrictedUser && permittedAreaNames.length === 0 && students.length > 0) {
        // This case should ideally not be reached if the initial check for permittedAreaNames is correct
        // but as a safeguard: if a restricted user has no permitted areas, they should not see any students.
        return NextResponse.json([]);
      }


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
    // Check if the error is an instance of Error and has a message property
    let errorMessage = "Error fetching students";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
