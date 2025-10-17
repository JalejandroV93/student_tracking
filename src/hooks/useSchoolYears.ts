"use client";

import { useState, useEffect } from "react";

export interface SchoolYear {
  id: number;
  name: string;
  isActive: boolean;
}

export function useSchoolYears() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await fetch('/api/v1/school-years');
        if (!response.ok) {
          throw new Error('Error al cargar los años académicos');
        }
        const result = await response.json();
        if (result.success) {
          // Transformar los datos al formato esperado
          const transformedData = result.data.map((year: { id: number; name: string; isActive: boolean }) => ({
            id: year.id,
            name: year.name,
            isActive: year.isActive,
          }));
          setSchoolYears(transformedData);
        } else {
          throw new Error(result.error || 'Error al cargar los años académicos');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolYears();
  }, []);

  const activeSchoolYear = schoolYears.find(year => year.isActive);

  return {
    schoolYears,
    activeSchoolYear,
    loading,
    error,
  };
}