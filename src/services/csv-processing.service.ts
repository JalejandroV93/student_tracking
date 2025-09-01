import { prisma } from "@/lib/prisma";
import {
  parseCSVFile,
  convertCSVRowToFalta,
  extractStudentData,
  validateCSVRow,
} from "@/lib/csv-utils";
import {
  CSVFaltaRow,
  ProcessingResult,
  DuplicateInfo,
  DuplicateHandlingOptions,
  ProcessedFalta,
  StudentData,
} from "@/types/csv-import";
import { Trimestre } from "@/types/school-year";

export class CSVProcessingService {
  /**
   * Procesa un archivo CSV completo
   */
  static async processCSVFile(
    csvContent: string,
    tipoFalta: string,
    trimestreId: number,
    duplicateHandling?: DuplicateHandlingOptions
  ): Promise<ProcessingResult> {
    try {
      // Obtener información del trimestre
      const trimestre = await prisma.trimestre.findUnique({
        where: { id: trimestreId },
        include: { schoolYear: true },
      });

      if (!trimestre) {
        return {
          success: false,
          message: "Trimestre no encontrado",
          totalRows: 0,
          processedRows: 0,
          duplicates: [],
          errors: [],
        };
      }

      // Parsear CSV
      const { data: csvRows, errors: parseErrors } = await parseCSVFile(
        csvContent
      );

      if (parseErrors.length > 0) {
        return {
          success: false,
          message: "Error al parsear el archivo CSV: " + parseErrors[0].message,
          totalRows: 0,
          processedRows: 0,
          duplicates: [],
          errors: parseErrors.map((error, index) => ({
            row: error.row || index + 1,
            error: error.message,
            data: {},
          })),
        };
      }

      // Procesar las filas
      return await this.processCSVRows(
        csvRows,
        tipoFalta,
        trimestre,
        duplicateHandling
      );
    } catch (error) {
      console.error("Error processing CSV file:", error);
      return {
        success: false,
        message: "Error interno al procesar el archivo",
        totalRows: 0,
        processedRows: 0,
        duplicates: [],
        errors: [
          {
            row: 0,
            error: error instanceof Error ? error.message : "Error desconocido",
            data: {},
          },
        ],
      };
    }
  }

  /**
   * Procesa las filas del CSV
   */
  private static async processCSVRows(
    csvRows: CSVFaltaRow[],
    tipoFalta: string,
    trimestre: Trimestre & { schoolYear: { id: number; name: string } },
    duplicateHandling?: DuplicateHandlingOptions
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: true,
      message: "",
      totalRows: csvRows.length,
      processedRows: 0,
      duplicates: [],
      errors: [],
    };

