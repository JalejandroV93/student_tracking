import { getSectionCategory } from "@/lib/constantes";
import { prisma } from "@/lib/prisma";
import { getActiveSchoolYear, getSchoolYearById } from "@/lib/school-year-utils";
import { getCurrentUser } from "@/lib/session";
import { getStudentTypeICount, transformInfraction, transformStudent } from "@/lib/utils";
import { AlertStatus } from "@/lib/utils";
import { filterStudentsByUserPermissions } from "@/lib/role-filters";
import { NextResponse } from "next/server";

// NOTA: Función movida a @/lib/role-filters.ts para reutilización

export async function GET(request: Request) {
  try {
    console.log("🚨 Alerts endpoint called");

    // Verificar autenticación
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const schoolYearId = searchParams.get("schoolYearId");

    console.log("📋 Request params:", { section, schoolYearId });
    console.log("👤 User:", { id: currentUser.id, role: currentUser.role });

    // Determinar qué año académico usar
    let targetSchoolYear;
    if (schoolYearId && schoolYearId !== "active") {
      // Si se especifica un año académico específico
      targetSchoolYear = await getSchoolYearById(parseInt(schoolYearId));
      if (!targetSchoolYear) {
        console.log("❌ School year not found:", schoolYearId);
        return NextResponse.json(
          { error: "School year not found" },
          { status: 404 }
        );
      }
    } else {
      // Si no se especifica o se pide el activo, usar el año académico activo
      targetSchoolYear = await getActiveSchoolYear();
      if (!targetSchoolYear) {
        console.log("❌ No active school year found");
        return NextResponse.json(
          { error: "No active school year found" },
          { status: 400 }
        );
      }
    }

    console.log("📅 Using school year:", {
      id: targetSchoolYear.id,
      name: targetSchoolYear.name,
    });

    // Fetch settings first
    const settings = await prisma.alertSettings.findMany();
    console.log("⚙️ Alert settings count:", settings.length);

    if (!settings || settings.length === 0) {
      console.log("❌ No alert settings configured");
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

    console.log("🗺️ Settings map:", settingsMap);

    // ⚡ OPTIMIZACIÓN: Filtrar directores de grupo a nivel de BD
    let teacherGroupFilter = {};
    if (currentUser.role === "TEACHER") {
      const teacherUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { groupCode: true },
      });

      if (!teacherUser?.groupCode) {
        console.log("🚨 TEACHER alertas: No groupCode asignado, retornando lista vacía");
        return NextResponse.json([]);
      }

      teacherGroupFilter = { grado: teacherUser.groupCode };
      console.log("🚨 TEACHER alertas: Filtrando en BD por grado:", teacherUser.groupCode);
    }

    // Fetch students and infractions filtered by school year
    const [rawStudents, rawInfractions] = await Promise.all([
      prisma.estudiantes.findMany({
        where: teacherGroupFilter, // Aplicar filtro de director de grupo
        select: {
          id: true,
          codigo: true,
          nombre: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.faltas.findMany({
        where: {
          // Filtrar por año académico y solo faltas no atendidas para las alertas
          school_year_id: targetSchoolYear.id,
          attended: false,
        },
        include: {
          casos: true,
        },
      }),
    ]);

    console.log(`👥 Found ${rawStudents.length} total students`);
    console.log(
      `⚠️ Found ${rawInfractions.length} unattended infractions for school year ${targetSchoolYear.name}`
    );

    // Transformar las faltas al formato de Infraction con IDs de estudiantes correctos
    const infractions = rawInfractions.map((infraction) => {
      const studentId = `${infraction.id_estudiante}-${infraction.codigo_estudiante}`;
      return transformInfraction(infraction, studentId);
    });

    console.log(`🔄 Transformed ${infractions.length} infractions`);

    // Count Type I infractions for debugging
    const typeICount = infractions.filter(
      (inf) => inf.type === "Tipo I"
    ).length;
    console.log(`🔴 Type I infractions: ${typeICount}`);

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
      console.log(`🔍 Student ${student.nombre} (${studentId}):`, studentInfo);
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

    // ⚡ OPTIMIZACIÓN: Solo aplicar filtrado frontend para coordinadores
    // Los directores (TEACHER) ya están filtrados en la consulta BD
    let filteredStudents;
    if (currentUser.role === "TEACHER") {
      // Ya filtrado en BD, no necesita filtrado adicional
      filteredStudents = sectionStudents;
      console.log("🚨 TEACHER alertas: Usando estudiantes ya filtrados en BD:", sectionStudents.length);
    } else {
      // Coordinadores y otros roles que necesitan filtrado por sección
      filteredStudents = await filterStudentsByUserPermissions(
        sectionStudents,
        currentUser
      );
    }

    // Process alerts for each student
    const studentsWithAlerts = filteredStudents
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

        // Debug log for each student
        if (typeICount > 0) {
          console.log(
            `🧮 Student ${student.name} (${
              student.id
            }): ${typeICount} Type I, section: ${sectionCategory}, thresholds: ${
              thresholds
                ? `${thresholds.primary}/${thresholds.secondary}`
                : "not found"
            }`
          );
        }

        if (!thresholds) {
          console.log(
            `❌ No thresholds found for section: ${sectionCategory} (student: ${student.name})`
          );
          return { ...student, alertStatus: null, typeIICount };
        }

        let alertStatus: AlertStatus | null = null;
        if (typeICount >= thresholds.secondary) {
          alertStatus = { level: "critical", count: typeICount };
          console.log(
            `🚨 CRITICAL alert for ${student.name}: ${typeICount} Type I (threshold: ${thresholds.secondary})`
          );
        } else if (typeICount >= thresholds.primary) {
          alertStatus = { level: "warning", count: typeICount };
          console.log(
            `⚠️ WARNING alert for ${student.name}: ${typeICount} Type I (threshold: ${thresholds.primary})`
          );
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

    console.log(
      `🎯 Final result: ${studentsWithAlerts.length} students with alerts`
    );

    return NextResponse.json(studentsWithAlerts);
  } catch (error) {
    console.error("❌ Error processing alerts:", error);
    return NextResponse.json(
      {
        error: "Error processing alerts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
