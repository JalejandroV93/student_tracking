// src/lib/apiClient.ts (New File)
import type {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";

// --- Helper for handling API responses ---
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }
  return response.json() as Promise<T>;
}

// Tipos para paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  schoolYearId?: string;
  includeStats?: boolean;
  onlyWithInfractions?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Función para construir query params
function buildQueryParams(params: PaginationParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.schoolYearId) searchParams.set('schoolYearId', params.schoolYearId);
  if (params.includeStats) searchParams.set('includeStats', 'true');
  if (params.onlyWithInfractions) searchParams.set('onlyWithInfractions', 'true');
  
  return searchParams.toString();
}

// --- Fetching Functions ---

export const fetchStudentsList = async (): Promise<Student[]> => {
  const response = await fetch("/api/v1/students");
  return handleResponse<Student[]>(response);
};

// Nueva función para búsqueda paginada
export const fetchStudentsPaginated = async (params: PaginationParams = {}): Promise<PaginatedResponse<Student>> => {
  const queryString = buildQueryParams(params);
  const url = `/api/v1/students${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url);
  return handleResponse<PaginatedResponse<Student>>(response);
};

// Nueva función para infinite query
export const fetchStudentsInfinite = async ({ pageParam = 1, ...params }: PaginationParams & { pageParam?: number }): Promise<PaginatedResponse<Student>> => {
  const queryString = buildQueryParams({ ...params, page: pageParam });
  const url = `/api/v1/students${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(url);
  return handleResponse<PaginatedResponse<Student>>(response);
};

export const fetchStudentsListWithStats = async (): Promise<Student[]> => {
  const response = await fetch("/api/v1/students?includeStats=true");
  return handleResponse<Student[]>(response);
};

export const fetchStudentCount = async (): Promise<number> => {
  const response = await fetch("/api/v1/students?countOnly=true");
  const data = await handleResponse<{ count: number }>(response);
  return data.count;
};

export const fetchStudentDetails = async (
  studentId: string,
  options: { autoSync?: boolean; skipAutoSync?: boolean } = {}
): Promise<{
  student: Student;
  infractions: Infraction[];
  followUps: FollowUp[];
}> => {
  if (!studentId) throw new Error("Student ID is required");
  
  const { autoSync = false, skipAutoSync = false } = options;
  const queryParams = new URLSearchParams({ studentId });
  
  // Solo incluir autoSync si se solicita explícitamente y no se debe saltar
  if (autoSync && !skipAutoSync) {
    queryParams.set('autoSync', 'true');
  }
  
  const response = await fetch(`/api/v1/students?${queryParams.toString()}`);
  // The API returns an object { student, infractions, followUps }
  return handleResponse<{
    student: Student;
    infractions: Infraction[];
    followUps: FollowUp[];
  }>(response);
};

// Nueva función para sincronizar manualmente un estudiante con Phidias
export const syncStudentWithPhidias = async (
  studentId: string
): Promise<{
  success: boolean;
  message: string;
  syncId?: string;
}> => {
  const response = await fetch(`/api/v1/phidias/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      specificStudentId: parseInt(studentId),
      triggeredBy: "manual-sync" // Indicar que es una sincronización manual
    }),
  });
  return handleResponse<{
    success: boolean;
    message: string;
    syncId?: string;
  }>(response);
};

// Función para obtener el estado de sincronización
export const getSyncStatus = async (syncId: string): Promise<{
  status: 'running' | 'completed' | 'error';
  result?: {
    success: boolean;
    studentsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    errors?: Array<{ studentId: number; error: string }>;
  };
  message?: string;
}> => {
  const response = await fetch(`/api/v1/phidias/sync?syncId=${syncId}`);
  return handleResponse<{
    status: 'running' | 'completed' | 'error';
    result?: {
      success: boolean;
      studentsProcessed: number;
      recordsCreated: number;
      recordsUpdated: number;
      errors?: Array<{ studentId: number; error: string }>;
    };
    message?: string;
  }>(response);
};

export const fetchInfractions = async (): Promise<Infraction[]> => {
  const response = await fetch("/api/v1/infractions");
  return handleResponse<Infraction[]>(response);
};

export const fetchFollowUps = async (): Promise<FollowUp[]> => {
  const response = await fetch("/api/v1/followups");
  return handleResponse<FollowUp[]>(response);
};

// Adjust the return type based on your actual API response structure
export const fetchSettings = async (): Promise<{
  configured: boolean;
  settings: AlertSettings | null;
}> => {
  const response = await fetch("/api/v1/alert-settings");
  const data = await handleResponse<{
    configured: boolean;
    settings?: AlertSettings;
  }>(response);
  // Ensure settings is explicitly null if not configured
  return { configured: data.configured, settings: data.settings ?? null };
};

// --- Mutation Functions (Return the result from API) ---

export const updateAlertSettings = async (
  newSettings: AlertSettings
): Promise<AlertSettings> => {
  const response = await fetch("/api/v1/alert-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newSettings),
  });
  // Assuming the API returns the saved settings object on success
  return handleResponse<AlertSettings>(response);
};

export const addFollowUp = async (
  followUpData: Omit<FollowUp, "id">
): Promise<FollowUp> => {
  const response = await fetch("/api/v1/followups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(followUpData),
  });
  // Assuming the API returns the newly created follow-up object
  return handleResponse<FollowUp>(response);
};

export const toggleInfractionAttended = async ({
  infractionId,
  attended,
  observaciones,
  observacionesAutor,
}: {
  infractionId: string;
  attended: boolean;
  observaciones?: string;
  observacionesAutor?: string;
}): Promise<{ hash: string; attended: boolean }> => {
  const response = await fetch(`/api/v1/infractions/${infractionId}/attend`, {
    // Corrected API route based on file structure
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attended, observaciones, observacionesAutor }),
  });
  // Assuming API returns { hash, attended }
  return handleResponse<{ hash: string; attended: boolean }>(response);
};

// Nueva función para agregar solo observaciones
export const addObservaciones = async ({
  infractionId,
  observaciones,
  autor,
}: {
  infractionId: string;
  observaciones: string;
  autor?: string;
}): Promise<{
  hash: string;
  observaciones: string;
  observaciones_autor: string;
  observaciones_fecha: string;
}> => {
  const response = await fetch(
    `/api/v1/infractions/${infractionId}/observaciones`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observaciones, autor }),
    }
  );
  return handleResponse<{
    hash: string;
    observaciones: string;
    observaciones_autor: string;
    observaciones_fecha: string;
  }>(response);
};
