import type { Infraction, FollowUp } from "@/types/dashboard";
import { getTypeIIInfractionStatus } from "../utils/infraction-utils";

/**
 * Interfaz para las estadísticas del perfil del estudiante
 */
export interface StudentProfileStats {
  totalInfractions: number;
  attendedInfractions: number;
  pendingInfractions: number;
  typeICount: number;
  typeIICount: number;
  typeIIICount: number;
  pendingFollowUps: number;
  totalRequiredFollowUps: number;
  completedFollowUps: number;
  gradeFromInfractions: string | null;
}

/**
 * Calcula todas las estadísticas del perfil del estudiante
 */
export function calculateStudentProfileStats(
  infractions: Infraction[],
  followUps: FollowUp[]
): StudentProfileStats {
  // Estadísticas básicas de infracciones
  const totalInfractions = infractions.length;
  const attendedInfractions = infractions.filter((i) => i.attended).length;
  const pendingInfractions = totalInfractions - attendedInfractions;

  // Contar por tipo
  const typeICount = infractions.filter((i) => i.type === "Tipo I").length;
  const typeIICount = infractions.filter((i) => i.type === "Tipo II").length;
  const typeIIICount = infractions.filter((i) => i.type === "Tipo III").length;

  // Calcular estadísticas de seguimientos para faltas Tipo II
  const typeIIInfractions = infractions.filter((i) => i.type === "Tipo II");
  let totalRequiredFollowUps = 0;
  let completedFollowUps = 0;
  let pendingFollowUps = 0;

  typeIIInfractions.forEach((infraction) => {
    const status = getTypeIIInfractionStatus(followUps, infraction.id);
    totalRequiredFollowUps += 3; // Cada falta Tipo II requiere 3 seguimientos
    completedFollowUps += status.completedCount;
    pendingFollowUps += status.pendingCount;
  });

  // Obtener el grado más reciente de las infracciones (sección específica)
  const sectionsFromInfractions = infractions
    .map((i) => i.seccion)
    .filter((seccion) => seccion && seccion !== "No especificado");
  
  const gradeFromInfractions: string | null = sectionsFromInfractions.length > 0 
    ? sectionsFromInfractions[sectionsFromInfractions.length - 1]!
    : null;

  return {
    totalInfractions,
    attendedInfractions,
    pendingInfractions,
    typeICount,
    typeIICount,
    typeIIICount,
    pendingFollowUps,
    totalRequiredFollowUps,
    completedFollowUps,
    gradeFromInfractions,
  };
}

/**
 * Determina el estado general del estudiante basado en las estadísticas
 */
export function getStudentStatus(stats: StudentProfileStats): {
  status: "excellent" | "good" | "attention" | "critical";
  message: string;
  color: string;
} {
  if (stats.totalInfractions === 0) {
    return {
      status: "excellent",
      message: "Excelente comportamiento",
      color: "green",
    };
  }

  if (stats.pendingFollowUps === 0 && stats.pendingInfractions <= 2) {
    return {
      status: "good",
      message: "Buen comportamiento general",
      color: "blue",
    };
  }

  if (stats.pendingFollowUps > 0 || stats.typeIIICount > 0) {
    return {
      status: "attention",
      message: "Requiere seguimiento",
      color: "orange",
    };
  }

  return {
    status: "critical",
    message: "Requiere intervención inmediata",
    color: "red",
  };
}

/**
 * Calcula el porcentaje de faltas atendidas
 */
export function getAttendanceRate(stats: StudentProfileStats): number {
  if (stats.totalInfractions === 0) return 100;
  return Math.round((stats.attendedInfractions / stats.totalInfractions) * 100);
}

/**
 * Calcula el progreso de seguimientos para faltas Tipo II
 */
export function getFollowUpProgress(stats: StudentProfileStats): number {
  if (stats.totalRequiredFollowUps === 0) return 100;
  return Math.round((stats.completedFollowUps / stats.totalRequiredFollowUps) * 100);
}
