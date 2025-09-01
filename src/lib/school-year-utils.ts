// src/lib/school-year-utils.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Obtiene el año académico activo
 */
export async function getActiveSchoolYear() {
  try {
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    return activeSchoolYear;
  } catch (error) {
    console.error("Error fetching active school year:", error);
    return null;
  }
}

/**
 * Obtiene todos los años académicos disponibles
 */
export async function getAllSchoolYears() {
  try {
    const schoolYears = await prisma.schoolYear.findMany({
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    return schoolYears;
  } catch (error) {
    console.error("Error fetching school years:", error);
    return [];
  }
}

/**
 * Verifica si un año académico específico está activo
 */
export async function isSchoolYearActive(
  schoolYearId: number
): Promise<boolean> {
  try {
    const schoolYear = await prisma.schoolYear.findFirst({
      where: {
        id: schoolYearId,
        isActive: true,
      },
    });

    return !!schoolYear;
  } catch (error) {
    console.error("Error checking if school year is active:", error);
    return false;
  }
}

/**
 * Obtiene un año académico por su ID
 */
export async function getSchoolYearById(schoolYearId: number) {
  try {
    const schoolYear = await prisma.schoolYear.findUnique({
      where: {
        id: schoolYearId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    return schoolYear;
  } catch (error) {
    console.error("Error fetching school year by ID:", error);
    return null;
  }
}
