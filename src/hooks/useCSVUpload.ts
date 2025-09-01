"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  UploadResponse,
  ProcessingResult,
  DuplicateHandlingOptions,
} from "@/types/csv-import";

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

export function useCSVUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ProcessingResult | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const uploadFile = useCallback(
    async (
      file: File,
      tipoFalta: string,
      trimestreId: string,
      duplicateHandling?: DuplicateHandlingOptions,
      onSuccess?: (result: ProcessingResult) => void,
      onError?: (error: string) => void
    ): Promise<ProcessingResult | null> => {
      setIsUploading(true);
      setUploadResult(null);
      setUploadProgress(0);
      setUploadStatus("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipoFalta", tipoFalta);
        formData.append("trimestreId", trimestreId);

        if (duplicateHandling) {
          formData.append(
            "duplicateHandling",
            JSON.stringify(duplicateHandling)
          );
        }

        // Simular progreso de subida
        setUploadProgress(30);

        const response = await fetch("/api/v1/faltas/upload", {
          method: "POST",
          body: formData,
        });

        // Simular progreso de procesamiento
        setUploadStatus("processing");
        setUploadProgress(70);

        const data: UploadResponse = await response.json();

        if (!response.ok) {
          setUploadStatus("error");
          throw new Error(data.error || "Error al procesar el archivo");
        }

        // Completar progreso
        setUploadProgress(100);
        setUploadStatus("completed");

        if (data.result) {
          setUploadResult(data.result);

          // Si no hay duplicados o ya se manejaron, es éxito completo
          if (data.result.duplicates.length === 0 || duplicateHandling) {
            toast.success(data.result.message);
            onSuccess?.(data.result);
          }

          return data.result;
        }

        return null;
      } catch (error) {
        setUploadStatus("error");
        setUploadProgress(0);
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        toast.error(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadResult(null);
    setUploadProgress(0);
    setUploadStatus("idle");
  }, []);

  return {
    isUploading,
    uploadResult,
    uploadProgress,
    uploadStatus,
    uploadFile,
    resetUpload,
  };
}
