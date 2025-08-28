import { getSectionCategory } from "@/lib/constantes";
import {
  getStudentTypeICount,
  transformInfraction,
  transformStudent,
} from "@/lib/utils";
import { AlertStatus } from "@/lib/utils";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
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

    // Fetch all students and infractions
    const [rawStudents, rawInfractions] = await Promise.all([
      prisma.estudiantes.findMany({
        select: {
          id: true,
          codigo: true,
          nombre: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.faltas.findMany({
        where: {
          // Solo queremos faltas no atendidas para las alertas
          attended: false,
        },
        include: {
          casos: true,
        },
      }),
    ]);

    // Transformar las faltas al formato de Infraction con IDs de estudiantes correctos
    const infractions = rawInfractions.map((infraction) => {
      const studentId = `${infraction.id_estudiante}-${infraction.codigo_estudiante}`;
      return transformInfraction(infraction, studentId);
    });

    // Crear un mapa de estudiantes con su grado y nivel más reciente desde las faltas
    const studentGradoMap = new Map<string, { grado: string; nivel: string }>();
    rawInfractions.forEach((infraction) => {
      const studentId = `${infraction.id_estudiante}-${infraction.codigo_estudiante}`;
      if (infraction.seccion && infraction.nivel) {
        studentGradoMap.set(studentId, {
          grado: infraction.seccion,
          nivel: infraction.nivel,
        });
      }
    });

    // Transformar estudiantes con grado y nivel desde las faltas
    const students = rawStudents.map((student) => {
      const studentId = `${student.id}-${student.codigo}`;
      const studentInfo = studentGradoMap.get(studentId);
      return transformStudent(student, studentInfo?.grado, studentInfo?.nivel);
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
    return NextResponse.json(
      { error: "Error processing alerts" },
      { status: 500 }
    );
  }
}
