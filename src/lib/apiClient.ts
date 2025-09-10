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

// --- Fetching Functions ---

export const fetchStudentsList = async (): Promise<Student[]> => {
  const response = await fetch("/api/v1/students");
  return handleResponse<Student[]>(response);
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
  studentId: string
): Promise<{
  student: Student;
  infractions: Infraction[];
  followUps: FollowUp[];
}> => {
  if (!studentId) throw new Error("Student ID is required");
  const response = await fetch(`/api/v1/students?studentId=${studentId}`);
  // The API returns an object { student, infractions, followUps }
  return handleResponse<{
    student: Student;
    infractions: Infraction[];
    followUps: FollowUp[];
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
