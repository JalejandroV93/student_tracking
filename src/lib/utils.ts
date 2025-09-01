// FILE: src/lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Infraction } from "@/types/dashboard";
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
  infractions: Infraction[] // Expect the transformed Infraction type
): number {
  const filtered = infractions.filter(
    (inf) =>
      inf.studentId === studentId && inf.type === "Tipo I" && !inf.attended
  );
  //console.log(` -> Found ${filtered.length} unattended Type I infractions:`, filtered);
  return filtered.length;
}

export function getStudentTypeIICount(
  studentId: string,
  infractions: Infraction[]
): number {
  // Use the standardized type format
  return infractions.filter(
    (inf) => inf.studentId === studentId && inf.type === "Tipo II"
  ).length;
}

// Data transformation function
export function transformStudent(
  student: {
    id: number;
    codigo: number;
    nombre: string | null;
  },
  grado?: string,
  nivel?: string
): Student {
  if (!student) {
    throw new Error("Student data is required");
  }

  return {
    id: `${student.id}-${student.codigo}`,
    name: student.nombre || "Sin nombre",
    grado: grado || "No especificado",
    level: nivel || "No especificado",
  };
}

export function transformInfraction(
  infraction: Prisma.FaltasGetPayload<object>,
  customStudentId?: string
): Infraction {
  return {
    id: infraction.hash,
    studentId: customStudentId || String(infraction.id_estudiante),
    type: infraction.tipo_falta as "Tipo I" | "Tipo II" | "Tipo III",
    number: infraction.numero_falta?.toString() ?? "",
    date: infraction.fecha?.toISOString().split("T")[0] ?? "",
    description: infraction.descripcion_falta ?? "",
    details: infraction.detalle_falta ?? "",
    remedialActions: infraction.acciones_reparadoras ?? "",
    author: infraction.autor ?? "",
    trimester: infraction.trimestre ?? "",
    trimestreId: infraction.trimestre_id,
    schoolYearId: infraction.school_year_id,
    level: infraction.nivel ?? "",
    attended: infraction.attended ?? false,
    observaciones: infraction.observaciones ?? undefined,
    observacionesAutor: infraction.observaciones_autor ?? undefined,
    observacionesFecha:
      infraction.observaciones_fecha?.toISOString().split("T")[0] ?? undefined,
  };
}

export function transformFollowUp(
  followUp: Prisma.SeguimientosGetPayload<object>
): FollowUp {
  return {
    id: `FUP${followUp.id_seguimiento}`,
    infractionId: `${followUp.id_caso}`,
    followUpNumber: followUp.id_seguimiento,
    date: followUp.fecha_seguimiento?.toISOString().split("T")[0] ?? "",
    type: followUp.tipo_seguimiento ?? "",
    details: followUp.detalles ?? "",
    author: followUp.autor ?? "",
  };
}
