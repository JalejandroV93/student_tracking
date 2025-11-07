import { getSectionCategory } from "@/lib/constantes";
import { prisma } from "@/lib/prisma";
import { Role } from "@/prismacl/client";

interface FilterableStudent {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  photoUrl?: string;
  grado: string;
  seccion?: string;
  stats?: {
    total: number;
    tipoI: number;
    tipoII: number;
    tipoIII: number;
    pending: number;
    attended: number;
  } | undefined;
}

interface User {
  id: string;
  role: Role;
  [key: string]: unknown;
}

/**
 * Función centralizada para filtrar estudiantes basado en permisos del usuario
 */
export async function filterStudentsByUserPermissions(
  students: FilterableStudent[],
  user: User
): Promise<FilterableStudent[]> {
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
      console.log("🔍 TEACHER filtrado: No groupCode asignado para usuario", user.id);
      return []; // Si no tiene grupo asignado, no ve nada
    }

    console.log("🔍 TEACHER filtrado:", {
      userId: user.id,
      groupCode: fullUser.groupCode,
      groupCodeType: typeof fullUser.groupCode,
      groupCodeLength: fullUser.groupCode?.length,
      totalStudents: students.length,
      sampleStudentGrados: students.slice(0, 5).map(s => ({ 
        id: s.id, 
        name: s.name, 
        grado: s.grado, 
        gradoType: typeof s.grado,
        gradoLength: s.grado?.length,
        seccion: s.seccion 
      }))
    });

    const filteredStudents = students.filter((student) => {
      // Normalizaciones
      const studentGrado = (student.grado || "").trim().toLowerCase();
      const studentSeccion = (student.seccion || "").trim().toLowerCase();

      if (!fullUser.groupCode) {
        return false;
      }

      const groupCode = fullUser.groupCode.trim().toLowerCase();
      
      // Estrategia 1: Comparación exacta
      const exactMatch = studentGrado === groupCode || studentSeccion === groupCode;
      
      // Estrategia 2: Comparación normalizada - remover espacios y caracteres especiales
      const normalizeGrade = (grade: string) => {
        return grade.toLowerCase()
          .replace(/\s+/g, '') // remover espacios
          .replace(/[áàâã]/g, 'a')
          .replace(/[éèêë]/g, 'e')
          .replace(/[íìîï]/g, 'i')
          .replace(/[óòôõ]/g, 'o')
          .replace(/[úùûü]/g, 'u');
      };
      
      const normalizedStudentGrado = normalizeGrade(studentGrado);
      const normalizedGroupCode = normalizeGrade(groupCode);
      const normalizedMatch = normalizedStudentGrado === normalizedGroupCode;
      
      // Estrategia 3: Verificar si groupCode está contenido en el grado del estudiante
      const containsMatch = studentGrado.includes(groupCode) || groupCode.includes(studentGrado);
      
      // Estrategia 4: Comparación por partes mejorada - más estricta
      const studentGradoParts = studentGrado.split(/\s+/).filter(part => part.length > 1); // ignorar partes de 1 letra
      const groupCodeParts = groupCode.split(/\s+/).filter(part => part.length > 1); // ignorar partes de 1 letra
      
      // Solo considerar coincidencia si al menos 2 partes coinciden O si hay una coincidencia de 3+ caracteres
      const significantMatches = studentGradoParts.filter(part => 
        groupCodeParts.some(codePart => {
          if (part.length >= 3 && codePart.length >= 3) {
            return part === codePart || part.includes(codePart) || codePart.includes(part);
          }
          return part === codePart; // Coincidencia exacta para partes cortas
        })
      );
      
      const partsMatch = significantMatches.length >= 2 || 
        (significantMatches.length >= 1 && significantMatches.some(match => match.length >= 4));
      
      const matches = exactMatch || normalizedMatch || containsMatch || partsMatch;
      
      console.log("🔍 Comparación detallada:", {
        studentId: student.id,
        studentName: student.name,
        studentGrado: student.grado,
        groupCode: fullUser.groupCode,
        exactMatch,
        normalizedMatch,
        containsMatch,
        partsMatch,
        finalMatch: matches,
        normalizedStudentGrado,
        normalizedGroupCode,
        studentGradoParts,
        groupCodeParts,
        significantMatches
      });
      
      if (matches) {
        console.log("✅ Estudiante coincide:", {
          studentId: student.id,
          studentName: student.name,
          studentGrado: student.grado,
          studentSeccion: student.seccion,
          groupCode: fullUser.groupCode
        });
      }
      
      return matches;
    });

    console.log("🔍 TEACHER resultado filtrado:", {
      userId: user.id,
      filteredCount: filteredStudents.length,
      groupCode: fullUser.groupCode,
      totalStudents: students.length
    });

    return filteredStudents;
  }

  // Por defecto, no ven nada
  return [];
}

/**
 * Función para obtener el groupCode de un usuario TEACHER
 */
export async function getTeacherGroupCode(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { groupCode: true, role: true },
    });

    if (user?.role === "TEACHER") {
      return user.groupCode || null;
    }

    return null;
  } catch (error) {
    console.error("Error getting teacher group code:", error);
    return null;
  }
}