import type { Infraction, FollowUp } from "@/types/dashboard";
import type { InfractionType, InfractionGroupData } from "../types";

/**
 * Separa las infracciones por tipo siguiendo el principio de Single Responsibility
 */
export function groupInfractionsByType(
  infractions: Infraction[]
): Record<InfractionType, Infraction[]> {
  return infractions.reduce((groups, infraction) => {
    const type = infraction.type as InfractionType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(infraction);
    return groups;
  }, {} as Record<InfractionType, Infraction[]>);
}

/**
 * Obtiene los metadatos para cada grupo de infracciones
 */
export function getInfractionGroupsData(
  infractions: Infraction[]
): InfractionGroupData[] {
  const grouped = groupInfractionsByType(infractions);

  const groupsConfig: Record<
    InfractionType,
    { variant: InfractionGroupData["variant"] }
  > = {
    "Tipo I": { variant: "secondary" },
    "Tipo II": { variant: "warning" },
    "Tipo III": { variant: "destructive" },
  };

  return Object.entries(grouped)
    .filter(([, infractions]) => infractions.length > 0)
    .map(([type, infractions]) => ({
      type: type as InfractionType,
      infractions,
      count: infractions.length,
      variant: groupsConfig[type as InfractionType].variant,
    }));
}

/**
 * Obtiene los seguimientos para una infracción específica ordenados por número
 */
export function getFollowUpsForInfraction(
  followUps: FollowUp[],
  infractionId: string
): FollowUp[] {
  return followUps
    .filter((followUp) => followUp.infractionId === infractionId)
    .sort((a, b) => a.followUpNumber - b.followUpNumber);
}

/**
 * Calcula el estado de una infracción tipo II
 */
export function getTypeIIInfractionStatus(
  followUps: FollowUp[],
  infractionId: string
) {
  const infractionFollowUps = getFollowUpsForInfraction(
    followUps,
    infractionId
  );
  const existingFollowUpNumbers = new Set(
    infractionFollowUps.map((f) => f.followUpNumber)
  );
  const pendingFollowUpCount = 3 - existingFollowUpNumbers.size;
  const isCaseClosed = pendingFollowUpCount === 0;
  const canAddFollowUp = !isCaseClosed;

  return {
    followUps: infractionFollowUps,
    completedCount: infractionFollowUps.length,
    pendingCount: pendingFollowUpCount,
    isCaseClosed,
    canAddFollowUp,
    lastFollowUp: infractionFollowUps[infractionFollowUps.length - 1],
  };
}

/**
 * Valida si hay infracciones para mostrar
 */
export function hasValidInfractions(infractions: Infraction[]): boolean {
  return infractions.length > 0;
}

/**
 * Obtiene el texto para el contador de registros
 */
export function getRecordCountText(count: number): string {
  return `(${count} registro${count !== 1 ? "s" : ""})`;
}
