import { asignarNivelAcademico } from "@/lib/academic-level-utils";
import { prisma } from "@/lib/prisma";
import { getActiveSchoolYear, getSchoolYearById } from "@/lib/school-year-utils";
import { getCurrentUser } from "@/lib/session";
import { transformInfraction, transformStudent } from "@/lib/utils";
import { filterStudentsByUserPermissions } from "@/lib/role-filters";
// src/app/api/students/route.ts
import { NextResponse } from "next/server";

// NOTA: Función movida a @/lib/role-filters.ts para reutilización

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
    const onlyWithInfractions = searchParams.get("onlyWithInfractions") === "true";
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    
    // Validar parámetros de paginación
    const validatedPage = Math.max(1, page);
    // Para el dashboard, permitir límites más altos
    const maxLimit = limit > 500 ? 10000 : 100; // Si solicitan más de 500, permitir hasta 10000
    const validatedLimit = Math.min(Math.max(1, limit), maxLimit);

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
      let whereCondition: {
        OR?: Array<{
          nombre?: { contains: string; mode: 'insensitive' };
          codigo?: number;
          firstname?: { contains: string; mode: 'insensitive' };
          lastname?: { contains: string; mode: 'insensitive' };
        }>;
      } = {};
      
      // Aplicar filtro de búsqueda si se proporciona
      if (search.trim()) {
        const searchTerms: Array<{
          nombre?: { contains: string; mode: 'insensitive' };
          codigo?: number;
          firstname?: { contains: string; mode: 'insensitive' };
          lastname?: { contains: string; mode: 'insensitive' };
        }> = [
          { nombre: { contains: search.trim(), mode: 'insensitive' } },
          { firstname: { contains: search.trim(), mode: 'insensitive' } },
          { lastname: { contains: search.trim(), mode: 'insensitive' } }
        ];
        
        // Si la búsqueda es un número, también buscar por código
        const searchAsNumber = parseInt(search.trim(), 10);
        if (!isNaN(searchAsNumber)) {
          searchTerms.push({ codigo: searchAsNumber });
        }
        
        whereCondition = { OR: searchTerms };
      }
      
      const count = await prisma.estudiantes.count({ where: whereCondition });
      return NextResponse.json({ count });
    }

    if (studentId) {
      // Fetch single student with infractions and follow-ups
      const id = parseInt(studentId, 10);

      const student = await prisma.estudiantes.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          firstname: true,
          lastname: true,
          photo_url: true,
          grado: true,
          seccion: true,
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

      // Verificar si se debe sincronizar automáticamente con Phidias
      const autoSync = searchParams.get("autoSync") === "true";
      if (autoSync) {
        try {
          console.log(`🔄 Auto-sync iniciada para estudiante ${id} por usuario ${currentUser.id}`);
          // Importar el servicio de sincronización aquí para evitar problemas de dependencias circulares
          const { phidiasSyncService } = await import('@/services/phidias-sync.service');
          
          // Ejecutar sincronización en background sin bloquear la respuesta
          phidiasSyncService.syncSpecificStudent(id, `auto-${currentUser.id}`)
            .then((result) => {
              console.log(`✅ Auto-sync completada exitosamente para estudiante ${id}:`, {
                success: result.success,
                studentsProcessed: result.studentsProcessed,
                recordsCreated: result.recordsCreated,
                recordsUpdated: result.recordsUpdated,
                duration: result.duration
              });
            })
            .catch((error) => {
              console.error(`❌ Auto-sync falló para estudiante ${id}:`, error);
            });
        } catch (error) {
          console.error(`💥 Error iniciando auto-sync para estudiante ${id}:`, error);
          // No bloqueamos la respuesta aunque la sincronización falle
        }
      }

      // Transform the student data
      const grado = student.grado || "No especificado";
      const seccionParaNivel = student.seccion || "";
      const nivel = seccionParaNivel ? asignarNivelAcademico(seccionParaNivel) : "No especificado";
      const transformedStudent = transformStudent(student, grado, nivel);

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
      // Fetch students with pagination and search
      // ⚡ OPTIMIZACIÓN: Filtrar directores de grupo a nivel de BD
      let teacherGroupFilter = {};
      if (currentUser.role === "TEACHER") {
        const teacherUser = await prisma.user.findUnique({
          where: { id: currentUser.id },
          select: { groupCode: true },
        });

        if (!teacherUser?.groupCode) {
          console.log("🔍 TEACHER: No groupCode asignado, retornando lista vacía");
          return NextResponse.json({
            data: [],
            pagination: {
              currentPage: validatedPage,
              totalPages: 0,
              totalCount: 0,
              limit: validatedLimit,
              hasNextPage: false,
              hasPrevPage: validatedPage > 1,
            }
          });
        }

        // Agregar filtro por grado específico en la consulta WHERE
        teacherGroupFilter = { grado: teacherUser.groupCode };
        console.log("🔍 TEACHER: Filtrando en BD por grado:", teacherUser.groupCode);
      }

      // Construir la condición WHERE para la búsqueda
      let whereCondition: {
        OR?: Array<{
          nombre?: { contains: string; mode: 'insensitive' };
          codigo?: number;
          firstname?: { contains: string; mode: 'insensitive' };
          lastname?: { contains: string; mode: 'insensitive' };
        }>;
        id?: { in: number[] };
        grado?: string; // Para filtro de directores de grupo
        faltas?: {
          some: {
            school_year_id: number;
          }
        };
      } = {
        ...teacherGroupFilter // Aplicar filtro de director de grupo si existe
      };
      
      if (search.trim()) {
        const searchTerms: Array<{
          nombre?: { contains: string; mode: 'insensitive' };
          codigo?: number;
          firstname?: { contains: string; mode: 'insensitive' };
          lastname?: { contains: string; mode: 'insensitive' };
        }> = [
          { nombre: { contains: search.trim(), mode: 'insensitive' } },
          { firstname: { contains: search.trim(), mode: 'insensitive' } },
          { lastname: { contains: search.trim(), mode: 'insensitive' } }
        ];
        
        // Si la búsqueda es un número, también buscar por código
        const searchAsNumber = parseInt(search.trim(), 10);
        if (!isNaN(searchAsNumber)) {
          searchTerms.push({ codigo: searchAsNumber });
        }
        
        whereCondition = { 
          ...teacherGroupFilter, // Mantener filtro de grupo
          OR: searchTerms 
        };
      }
      
      // Calcular offset para paginación
      const offset = (validatedPage - 1) * validatedLimit;
      
      // Fetch students with pagination
      let baseWhereCondition = whereCondition;
      
      // Si se solicita solo estudiantes con faltas, modificar la consulta
      if (onlyWithInfractions) {
        const studentsWithInfractions = await prisma.estudiantes.findMany({
          where: {
            ...whereCondition,
            faltas: {
              some: {
                school_year_id: targetSchoolYear.id,
              }
            }
          },
          select: { id: true },
          orderBy: { nombre: "asc" },
          take: validatedLimit,
          skip: offset,
        });
        
        const studentIds = studentsWithInfractions.map(s => s.id);
        
        // Si no hay estudiantes con faltas, retornar vacío
        if (studentIds.length === 0) {
          return NextResponse.json({
            data: [],
            pagination: {
              currentPage: validatedPage,
              totalPages: 0,
              totalCount: 0,
              limit: validatedLimit,
              hasNextPage: false,
              hasPrevPage: validatedPage > 1,
            }
          }, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
        }
        
        baseWhereCondition = {
          ...whereCondition,
          id: { in: studentIds }
        };
      }
      
      const students = await prisma.estudiantes.findMany({
        where: baseWhereCondition,
        select: {
          id: true,
          codigo: true,
          nombre: true,
          firstname: true,
          lastname: true,
          photo_url: true,
          grado: true,
          seccion: true,
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
        take: validatedLimit,
        skip: offset,
      });

      // Transform students with their infractions and stats
      const transformedStudents = await Promise.all(
        students.map(async (student) => {
          const latestInfraction = student.faltas[0];
          
          // Debug: Log para verificar los datos del estudiante desde la BD
          if (students.indexOf(student) === 0) {
            console.log("API Students - Sample student from DB:", {
              id: student.id,
              nombre: student.nombre,
              grado: student.grado,
              seccion: student.seccion,
              faltasCount: student.faltas.length,
              latestInfractionSeccion: latestInfraction?.seccion
            });
          }
          
          // Usar los datos directos del estudiante en lugar de las infracciones
          const grado = student.grado || "No especificado";
          // Determinar el nivel académico basado en la sección del estudiante o de la última infracción
          const seccionParaNivel = student.seccion || latestInfraction?.seccion || "";
          const nivel = seccionParaNivel ? asignarNivelAcademico(seccionParaNivel) : "No especificado";
          
          let stats = undefined;
          if (includeStats) {
            stats = await getStudentInfractionStats(student.id, targetSchoolYear.id);
          }

          const transformedStudent = {
            ...transformStudent(student, grado, nivel),
            stats: stats,
          };
          
          // Debug: Log para verificar el estudiante transformado
          if (students.indexOf(student) === 0) {
            console.log("API Students - Transformed student:", {
              id: transformedStudent.id,
              name: transformedStudent.name,
              grado: transformedStudent.grado,
              seccion: transformedStudent.seccion
            });
          }

          return transformedStudent;
        })
      );

      // ⚡ OPTIMIZACIÓN: Solo aplicar filtrado frontend para coordinadores 
      // Los directores (TEACHER) ya están filtrados en la consulta BD
      let filteredStudents;
      if (currentUser.role === "TEACHER") {
        // Ya filtrado en BD, no necesita filtrado adicional
        filteredStudents = transformedStudents;
        console.log("🔍 TEACHER: Usando estudiantes ya filtrados en BD:", transformedStudents.length);
      } else {
        // Coordinadores y otros roles que necesitan filtrado por sección
        filteredStudents = await filterStudentsByUserPermissions(
          transformedStudents,
          currentUser
        );
      }

      // Obtener el total de elementos para metadatos de paginación
      let totalCountCondition = whereCondition;
      if (onlyWithInfractions) {
        totalCountCondition = {
          ...whereCondition,
          faltas: {
            some: {
              school_year_id: targetSchoolYear.id,
            }
          }
        };
      }
      
      const totalCount = await prisma.estudiantes.count({ where: totalCountCondition });
      const totalPages = Math.ceil(totalCount / validatedLimit);
      const hasNextPage = validatedPage < totalPages;
      const hasPrevPage = validatedPage > 1;

      return NextResponse.json({
        data: filteredStudents,
        pagination: {
          currentPage: validatedPage,
          totalPages,
          totalCount,
          limit: validatedLimit,
          hasNextPage,
          hasPrevPage,
        }
      }, {
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
