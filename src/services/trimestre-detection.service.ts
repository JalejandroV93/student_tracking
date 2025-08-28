import { prisma } from "@/lib/prisma";
import {
  TrimestreDetectionResult,
  DateParseResult,
  Trimestre,
} from "@/types/school-year";

export class TrimestreDetectionService {
  /**
   * Función para rellenar con ceros
   */
  private static pad(n: number): string {
    return n < 10 ? "0" + n : n.toString();
  }

  /**
   * Función para validar si la fecha construida tiene sentido
   */
  private static isValidDate(date: Date): boolean {
    return !isNaN(date.getTime());
  }

  /**
   * Función para crear una fecha de manera más clara
   */
  private static createDate(day: number, month: number, year: number): Date {
    return new Date(year, month - 1, day);
  }

  /**
   * Función para verificar si una fecha está dentro de algún rango de trimestres
   */
  private static inRange(date: Date, trimestres: Trimestre[]): boolean {
    return trimestres.some((trimestre) => {
      return date >= trimestre.startDate && date <= trimestre.endDate;
    });
  }

  /**
   * Función para obtener el trimestre correspondiente a una fecha
   */
  private static getTrimestre(
    fecha: Date,
    trimestres: Trimestre[]
  ): Trimestre | null {
    return (
      trimestres.find((trimestre) => {
        return fecha >= trimestre.startDate && fecha <= trimestre.endDate;
      }) || null
    );
  }

  /**
   * Función para probar interpretaciones de la fecha (dd/mm/yyyy vs mm/dd/yyyy)
   */
  private static probarInterpretaciones(
    day: number,
    month: number,
    year: number,
    trimestres: Trimestre[]
  ): DateParseResult | null {
    // Intento 1: interpretar como dd/mm/yyyy
    const fecha1 = this.createDate(day, month, year);
    // Intento 2: interpretar como mm/dd/yyyy
    const fecha2 = this.createDate(month, day, year);

    if (this.isValidDate(fecha1) && this.inRange(fecha1, trimestres)) {
      return { date: fecha1, format: "dd/mm/yyyy" };
    } else if (this.isValidDate(fecha2) && this.inRange(fecha2, trimestres)) {
      return { date: fecha2, format: "mm/dd/yyyy" };
    }

    return null;
  }

  /**
   * Función para intentar ajustar el año
   */
  private static async ajustarAnio(
    day: number,
    month: number,
    originalYear: number
  ): Promise<DateParseResult | null> {
    // Obtener todos los años escolares disponibles
    const schoolYears = await prisma.schoolYear.findMany({
      include: { trimestres: true },
    });

    const añosPosibles = schoolYears.map((sy) => sy.startDate.getFullYear());
    añosPosibles.push(...schoolYears.map((sy) => sy.endDate.getFullYear()));
    const añosUnicos = [...new Set(añosPosibles)];

    for (const year of añosUnicos) {
      if (year !== originalYear) {
        // Obtener trimestres para este año
        const schoolYear = schoolYears.find(
          (sy) =>
            sy.startDate.getFullYear() <= year &&
            sy.endDate.getFullYear() >= year
        );

        if (schoolYear?.trimestres) {
          const resultado = this.probarInterpretaciones(
            day,
            month,
            year as number,
            schoolYear.trimestres
          );
          if (resultado) {
            return resultado;
          }
        }
      }
    }

    return null;
  }