    // Mapa para trackear estudiantes procesados
    const studentMap = new Map<number, number>(); // codigo -> id

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];

      try {
        // Validar la fila
        const validation = validateCSVRow(row);
        if (!validation.valid) {
          result.errors.push({
            row: i + 1,
            error: validation.errors.join(", "),
            data: row,
          });
          continue;
        }

        // Extraer datos del estudiante
        const studentData = extractStudentData(row);
        if (!studentData) {
          result.errors.push({
            row: i + 1,
            error: "No se pudieron extraer los datos del estudiante",
            data: row,
          });
          continue;
        }

        // Verificar/crear estudiante
        let studentId: number;
        if (studentMap.has(studentData.codigo)) {
          studentId = studentMap.get(studentData.codigo)!;
        } else {
          studentId = await this.ensureStudentExists(studentData);
          studentMap.set(studentData.codigo, studentId);
        }

        // Convertir fila a falta
        const faltaData = await convertCSVRowToFalta(
          row,
          studentId,
          tipoFalta,
          trimestre
        );
        if (!faltaData) {
          result.errors.push({
            row: i + 1,
            error: "No se pudo procesar la falta",
            data: row,
          });
          continue;
        }

        // Verificar si ya existe (por hash)
        const existingFalta = await prisma.faltas.findUnique({
          where: { hash: faltaData.hash },
        });

        if (existingFalta) {
          // Es un duplicado
          const duplicateInfo = this.createDuplicateInfo(
            faltaData,
            existingFalta
          );
          result.duplicates.push(duplicateInfo);

          // Manejar duplicado según la opción
          if (
            duplicateHandling?.action === "update" &&
            duplicateHandling.duplicateHashes.includes(faltaData.hash)
          ) {
            await this.updateExistingFalta(faltaData);
            result.processedRows++;
          }
          // Si es 'ignore' o no está en la lista, no hacer nada
        } else {
          // Insertar nueva falta
          await this.createNewFalta(faltaData);
          result.processedRows++;
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Error desconocido",
          data: row,
        });
      }
    }

    // Generar mensaje resumen
    result.message = this.generateResultMessage(result, duplicateHandling);
    result.success = this.determineSuccess(result, duplicateHandling);

    return result;
  }

  /**
   * Asegura que el estudiante exista en la base de datos
   */
  private static async ensureStudentExists(
    studentData: StudentData
  ): Promise<number> {
    // Buscar estudiante existente por código
    let student = await prisma.estudiantes.findUnique({
      where: { codigo: studentData.codigo },
    });

    if (!student) {
      // Crear nuevo estudiante usando el ID y código del CSV
      student = await prisma.estudiantes.create({
        data: {
          id: studentData.id,
          codigo: studentData.codigo,
          nombre: studentData.nombre,
          // grado y nivel se guardan en la tabla faltas como parte del contexto histórico
        },
      });
    } else if (student.id !== studentData.id) {
      // Si el estudiante existe pero con diferente ID, actualizar el nombre
      // pero mantener el ID original de la base de datos
      await prisma.estudiantes.update({
        where: { codigo: studentData.codigo },
        data: {
          nombre: studentData.nombre,
        },
      });
    }

    return student.id;
  }

  /**
   * Crea información de duplicado
   */
  private static createDuplicateInfo(
    faltaData: ProcessedFalta,
    existingFalta: {
      fecha_creacion?: Date | null;
      created_at: Date;
      ultimo_editor?: string | null;
      autor?: string | null;
    }
  ): DuplicateInfo {
    return {
      hash: faltaData.hash,
      description: faltaData.descripcion_falta.substring(0, 100) + "...",
      existingRecord: {
        fecha_creacion:
          existingFalta.fecha_creacion || existingFalta.created_at,
        ultimo_editor:
          existingFalta.ultimo_editor || existingFalta.autor || undefined,
      },
      newRecord: {
        fecha_creacion: faltaData.fecha_creacion,
        ultimo_editor: faltaData.ultimo_editor,
      },
    };
  }

  /**
   * Actualiza una falta existente
   */
  private static async updateExistingFalta(
    faltaData: ProcessedFalta
  ): Promise<void> {
    await prisma.faltas.update({
      where: { hash: faltaData.hash },
      data: {
        fecha_ultima_edicion: faltaData.fecha_ultima_edicion || new Date(),
        ultimo_editor: faltaData.ultimo_editor || "Sistema CSV",
        updated_at: new Date(),
      },
    });
  }

  /**
   * Crea una nueva falta
   */
  private static async createNewFalta(
    faltaData: ProcessedFalta
  ): Promise<void> {
    await prisma.faltas.create({
      data: faltaData,
    });
  }

  /**
   * Genera el mensaje de resultado
   */
  private static generateResultMessage(
    result: ProcessingResult,
    duplicateHandling?: DuplicateHandlingOptions
  ): string {
    if (result.duplicates.length > 0 && !duplicateHandling) {
      return `Se encontraron ${result.duplicates.length} registros duplicados. Por favor, selecciona cómo manejarlos.`;
    }

    let message = `Procesamiento completado. ${result.processedRows} registros procesados de ${result.totalRows} total.`;

    if (result.errors.length > 0) {
      message += ` ${result.errors.length} errores encontrados.`;
    }

    return message;
  }

  /**
   * Determina si el procesamiento fue exitoso
   */
  private static determineSuccess(
    result: ProcessingResult,
    duplicateHandling?: DuplicateHandlingOptions
  ): boolean {
    return !(result.duplicates.length > 0 && !duplicateHandling);
  }

  /**
   * Valida el formato de archivo
   */
  static validateFileFormat(file: File): { valid: boolean; error?: string } {
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      return {
        valid: false,
        error: "El archivo debe ser de formato CSV",
      };
    }

    // Verificar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        error: "El archivo es demasiado grande. Máximo 5MB permitido.",
      };
    }

    return { valid: true };
  }
}
