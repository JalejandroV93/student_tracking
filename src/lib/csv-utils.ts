import crypto from "crypto";
import Papa from "papaparse";
import { CSVFaltaRow, ProcessedFalta, StudentData } from "@/types/csv-import";
import {
  asignarNivelAcademico,
  extraerNumeroFalta,
} from "@/lib/academic-level-utils";

/**
 * Genera un hash SHA256 único para una falta
 * Concatena: codigo, fecha_creacion, descripcion_falta, acciones_reparadoras
 */
export function generateFaltaHash(
  codigo: string,
  fechaCreacion: string,
  descripcionFalta: string,
  accionesReparadoras: string
): string {
  const data = `${codigo}_${fechaCreacion}_${descripcionFalta}_${accionesReparadoras}`;
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Parsea fecha en formato DD/MM/YYYY a objeto Date
 */
export function parseCSVDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === "") return null;

  try {
    // Asumiendo formato DD/MM/YYYY HH:mm (opcional)
    const parts = dateString.split(" ");
    const datePart = parts[0];
    const [day, month, year] = datePart.split("/");

    if (!day || !month || !year) return null;

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Validar que la fecha es válida
    if (isNaN(date.getTime())) return null;

    return date;
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return null;
  }
}

/**
 * Extrae el código del estudiante del string
 * Puede estar en formato numérico puro o con texto
 */
export function extractStudentCode(codigoString: string): number | null {
  if (!codigoString) return null;

  // Remover espacios y caracteres no numéricos
  const cleanCode = codigoString.replace(/\D/g, "");
  const code = parseInt(cleanCode);

  return isNaN(code) ? null : code;
}

/**
 * Parsea el archivo CSV y convierte las filas al formato requerido
 */
export function parseCSVFile(csvContent: string): Promise<{
  data: CSVFaltaRow[];
  errors: Papa.ParseError[];
}> {
  return new Promise((resolve) => {
    Papa.parse<CSVFaltaRow>(csvContent, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results: Papa.ParseResult<CSVFaltaRow>) => {
        resolve({
          data: results.data,
          errors: results.errors,
        });
      },
    });
  });
}

/**
 * Convierte una fila CSV a un objeto ProcessedFalta
 */
export function convertCSVRowToFalta(
  row: CSVFaltaRow,
  studentId: number,
  tipoFalta?: string,
  trimestreInfo?: { id: number; name: string; schoolYearId: number }
): ProcessedFalta | null {
  try {
    const codigo = extractStudentCode(row.Código);
    if (!codigo) throw new Error("Código de estudiante inválido");

    const fecha = parseCSVDate(row["Fecha"]);
    if (!fecha) throw new Error("Fecha inválida");

    const fechaCreacion = parseCSVDate(row["Fecha De Creación"]);
    if (!fechaCreacion) throw new Error("Fecha de creación inválida");

    const fechaUltimaEdicion = row["Fecha última Edición"]
      ? parseCSVDate(row["Fecha última Edición"])
      : null;

    const hash = generateFaltaHash(
      row.Código,
      row["Fecha De Creación"],
      row["Descripcion de la falta"] || "",
      row["Acciones Reparadoras"] || ""
    );

    const idExterno = parseInt(row.Id);
    if (isNaN(idExterno)) throw new Error("ID externo inválido");

    // Asignar nivel académico automáticamente basado en la sección
    const nivel = asignarNivelAcademico(row.Sección);

    // Extraer número de falta del campo "Falta segun Manual de Convivencia"
    const numeroFalta = extraerNumeroFalta(
      row["Falta segun Manual de Convivencia"]
    );

    return {
      hash,
      id_estudiante: studentId,
      codigo_estudiante: codigo,
      tipo_falta: tipoFalta || undefined, // Tipo de falta seleccionado por el usuario
      numero_falta: numeroFalta ?? undefined,
      descripcion_falta: row["Descripcion de la falta"] || "",
      detalle_falta: row["Falta segun Manual de Convivencia"] || "",
      acciones_reparadoras: row["Acciones Reparadoras"] || "",
      autor: row.Autor || "",
      fecha,
      trimestre: trimestreInfo?.name || "No asignado", // Nombre del trimestre seleccionado
      trimestre_id: trimestreInfo?.id, // ID del trimestre seleccionado
      school_year_id: trimestreInfo?.schoolYearId, // ID del año escolar correspondiente
      fecha_creacion: fechaCreacion,
      fecha_ultima_edicion: fechaUltimaEdicion || undefined,
      ultimo_editor: row["último Editor"] || undefined,
      seccion: row.Sección || "",
      nivel, // Nivel académico calculado automáticamente
      id_externo: idExterno,
    };
  } catch (error) {
    console.error("Error converting CSV row:", error);
    return null;
  }
}

/**
 * Extrae datos del estudiante de una fila CSV
 */
export function extractStudentData(row: CSVFaltaRow): StudentData | null {
  try {
    const codigo = extractStudentCode(row.Código);
    if (!codigo) return null;

    // Usar el Id del CSV para el campo id del estudiante
    const id = parseInt(row.Id);
    if (isNaN(id)) return null;

    return {
      id,
      codigo,
      nombre: row.Persona || "",
    };
  } catch (error) {
    console.error("Error extracting student data:", error);
    return null;
  }
}

/**
 * Valida que una fila CSV tenga los campos mínimos requeridos
 */
export function validateCSVRow(row: CSVFaltaRow): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!row.Id || row.Id.trim() === "") {
    errors.push("ID del estudiante requerido");
  } else if (isNaN(parseInt(row.Id))) {
    errors.push("ID del estudiante debe ser un número válido");
  }

  if (!row.Código || row.Código.trim() === "") {
    errors.push("Código de estudiante requerido");
  }

  if (!row.Persona || row.Persona.trim() === "") {
    errors.push("Nombre del estudiante requerido");
  }

  if (!row["Fecha De Creación"] || row["Fecha De Creación"].trim() === "") {
    errors.push("Fecha de creación requerida");
  }

  if (!row["Fecha"] || row["Fecha"].trim() === "") {
    errors.push("Fecha de la falta requerida");
  }

  if (
    !row["Descripcion de la falta"] ||
    row["Descripcion de la falta"].trim() === ""
  ) {
    errors.push("Descripción de la falta requerida");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
