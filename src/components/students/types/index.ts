import type { Student, Infraction, FollowUp } from "@/types/dashboard";

// Interfaces específicas para cada responsabilidad

export interface InfractionTableAction {
  id: string;
  type: "toggle-attended" | "add-followup" | "view-details" | "view-followups" | "delete";
  payload?: Record<string, unknown>;
}

export interface InfractionLoadingState {
  [infractionId: string]: boolean;
}

export interface BaseInfractionTableProps {
  infractions: Infraction[];
  onViewDetailsClick: (infraction: Infraction) => void;
  loadingStates: InfractionLoadingState;
}

export interface TypeIInfractionTableProps extends BaseInfractionTableProps {
  onToggleAttendedClick: (infraction: Infraction) => void;
  onDeleteInfractionClick?: (infraction: Infraction) => void;
  userRole?: string;
}

export interface TypeIIInfractionTableProps extends BaseInfractionTableProps {
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void;
  onViewFollowUpsClick: (infraction: Infraction) => void;
  onDeleteInfractionClick?: (infraction: Infraction) => void;
  userRole?: string;
}

export interface TypeIIIInfractionTableProps extends BaseInfractionTableProps {
  onDeleteInfractionClick?: (infraction: Infraction) => void;
  userRole?: string;
}

export interface StudentDialogState {
  isFollowUpDetailsOpen: boolean;
  isInfractionDetailsModalOpen: boolean;
  selectedInfractionForDetails: Infraction | null;
  selectedInfractionForModal: Infraction | null;
}

export interface StudentDetailCardProps {
  student: Student;
  infractions: Infraction[];
  followUps: FollowUp[];
  onAddFollowUpClick: (infraction: Infraction) => void;
  onToggleAttendedClick: (
    infraction: Infraction,
    observaciones?: string
  ) => void;
  onViewInfractionDetailsClick?: (infraction: Infraction) => void;
  onEditFollowUp?: (followUp: FollowUp) => void; // Nueva prop
  onDeleteInfractionClick?: (infraction: Infraction) => void;
  userRole?: string;
  loadingStates: InfractionLoadingState;
}

// Factory pattern para las tablas de infracciones
export type InfractionType = "Tipo I" | "Tipo II" | "Tipo III";

export interface InfractionGroupData {
  type: InfractionType;
  infractions: Infraction[];
  count: number;
  variant: "secondary" | "warning" | "destructive";
}
