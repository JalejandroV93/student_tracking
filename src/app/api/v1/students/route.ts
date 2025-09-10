import { transformInfraction, transformStudent } from "@/lib/utils";
import {
  getActiveSchoolYear,
  getSchoolYearById,
} from "@/lib/school-year-utils";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@prisma/client";
import { getSectionCategory } from "@/lib/constantes";
// src/app/api/students/route.ts
import { NextResponse } from "next/server";

// Función para filtrar estudiantes basado en permisos del usuario
async function filterStudentsByUserPermissions(
  students: Array<{
    id: string;
    name: string;
    grado: string;
    level: string;
    stats?: {
      total: number;
      tipoI: number;
      tipoII: number;
      tipoIII: number;
      pending: number;
      attended: number;
    } | undefined;
  }>,
  user: { id: string; role: Role }
) {
  // Los administradores ven todo
  if (user.role === "ADMIN") {
    return students;
  }

  // Psicología ve todas las áreas
  if (user.role === "PSYCHOLOGY") {
    return students;
  }

  // Coordinadores ven solo su área específica
  if (
    user.role === "PRESCHOOL_COORDINATOR" ||
    user.role === "ELEMENTARY_COORDINATOR" ||
    user.role === "MIDDLE_SCHOOL_COORDINATOR" ||
    user.role === "HIGH_SCHOOL_COORDINATOR"
  ) {
    const allowedSections: Record<Role, string[]> = {
      [Role.PRESCHOOL_COORDINATOR]: ["Preschool"],
      [Role.ELEMENTARY_COORDINATOR]: ["Elementary"],
      [Role.MIDDLE_SCHOOL_COORDINATOR]: ["Middle School"],
      [Role.HIGH_SCHOOL_COORDINATOR]: ["High School"],
      [Role.ADMIN]: [],
      [Role.PSYCHOLOGY]: [],
      [Role.TEACHER]: [],
      [Role.USER]: [],
      [Role.STUDENT]: [],
    };

    const userAllowedSections = allowedSections[user.role] || [];
    return students.filter((student) => {
      const studentSection = getSectionCategory(student.grado);
      return userAllowedSections.includes(studentSection);
    });
  }

  // Directores de grupo (TEACHER) ven solo su grupo específico
  if (user.role === "TEACHER") {
    // Obtener el usuario completo con el groupCode
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { groupCode: true },
    });

    if (!fullUser?.groupCode) {
      return []; // Si no tiene grupo asignado, no ve nada
    }

    return students.filter((student) => {
      return student.grado === fullUser.groupCode;
    });
  }

  // Por defecto, no ven nada
  return [];
}

// Función para obtener estadísticas de faltas por estudiante
async function getStudentInfractionStats(studentId: number, schoolYearId: number) {
  const infractions = await prisma.faltas.findMany({
    where: {
      id_estudiante: studentId,
      school_year_id: schoolYearId,
    },
    select: {
      tipo_falta: true,
      attended: true,
    },
  });

  const stats = {
    total: infractions.length,
    tipoI: infractions.filter(inf => inf.tipo_falta === "Tipo I").length,
    tipoII: infractions.filter(inf => inf.tipo_falta === "Tipo II").length,
    tipoIII: infractions.filter(inf => inf.tipo_falta === "Tipo III").length,
    pending: infractions.filter(inf => !inf.attended).length,
    attended: infractions.filter(inf => inf.attended).length,
  };

  return stats;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const countOnly = searchParams.get("countOnly");
    const schoolYearId = searchParams.get("schoolYearId");
    const includeStats = searchParams.get("includeStats") === "true";

    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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
              tipo_falta: true,
              attended: true,
            },
            orderBy: { fecha: "desc" },
          },
        },
        orderBy: { nombre: "asc" },
      });

      // Transform students with their infractions and stats
      const transformedStudents = await Promise.all(
        students.map(async (student) => {
          const latestInfraction = student.faltas[0];
          const grado = latestInfraction?.seccion || "No especificado";
          const nivel = latestInfraction?.nivel || "No especificado";
          
          let stats = undefined;
          if (includeStats) {
            stats = await getStudentInfractionStats(student.id, targetSchoolYear.id);
          }

          return {
            ...transformStudent(student, grado, nivel),
            stats: stats,
          };
        })
      );

      // Aplicar filtrado basado en permisos del usuario
      const filteredStudents = await filterStudentsByUserPermissions(
        transformedStudents,
        currentUser
      );

      return NextResponse.json(filteredStudents, {
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
