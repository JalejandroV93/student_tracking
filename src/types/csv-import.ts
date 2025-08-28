/**
 * Tipos para el procesamiento de CSV de faltas
 */

// Estructura del CSV de entrada
export interface CSVFaltaRow {
  Id: string;
  Código: string;
  Persona: string;
  Sección: string;
  "Fecha De Creación": string;
  Autor: string;
  "Fecha última Edición": string;
  "último Editor": string;
  "Fecha ": string; // Nota: hay un espacio después de "Fecha" en el CSV original
  "Estudiante con diagnostico?": string;
  "Falta segun Manual de Convivencia": string;
  "Descripcion de la falta": string;
  "Acciones Reparadoras": string;
  "Acta de Descargos": string;
}

// Estructura procesada para la base de datos
export interface ProcessedFalta {
  hash: string;
  id_estudiante: number;
  codigo_estudiante: number;
  tipo_falta?: string; // Tipo I, II, III - seleccionado por el usuario
  numero_falta?: number; // Número extraído del campo "Falta según Manual"
  descripcion_falta: string;
  detalle_falta?: string; // Campo completo de "Falta segun Manual de Convivencia"
  acciones_reparadoras: string;
  autor: string;
  fecha: Date;
  trimestre?: string; // Nombre del trimestre (mantenido por compatibilidad)
  trimestre_id?: number; // ID del trimestre calculado automáticamente
  school_year_id?: number; // ID del año escolar calculado automáticamente
  fecha_creacion: Date;
  fecha_ultima_edicion?: Date;
  ultimo_editor?: string;
  seccion: string;
  nivel?: string; // Nivel académico calculado automáticamente
  id_externo: number;
}

// Estructura para estudiante a crear/verificar
export interface StudentData {
  id: number;
  codigo: number;
  nombre: string;
}

// Resultado del procesamiento
export interface ProcessingResult {
  success: boolean;
  message: string;
  totalRows: number;
  processedRows: number;
  duplicates: DuplicateInfo[];
  errors: ProcessingError[];
}

// Información de duplicados encontrados
export interface DuplicateInfo {
  hash: string;
  description: string;
  existingRecord: {
    fecha_creacion: Date | string;
    ultimo_editor?: string;
  };
  newRecord: {
    fecha_creacion: Date | string;
    ultimo_editor?: string;
  };
}

// Errores de procesamiento
export interface ProcessingError {
  row: number;
  error: string;
  data: Partial<CSVFaltaRow>;
}

// Opciones para manejar duplicados
export interface DuplicateHandlingOptions {
  action: "ignore" | "update";
  duplicateHashes: string[];
}

// Respuesta de la API
export interface UploadResponse {
  success: boolean;
  result?: ProcessingResult;
  error?: string;
}
