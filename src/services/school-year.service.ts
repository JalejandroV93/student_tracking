import { prisma } from "@/lib/prisma";
import {
  SchoolYear,
  Trimestre,
  CreateSchoolYearRequest,
} from "@/types/school-year";

export class SchoolYearService {
  /**
   * Obtiene todos los años escolares
   */
  static async getAllSchoolYears(): Promise<SchoolYear[]> {
    return await prisma.schoolYear.findMany({
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { startDate: "desc" },
    });
  }

  /**
   * Obtiene el año escolar activo
   */
  static async getActiveSchoolYear(): Promise<SchoolYear | null> {
    return await prisma.schoolYear.findFirst({
      where: { isActive: true },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  /**
   * Crea un nuevo año escolar con trimestres
   */
  static async createSchoolYear(
    data: CreateSchoolYearRequest
  ): Promise<SchoolYear> {
    // Validar que no exista un año escolar con el mismo nombre
    const existing = await prisma.schoolYear.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error("Ya existe un año escolar con ese nombre");
    }

    // Validar trimestres
    if (data.trimestres.length !== 3) {
      throw new Error("Se requieren exactamente 3 trimestres");
    }

    // Verificar que los órdenes de los trimestres sean 1, 2, 3
    const orders = data.trimestres.map((t) => t.order).sort();
    if (orders.join(",") !== "1,2,3") {
      throw new Error("Los trimestres deben tener órdenes 1, 2 y 3");
    }

    return await prisma.schoolYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description,
        isActive: false,
        trimestres: {
          create: data.trimestres.map((trimestre) => ({
            name: trimestre.name,
            order: trimestre.order,
            startDate: new Date(trimestre.startDate),
            endDate: new Date(trimestre.endDate),
          })),
        },
      },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  /**
   * Activa un año escolar específico
   */
  static async activateSchoolYear(id: number): Promise<SchoolYear> {
    return await prisma.$transaction(async (tx) => {
      // Verificar que el año escolar existe
      const schoolYear = await tx.schoolYear.findUnique({
        where: { id },
      });

      if (!schoolYear) {
        throw new Error("Año escolar no encontrado");
      }

      // Desactivar todos los años escolares
      await tx.schoolYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Activar el año escolar seleccionado
      return await tx.schoolYear.update({
        where: { id },
        data: { isActive: true },
        include: {
          trimestres: {
            orderBy: { order: "asc" },
          },
        },
      });
    });
  }

  /**
   * Obtiene un año escolar por ID
   */
  static async getSchoolYearById(id: number): Promise<SchoolYear | null> {
    return await prisma.schoolYear.findUnique({
      where: { id },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  /**
   * Elimina un año escolar y sus trimestres
   */
  static async deleteSchoolYear(id: number): Promise<void> {
    const schoolYear = await prisma.schoolYear.findUnique({
      where: { id },
    });

    if (!schoolYear) {
      throw new Error("Año escolar no encontrado");
    }

    if (schoolYear.isActive) {
      throw new Error("No se puede eliminar el año escolar activo");
    }

    // Las relaciones se eliminan automáticamente por el onDelete: Cascade
    await prisma.schoolYear.delete({
      where: { id },
    });
  }

  /**
   * Obtiene los trimestres de un año escolar
   */
  static async getTrimestresBySchoolYear(
    schoolYearId: number
  ): Promise<Trimestre[]> {
    return await prisma.trimestre.findMany({
      where: { schoolYearId },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Busca el año escolar que contiene una fecha específica
   */
  static async getSchoolYearByDate(date: Date): Promise<SchoolYear | null> {
    return await prisma.schoolYear.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  /**
   * Busca el trimestre que contiene una fecha específica
   */
  static async getTrimestreByDate(date: Date): Promise<Trimestre | null> {
    return await prisma.trimestre.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
      include: {
        schoolYear: true,
      },
    });
  }

  /**
   * Valida que las fechas de un año escolar no se superpongan con otros años
   */
  static async validateSchoolYearDates(
    startDate: Date,
    endDate: Date,
    excludeId?: number
  ): Promise<boolean> {
    const overlapping = await prisma.schoolYear.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          {
            // El nuevo año empieza antes de que termine un año existente
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            // El nuevo año termina después de que empiece un año existente
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            // El nuevo año está completamente contenido en un año existente
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    return !overlapping; // true si no hay superposición
  }
}
