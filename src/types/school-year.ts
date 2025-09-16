export interface SchoolYear {
  id: number;
  name: string;
  phidias_id?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description?: string | null;
  trimestres?: Trimestre[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trimestre {
  id: number;
  schoolYearId: number;
  name: string;
  order: number;
  startDate: Date;
  endDate: Date;
  schoolYear?: SchoolYear;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSchoolYearRequest {
  name: string;
  phidias_id?: number | null;
  startDate: string;
  endDate: string;
  description?: string;
  trimestres: CreateTrimestreRequest[];
}

export interface CreateTrimestreRequest {
  name: string;
  order: number;
  startDate: string;
  endDate: string;
}

export interface UpdateSchoolYearRequest {
  name?: string;
  phidias_id?: number | null;
  startDate?: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface TrimestreDetectionResult {
  trimestre?: Trimestre;
  trimestreName: string;
  schoolYear?: SchoolYear;
  isValid: boolean;
  error?: string;
}

export interface DateParseResult {
  date: Date;
  format: string;
}

export interface SchoolYearSettings {
  activeSchoolYear?: SchoolYear;
  allSchoolYears: SchoolYear[];
}
