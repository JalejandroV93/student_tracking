// Types for Prisma groupBy results
export interface FaltasGroupByResult {
  seccion?: string | null;
  nivel?: string | null;
  tipo_falta?: string | null;
  descripcion_falta?: string | null;
  autor?: string | null;
  _count: {
    hash: number;
  };
}

export interface MonthlyTrendRawResult {
  mes: Date;
  tipo_falta: string;
  cantidad: bigint | number;
}

export interface FormattedCategoryData {
  name: string;
  tipoI: number;
  tipoII: number;
  tipoIII: number;
  total: number;
}

export interface FormattedTeacherData {
  autor: string;
  tipoI: number;
  tipoII: number;
  tipoIII: number;
  total: number;
}

export interface FormattedRecurrentFault {
  grado?: string;
  nivel?: string;
  descripcion: string;
  cantidad: number;
}

// Database filter types
export interface DatabaseFilters {
  fecha?: {
    gte?: Date;
    lte?: Date;
    lt?: Date;
  };
  trimestre?: string;
  nivel?: string;
  seccion?: string;
  tipo_falta?: string;
  school_year_id?: number;
  autor?: {
    not: null;
  };
}