  /**
   * Detecta el trimestre para una fecha dada con múltiples estrategias de parsing
   */
  static async detectarTrimestre(
    fechaRaw: string | number | Date | null | undefined
  ): Promise<TrimestreDetectionResult> {
    try {
      // Obtener el año escolar activo y sus trimestres
      const activeSchoolYear = await prisma.schoolYear.findFirst({
        where: { isActive: true },
        include: { trimestres: { orderBy: { order: "asc" } } },
      });

      if (!activeSchoolYear || !activeSchoolYear.trimestres.length) {
        return {
          trimestreName: "Sin configurar",
          isValid: false,
          error: "No hay año escolar activo configurado",
        };
      }

      let fecha: Date | null = null;
      let formatoFecha: string | null = null;
      let trimestre: Trimestre | null = null;

      if (fechaRaw !== undefined && fechaRaw !== null) {
        // Caso 1: Si es un número o una cadena que puede ser un número (serial de Excel)
        const serialNumber =
          typeof fechaRaw === "number"
            ? fechaRaw
            : parseFloat(fechaRaw as string);

        if (!isNaN(serialNumber)) {
          // Convertir el serial de Excel a fecha
          const excelDate = new Date((serialNumber - 25569) * 86400 * 1000);
          // Ajuste: sumamos un día para corregir el desfase
          excelDate.setDate(excelDate.getDate() + 1);

          if (this.isValidDate(excelDate)) {
            const day = excelDate.getDate();
            const month = excelDate.getMonth() + 1;
            const year = excelDate.getFullYear();

            // Probar interpretaciones
            const resultado = this.probarInterpretaciones(
              day,
              month,
              year,
              activeSchoolYear.trimestres
            );
            if (resultado) {
              fecha = resultado.date;
              formatoFecha = `${this.pad(day)}/${this.pad(month)}/${year}`;
              trimestre = this.getTrimestre(fecha, activeSchoolYear.trimestres);
            } else {
              // Intentar ajustar el año
              const ajuste = await this.ajustarAnio(day, month, year);
              if (ajuste) {
                fecha = ajuste.date;
                const adjustedYear = fecha.getFullYear();
                formatoFecha = `${this.pad(day)}/${this.pad(
                  month
                )}/${adjustedYear}`;

                // Buscar el trimestre en el año ajustado
                const schoolYear = await prisma.schoolYear.findFirst({
                  where: {
                    startDate: { lte: fecha },
                    endDate: { gte: fecha },
                  },
                  include: { trimestres: true },
                });

                if (schoolYear) {
                  trimestre = this.getTrimestre(fecha, schoolYear.trimestres);
                }
              } else {
                formatoFecha = `${this.pad(day)}/${this.pad(month)}/${year}`;
                return {
                  trimestreName: "Fuera de rango definido",
                  isValid: false,
                  error: `Fecha ${formatoFecha} no está dentro de ningún trimestre configurado`,
                };
              }
            }
          }
        } else if (typeof fechaRaw === "string") {
          // Caso 2: Si es una cadena en formato "dd/mm/yyyy" o "mm/dd/yyyy"
          // Primero, remover cualquier componente de tiempo
          const fechaSinHora = fechaRaw.trim().split(" ")[0];
          const partes = fechaSinHora.split("/");
          if (partes.length === 3) {
            const day = parseInt(partes[0], 10);
            const month = parseInt(partes[1], 10);
            const year = parseInt(partes[2], 10);

            // Probar interpretaciones
            const resultado = this.probarInterpretaciones(
              day,
              month,
              year,
              activeSchoolYear.trimestres
            );
            if (resultado) {
              fecha = resultado.date;
              if (resultado.format === "dd/mm/yyyy") {
                formatoFecha = `${this.pad(day)}/${this.pad(month)}/${year}`;
              } else {
                formatoFecha = `${this.pad(month)}/${this.pad(day)}/${year}`;
              }
              trimestre = this.getTrimestre(fecha, activeSchoolYear.trimestres);
            } else {
              // Intentar ajustar el año
              const ajuste = await this.ajustarAnio(day, month, year);
              if (ajuste) {
                fecha = ajuste.date;
                const adjustedYear = fecha.getFullYear();

                if (ajuste.format === "dd/mm/yyyy") {
                  formatoFecha = `${this.pad(day)}/${this.pad(
                    month
                  )}/${adjustedYear}`;
                } else {
                  formatoFecha = `${this.pad(month)}/${this.pad(
                    day
                  )}/${adjustedYear}`;
                }

                // Buscar el trimestre en el año ajustado
                const schoolYear = await prisma.schoolYear.findFirst({
                  where: {
                    startDate: { lte: fecha },
                    endDate: { gte: fecha },
                  },
                  include: { trimestres: true },
                });

                if (schoolYear) {
                  trimestre = this.getTrimestre(fecha, schoolYear.trimestres);
                }
              } else {
                formatoFecha = `${this.pad(day)}/${this.pad(month)}/${year}`;
                return {
                  trimestreName: "Fuera de rango definido",
                  isValid: false,
                  error: `Fecha ${formatoFecha} no está dentro de ningún trimestre configurado`,
                };
              }
            }
          } else {
            return {
              trimestreName: "Formato incorrecto",
              isValid: false,
              error: "Formato de fecha incorrecto. Esperado: dd/mm/yyyy",
            };
          }
        }
      } else {
        return {
          trimestreName: "Fecha no definida",
          isValid: false,
          error: "Fecha no proporcionada",
        };
      }

      if (trimestre && fecha) {
        // Buscar el año escolar correspondiente
        const schoolYear = await prisma.schoolYear.findUnique({
          where: { id: trimestre.schoolYearId },
          include: { trimestres: true },
        });

        return {
          trimestre,
          trimestreName: trimestre.name,
          schoolYear: schoolYear || undefined,
          isValid: true,
        };
      } else {
        return {
          trimestreName: "Sin determinar",
          isValid: false,
          error:
            "No se pudo determinar el trimestre para la fecha proporcionada",
        };
      }
    } catch (error) {
      console.error("Error detectando trimestre:", error);
      return {
        trimestreName: "Error",
        isValid: false,
        error: `Error interno: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }

  /**
   * Detecta el trimestre para una fecha Date estándar
   */
  static async detectarTrimestreParaFecha(
    fecha: Date
  ): Promise<TrimestreDetectionResult> {
    try {
      // Buscar el año escolar que contiene esta fecha
      const schoolYear = await prisma.schoolYear.findFirst({
        where: {
          startDate: { lte: fecha },
          endDate: { gte: fecha },
        },
        include: { trimestres: { orderBy: { order: "asc" } } },
      });

      if (!schoolYear) {
        return {
          trimestreName: "Fuera de rango",
          isValid: false,
          error: "La fecha no está dentro de ningún año escolar configurado",
        };
      }

      const trimestre = this.getTrimestre(fecha, schoolYear.trimestres);

      if (trimestre) {
        return {
          trimestre,
          trimestreName: trimestre.name,
          schoolYear,
          isValid: true,
        };
      } else {
        return {
          trimestreName: "Sin trimestre",
          isValid: false,
          error: "La fecha no está dentro de ningún trimestre del año escolar",
        };
      }
    } catch (error) {
      console.error("Error detectando trimestre para fecha:", error);
      return {
        trimestreName: "Error",
        isValid: false,
        error: `Error interno: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}
