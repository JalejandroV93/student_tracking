"use client";

import { useState, useCallback } from "react";

export interface Student {
  id: string;
  name: string;
  code: string;
  grado: string;
  level: string;
  photo_url?: string;
  firstname?: string;
  lastname?: string;
  seccion?: string;
}

export interface StudentFilters {
  search?: string;
  grado?: string;
  nivel?: string; // Cambio de seccion a nivel
  schoolYearId?: string;
  page?: number;
  limit?: number;
}

export interface CreateStudentData {
  codigo: number;
  nombre: string;
  firstname: string;
  lastname: string;
  grado: string;
  seccion: string;
  school_year_id: number;
  photo_url?: string;
}

export interface UpdateStudentData {
  nombre?: string;
  firstname?: string;
  lastname?: string;
  grado?: string;
  seccion?: string;
  school_year_id?: number;
  photo_url?: string;
}

export function useStudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadStudents = useCallback(async (filters: StudentFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.grado && filters.grado !== "all") params.append("grado", filters.grado);
      if (filters.nivel && filters.nivel !== "all") params.append("nivel", filters.nivel);
      if (filters.schoolYearId && filters.schoolYearId !== "active") {
        params.append("schoolYearId", filters.schoolYearId);
      }
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/v1/students-management?${params}`);
      
      if (!response.ok) {
        throw new Error("Error al cargar estudiantes");
      }

      const data = await response.json();
      setStudents(data.students || []);
      setTotalStudents(data.total || 0);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (studentData: CreateStudentData) => {
    const response = await fetch("/api/v1/students-management", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear estudiante");
    }

    return response.json();
  }, []);

  const updateStudent = useCallback(async (id: string, studentData: UpdateStudentData) => {
    const response = await fetch(`/api/v1/students-management/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar estudiante");
    }

    return response.json();
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    const response = await fetch(`/api/v1/students-management/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar estudiante");
    }

    return response.json();
  }, []);

  return {
    students,
    totalStudents,
    loading,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}