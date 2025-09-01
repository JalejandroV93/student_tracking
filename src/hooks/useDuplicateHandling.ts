"use client";

import { useState, useCallback } from "react";
import type { ProcessingResult } from "@/types/csv-import";

export function useDuplicateHandling() {
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(
    new Set()
  );

  const openDuplicatesDialog = useCallback(() => {
    setShowDuplicatesDialog(true);
    setSelectedDuplicates(new Set());
  }, []);

  const closeDuplicatesDialog = useCallback(() => {
    setShowDuplicatesDialog(false);
    setSelectedDuplicates(new Set());
  }, []);

  const toggleDuplicateSelection = useCallback((hash: string) => {
    setSelectedDuplicates((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(hash)) {
        newSelection.delete(hash);
      } else {
        newSelection.add(hash);
      }
      return newSelection;
    });
  }, []);

  const selectAllDuplicates = useCallback(
    (duplicates: ProcessingResult["duplicates"]) => {
      setSelectedDuplicates(new Set(duplicates.map((d) => d.hash)));
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedDuplicates(new Set());
  }, []);

  return {
    showDuplicatesDialog,
    selectedDuplicates,
    openDuplicatesDialog,
    closeDuplicatesDialog,
    toggleDuplicateSelection,
    selectAllDuplicates,
    clearSelection,
  };
}
