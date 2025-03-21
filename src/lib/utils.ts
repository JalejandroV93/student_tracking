// FILE: src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Infraction } from "@/types/dashboard";
import { normalizarTipoFalta } from "@/lib/constantes"; // Import getSectionCategory
import { Prisma } from "@prisma/client";
import { Student, FollowUp } from "@/types/dashboard";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// Calculate expected follow-up dates (no change)
export function calculateExpectedFollowUpDates(infractionDate: string) {
  const date = new Date(infractionDate);
  const firstFollowUp = new Date(date);
  firstFollowUp.setMonth(date.getMonth() + 1);
  const secondFollowUp = new Date(date);
  secondFollowUp.setMonth(date.getMonth() + 3);
  const thirdFollowUp = new Date(date);
  thirdFollowUp.setMonth(date.getMonth() + 6);
  return [
    firstFollowUp.toISOString().split("T")[0],
    secondFollowUp.toISOString().split("T")[0],
    thirdFollowUp.toISOString().split("T")[0],
  ];
}

// Alert status type (no change)
export interface AlertStatus {
  level: "warning" | "critical";
  count: number;
}

// Get Type I infraction count for a student
export function getStudentTypeICount(
  studentId: string,
  infractions: Infraction[]
): number {
  return infractions.filter(
    (inf) => inf.studentId === studentId && inf.type === "I"
  ).length;
}

// Data transformation function
export function transformStudent(student: Prisma.EstudiantesGetPayload<object>): Student {
  return {
    id: `${student.id}-${student.codigo}`,
    name: student.nombre ?? "",
    section: student.seccion ?? "",
    level: student.nivel ?? "",
  }
}

export function transformInfraction(infraction: Prisma.FaltasGetPayload<object>): Infraction {
  const normalizedType = normalizarTipoFalta(infraction.tipo_falta ?? "");
  if (!["I", "II", "III"].includes(normalizedType)) {
      throw new Error(`Invalid infraction type: ${normalizedType}`);
  }
  
  return {
      id: infraction.hash,
      studentId: `${infraction.id_estudiante}-${infraction.codigo_estudiante}`,
      type: normalizedType as "I" | "II" | "III",
      number: infraction.numero_falta?.toString() ?? "",
      date: infraction.fecha?.toISOString().split("T")[0] ?? "",
      description: infraction.descripcion_falta ?? "",
      details: infraction.detalle_falta ?? "",
      remedialActions: infraction.acciones_reparadoras ?? "",
      author: infraction.autor ?? "",
      trimester: infraction.trimestre ?? "",
      level: infraction.nivel ?? "",
  };
}



export function transformFollowUp(followUp: Prisma.SeguimientosGetPayload<object>): FollowUp {
  return {
    id: `FUP${followUp.id_seguimiento}`,
    infractionId: `${followUp.id_caso}`,
    followUpNumber: followUp.id_seguimiento,
    date: followUp.fecha_seguimiento?.toISOString().split("T")[0] ?? "",
    type: followUp.tipo_seguimiento ?? "",
    details: followUp.detalles ?? "",
    author: followUp.autor ?? "",
  }
}

export function getStudentTypeIICount(
  studentId: string,
  infractions: Infraction[]
): number {
  return infractions.filter(
    (inf) => inf.studentId === studentId && inf.type === "II"
  ).length;
}
