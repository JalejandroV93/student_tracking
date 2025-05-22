import { getSectionCategory } from "@/lib/constantes";
import { getStudentTypeICount, transformInfraction, transformStudent } from "@/lib/utils";
import { AlertStatus } from "@/lib/utils";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    // Fetch settings first
    const settings = await prisma.alertSettings.findMany();
    if (!settings || settings.length === 0) {
      return NextResponse.json(
        { error: "Settings not configured" },
        { status: 400 }
      );
    }

    // Create a map of settings by section
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.seccion.toLowerCase()] = {
        primary: setting.primary_threshold,
        secondary: setting.secondary_threshold,
      };
      return acc;
    }, {} as Record<string, { primary: number; secondary: number }>);

    let permittedAreaNames: string[] | undefined = undefined;

    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.PSYCHOLOGY
    ) {
      const areaPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true },
        include: { area: true },
      });
      permittedAreaNames = areaPermissions.map(
        (permission) => permission.area.name
      );

      if (permittedAreaNames.length === 0) {
        // No areas permitted, so no alerts to show
        return NextResponse.json([]);
      }
    }

    // Define base where clauses
    const studentWhereClause: any = {};
    const infractionWhereClause: any = { attended: false };

    if (permittedAreaNames) {
      studentWhereClause.nivel = { in: permittedAreaNames };
      infractionWhereClause.nivel = { in: permittedAreaNames };
    }

    // Fetch students and infractions based on permissions
    const [rawStudents, rawInfractions] = await Promise.all([
      prisma.estudiantes.findMany({
        where: studentWhereClause,
        select: {
          id: true,
          codigo: true,
          nombre: true,
          grado: true,
          nivel: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.faltas.findMany({
        where: infractionWhereClause,
        include: {
          casos: true, // Assuming casos is needed for transformInfraction or other logic
        },
      }),
    ]);

    // Transformar estudiantes primero para tener IDs correctos
    const students = rawStudents.map(transformStudent);

    // Transformar las faltas al formato de Infraction con IDs de estudiantes correctos
    const infractions = rawInfractions.map((infraction) => {
      const studentId = `${infraction.id_estudiante}-${infraction.codigo_estudiante}`;
      return transformInfraction(infraction, studentId);
    });

    // Filter students by section if provided
    const sectionStudents = section
      ? students.filter((student) => {
          const sectionMap: Record<string, string> = {
            preschool: "Preschool",
            elementary: "Elementary",
            middle: "Middle School",
            high: "High School",
          };
          const targetSection = sectionMap[section];
          return (
            targetSection && getSectionCategory(student.grado) === targetSection
          );
        })
      : students;

    // Process alerts for each student
    const studentsWithAlerts = sectionStudents
      .map((student) => {
        const typeICount = getStudentTypeICount(
          student.id, // Usar el ID formato correcto
          infractions
        );
        const typeIICount = infractions.filter(
          (inf) => inf.studentId === student.id && inf.type === "Tipo II"
        ).length;

        const sectionCategory = getSectionCategory(student.grado);
        const thresholds = settingsMap[sectionCategory.toLowerCase()];

        if (!thresholds) {
          return { ...student, alertStatus: null, typeIICount };
        }

        let alertStatus: AlertStatus | null = null;
        if (typeICount >= thresholds.secondary) {
          alertStatus = { level: "critical", count: typeICount };
        } else if (typeICount >= thresholds.primary) {
          alertStatus = { level: "warning", count: typeICount };
        }

        return {
          ...student,
          alertStatus,
          typeICount,
          typeIICount,
        };
      })
      .filter((student) => student.alertStatus !== null)
      .sort((a, b) => {
        if (
          a.alertStatus?.level === "critical" &&
          b.alertStatus?.level !== "critical"
        )
          return -1;
        if (
          a.alertStatus?.level !== "critical" &&
          b.alertStatus?.level === "critical"
        )
          return 1;
        if (a.alertStatus && b.alertStatus) {
          return b.alertStatus.count - a.alertStatus.count;
        }
        return 0;
      });

    return NextResponse.json(studentsWithAlerts);
  } catch (error) {
    console.error("Error processing alerts:", error);
    let errorMessage = "Error processing alerts";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
