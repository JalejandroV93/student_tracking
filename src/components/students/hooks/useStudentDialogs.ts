import { useState } from "react";
import type { Infraction } from "@/types/dashboard";
import type { StudentDialogState } from "../types";

/**
 * Hook personalizado para manejar el estado de los diálogos del estudiante
 * Sigue el principio de Single Responsibility
 */
export function useStudentDialogs() {
  const [dialogState, setDialogState] = useState<StudentDialogState>({
    isFollowUpDetailsOpen: false,
    isInfractionDetailsModalOpen: false,
    selectedInfractionForDetails: null,
    selectedInfractionForModal: null,
  });

  const openFollowUpDetails = (infraction: Infraction) => {
    setDialogState((prev) => ({
      ...prev,
      selectedInfractionForDetails: infraction,
      isFollowUpDetailsOpen: true,
    }));
  };

  const closeFollowUpDetails = () => {
    setDialogState((prev) => ({
      ...prev,
      isFollowUpDetailsOpen: false,
      selectedInfractionForDetails: null,
    }));
  };

  const openInfractionDetailsModal = (infraction: Infraction) => {
    setDialogState((prev) => ({
      ...prev,
      selectedInfractionForModal: infraction,
      isInfractionDetailsModalOpen: true,
    }));
  };

  const closeInfractionDetailsModal = () => {
    setDialogState((prev) => ({
      ...prev,
      isInfractionDetailsModalOpen: false,
      selectedInfractionForModal: null,
    }));
  };

  return {
    dialogState,
    actions: {
      openFollowUpDetails,
      closeFollowUpDetails,
      openInfractionDetailsModal,
      closeInfractionDetailsModal,
    },
  };
}
