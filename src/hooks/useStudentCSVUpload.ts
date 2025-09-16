import { useState } from "react";
import { StudentProcessingResult, StudentUploadResponse } from "@/types/csv-import";

export interface StudentUploadStatus {
  isUploading: boolean;
  progress: number;
  result: StudentProcessingResult | null;
  error: string | null;
}

export function useStudentCSVUpload() {
  const [status, setStatus] = useState<StudentUploadStatus>({
    isUploading: false,
    progress: 0,
    result: null,
    error: null,
  });

  const uploadFile = async (file: File, schoolYearId: number) => {
    setStatus({
      isUploading: true,
      progress: 0,
      result: null,
      error: null,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("schoolYearId", schoolYearId.toString());

      setStatus(prev => ({ ...prev, progress: 50 }));

      const response = await fetch("/api/v1/students/import", {
        method: "POST",
        body: formData,
      });

      setStatus(prev => ({ ...prev, progress: 90 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el archivo");
      }

      const data: StudentUploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al procesar el archivo");
      }

      setStatus({
        isUploading: false,
        progress: 100,
        result: data.result || null,
        error: null,
      });
    } catch (error) {
      setStatus({
        isUploading: false,
        progress: 0,
        result: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  const reset = () => {
    setStatus({
      isUploading: false,
      progress: 0,
      result: null,
      error: null,
    });
  };

  return {
    ...status,
    uploadFile,
    reset,
  };
}