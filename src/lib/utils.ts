// FILE: src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Infraction, PrismaInfraction, PrismaFollowUp, PrismaStudent, Student, FollowUp } from "@/types/dashboard"
import { normalizarTipoFalta } from "@/lib/constantes"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

export function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString()
}

// Calculate expected follow-up dates (no change)
export function calculateExpectedFollowUpDates(infractionDate: string) {
    const date = new Date(infractionDate)
    const firstFollowUp = new Date(date)
    firstFollowUp.setMonth(date.getMonth() + 1)
    const secondFollowUp = new Date(date)
    secondFollowUp.setMonth(date.getMonth() + 3)
    const thirdFollowUp = new Date(date)
    thirdFollowUp.setMonth(date.getMonth() + 6)
    return [
        firstFollowUp.toISOString().split("T")[0],
        secondFollowUp.toISOString().split("T")[0],
        thirdFollowUp.toISOString().split("T")[0],
    ]
}

// Alert status type (no change)
export interface AlertStatus {
    level: "warning" | "critical"
    count: number
}

// --- Data Transformation Functions ---
export function transformStudent(student: PrismaStudent): Student {
  return {
    id: `${student.id}-${student.codigo}`,
    name: student.nombre || "",
    section: student.seccion || "", // No need for normalization if already done in the API
  };
}

export function transformInfraction(infraction: PrismaInfraction): Infraction {
  return {
    id: infraction.hash,
    studentId: `${infraction.id_estudiante}-${infraction.codigo_estudiante}`,
    type: normalizarTipoFalta(infraction.tipo_falta || ""),  // Normalize here
    number: infraction.numero_falta?.toString() || "",
    date: infraction.fecha?.toISOString().split("T")[0] || "", // Ensure ISO format
  };
}

export function transformFollowUp(followUp: PrismaFollowUp): FollowUp {
  return {
    id: `FUP${followUp.id_seguimiento}`, // Consistent ID format
    infractionId: followUp.id_caso.toString(), // Match with Casos.id_caso
    followUpNumber: followUp.id_seguimiento, // This is already an integer
    date: followUp.fecha_seguimiento?.toISOString().split("T")[0] || "", // Ensure ISO
  };
}

export function getStudentTypeICount(studentId: string, infractions: Infraction[]): number {
  return infractions.filter(inf => inf.studentId === studentId && inf.type === "I").length;
}