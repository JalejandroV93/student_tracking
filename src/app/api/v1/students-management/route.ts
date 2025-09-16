import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Role, Prisma } from "@prisma/client";
import { getActiveSchoolYear, getSchoolYearById } from "@/lib/school-year-utils";
import { asignarNivelAcademico } from "@/lib/academic-level-utils";

// GET - Obtener estudiantes con paginación y filtros
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const grado = searchParams.get("grado") || "";
    const nivel = searchParams.get("nivel") || "";
    const schoolYearId = searchParams.get("schoolYearId") || "active";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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

    // Construir filtros base
    const baseWhere: Prisma.EstudiantesWhereInput = {
      school_year_id: targetSchoolYear.id,
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: "insensitive" as const } },
          { firstname: { contains: search, mode: "insensitive" as const } },
          { lastname: { contains: search, mode: "insensitive" as const } },
          { codigo: { equals: isNaN(parseInt(search)) ? -1 : parseInt(search) } },
        ],
      }),
      ...(grado && { grado: { contains: grado, mode: "insensitive" as const } }),
    };

    // Si se especifica un filtro por nivel, buscar todas las secciones que corresponden a ese nivel
    let where: Prisma.EstudiantesWhereInput = baseWhere;
    if (nivel) {
      // Obtener todos los estudiantes para filtrar por nivel
      const allStudents = await prisma.estudiantes.findMany({
        where: baseWhere,
        select: {
          id: true,
          seccion: true,
        },
      });

      // Filtrar estudiantes por nivel académico
      const studentIdsWithLevel = allStudents
        .filter((student) => {
          const studentLevel = student.seccion ? asignarNivelAcademico(student.seccion) : "No especificado";
          return studentLevel === nivel;
        })
        .map((student) => student.id);

      // Crear filtro con IDs específicos
      where = {
        ...baseWhere,
        id: { in: studentIdsWithLevel },
      };
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener estudiantes con paginación
    const [students, total] = await Promise.all([
      prisma.estudiantes.findMany({
        where,
        select: {
          id: true,
          codigo: true,
          nombre: true,
          firstname: true,
          lastname: true,
          grado: true,
          seccion: true,
          photo_url: true,
          school_year_id: true,
        },
        orderBy: [
          { grado: "asc" },
          { seccion: "asc" },
          { nombre: "asc" },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.estudiantes.count({ where }),
    ]);

    // Transformar datos
    const transformedStudents = students.map((student) => {
      const nivel = student.seccion ? asignarNivelAcademico(student.seccion) : "No especificado";
      
      return {
        id: student.id.toString(),
        name: student.nombre || "",
        code: student.codigo.toString(),
        grado: student.grado || "No especificado",
        level: nivel,
        photo_url: student.photo_url,
        firstname: student.firstname,
        lastname: student.lastname,
        seccion: student.seccion,
      };
    });

    return NextResponse.json({
      students: transformedStudents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching students for management:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo estudiante
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN puede crear estudiantes)
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para crear estudiantes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      codigo,
      nombre,
      firstname,
      lastname,
      grado,
      seccion,
      school_year_id,
      photo_url,
    } = body;

    // Validar campos requeridos
    if (!codigo || !firstname || !lastname || !grado || !seccion || !school_year_id) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben ser proporcionados" },
        { status: 400 }
      );
    }

    // Verificar que el código no exista
    const existingStudent = await prisma.estudiantes.findUnique({
      where: { codigo: parseInt(codigo) },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Ya existe un estudiante con este código" },
        { status: 400 }
      );
    }

    // Verificar que el año académico existe
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id: parseInt(school_year_id) },
    });

    if (!schoolYear) {
      return NextResponse.json(
        { error: "Año académico no encontrado" },
        { status: 400 }
      );
    }

    // Generar un ID único para el estudiante (puede ser el mismo que el código)
    const studentId = parseInt(codigo);

    // Verificar que el ID no exista
    const existingStudentById = await prisma.estudiantes.findUnique({
      where: { id: studentId },
    });

    if (existingStudentById) {
      return NextResponse.json(
        { error: "Ya existe un estudiante con este ID" },
        { status: 400 }
      );
    }

    // Crear estudiante
    const newStudent = await prisma.estudiantes.create({
      data: {
        id: studentId,
        codigo: parseInt(codigo),
        nombre: nombre.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        grado: grado.trim(),
        seccion: seccion.trim(),
        school_year_id: parseInt(school_year_id),
        photo_url: photo_url?.trim() || null,
      },
    });

    // Determinar el nivel académico basado en la sección
    const nivel = asignarNivelAcademico(seccion);

    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.id.toString(),
        name: newStudent.nombre,
        code: newStudent.codigo.toString(),
        grado: newStudent.grado,
        level: nivel,
        photo_url: newStudent.photo_url,
        firstname: newStudent.firstname,
        lastname: newStudent.lastname,
        seccion: newStudent.seccion,
      },
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}