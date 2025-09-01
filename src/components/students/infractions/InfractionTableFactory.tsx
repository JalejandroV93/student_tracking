import React from "react";
import { Badge } from "@/components/ui/badge";
import type { FollowUp, Infraction } from "@/types/dashboard";
import type { InfractionGroupData, InfractionLoadingState } from "../types";
import { getRecordCountText } from "../utils/infraction-utils";
import { TypeIInfractionsTable } from "./TypeIInfractionsTable";
import { TypeIIInfractionsTable } from "./TypeIIInfractionsTable";
import { TypeIIIInfractionsTable } from "./TypeIIIInfractionsTable";

interface InfractionTableFactoryProps {
  groupData: InfractionGroupData;
  followUps?: FollowUp[];
  loadingStates: InfractionLoadingState;
  onToggleAttendedClick?: (infraction: Infraction) => void;
  onAddFollowUpClick?: (infraction: Infraction) => void;
  onViewDetailsClick: (infraction: Infraction) => void;
  onViewFollowUpsClick?: (infraction: Infraction) => void;
}

/**
 * Factory Component para renderizar las tablas de infracciones según el tipo
 * Sigue el principio Open/Closed - abierto para extensión, cerrado para modificación
 */
export function InfractionTableFactory({
  groupData,
  followUps = [],
  loadingStates,
  onToggleAttendedClick,
  onAddFollowUpClick,
  onViewDetailsClick,
  onViewFollowUpsClick,
}: InfractionTableFactoryProps) {
  const { type, infractions, count, variant } = groupData;

  const renderTable = () => {
    switch (type) {
      case "Tipo I":
        if (!onToggleAttendedClick) {
          throw new Error(
            "onToggleAttendedClick is required for Type I infractions"
          );
        }
        return (
          <TypeIInfractionsTable
            infractions={infractions}
            onToggleAttendedClick={onToggleAttendedClick}
            onViewDetailsClick={onViewDetailsClick}
            loadingStates={loadingStates}
          />
        );

      case "Tipo II":
        if (!onAddFollowUpClick || !onViewFollowUpsClick) {
          throw new Error(
            "onAddFollowUpClick and onViewFollowUpsClick are required for Type II infractions"
          );
        }
        return (
          <TypeIIInfractionsTable
            infractions={infractions}
            followUps={followUps}
            onAddFollowUpClick={onAddFollowUpClick}
            onViewDetailsClick={onViewDetailsClick}
            onViewFollowUpsClick={onViewFollowUpsClick}
            loadingStates={loadingStates}
          />
        );

      case "Tipo III":
        return (
          <TypeIIIInfractionsTable
            infractions={infractions}
            onViewDetailsClick={onViewDetailsClick}
            loadingStates={loadingStates}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={variant} className="px-3 py-1">
          Faltas {type}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {getRecordCountText(count)}
        </span>
      </div>
      {renderTable()}
    </div>
  );
}
