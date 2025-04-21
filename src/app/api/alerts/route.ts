import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSectionCategory, AlertStatus } from "@/lib/constantes";
import { getStudentTypeICount } from "@/lib/utils";

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
    const [students, infractions] = await Promise.all([
      prisma.estudiantes.findMany({
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
        include: {
          casos: true,
        },
      }),
    ]);

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
        const typeICount = getStudentTypeICount(student.id, infractions);
        const typeIICount = infractions.filter(
          (inf) => inf.estudianteId === student.id && inf.tipo === "Tipo II"
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
