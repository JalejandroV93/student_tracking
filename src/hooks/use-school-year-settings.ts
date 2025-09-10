import { useState, useEffect } from "react";
import {
  SchoolYear,
  SchoolYearSettings,
  CreateSchoolYearRequest,
  UpdateSchoolYearRequest,
} from "@/types/school-year";

export function useSchoolYearSettings() {
  const [settings, setSettings] = useState<SchoolYearSettings>({
    allSchoolYears: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolYears = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/school-years");
      const data = await response.json();

      if (data.success) {
        const activeSchoolYear = data.data.find(
          (sy: SchoolYear) => sy.isActive
        );
        setSettings({
          activeSchoolYear,
          allSchoolYears: data.data,
        });
      } else {
        setError(data.error || "Error al cargar años escolares");
      }
    } catch (error) {
      console.error("Error fetching school years:", error);
      setError("Error al cargar años escolares");
    } finally {
      setLoading(false);
    }
  };

  const activateSchoolYear = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/school-years/${id}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchSchoolYears(); // Recargar la lista
        return true;
      } else {
        setError(data.error || "Error al activar año escolar");
        return false;
      }
    } catch (error) {
      console.error("Error activating school year:", error);
      setError("Error al activar año escolar");
      return false;
    }
  };

  const createSchoolYear = async (
    schoolYearData: CreateSchoolYearRequest
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/v1/school-years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolYearData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSchoolYears(); // Recargar la lista
        return true;
      } else {
        setError(data.error || "Error al crear año escolar");
        return false;
      }
    } catch (error) {
      console.error("Error creating school year:", error);
      setError("Error al crear año escolar");
      return false;
    }
  };

  const updateSchoolYear = async (
    id: number,
    schoolYearData: UpdateSchoolYearRequest
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/school-years/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolYearData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchSchoolYears(); // Recargar la lista
        return true;
      } else {
        setError(data.error || "Error al actualizar año escolar");
        return false;
      }
    } catch (error) {
      console.error("Error updating school year:", error);
      setError("Error al actualizar año escolar");
      return false;
    }
  };

  const deleteSchoolYear = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/school-years/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchSchoolYears(); // Recargar la lista
        return true;
      } else {
        setError(data.error || "Error al eliminar año escolar");
        return false;
      }
    } catch (error) {
      console.error("Error deleting school year:", error);
      setError("Error al eliminar año escolar");
      return false;
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  return {
    settings,
    loading,
    error,
    setError,
    fetchSchoolYears,
    activateSchoolYear,
    createSchoolYear,
    updateSchoolYear,
    deleteSchoolYear,
  };
}
