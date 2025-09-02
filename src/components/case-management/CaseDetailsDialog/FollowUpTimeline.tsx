// src/components/case-management/CaseDetailsDialog/FollowUpTimeline.tsx
import React from "react";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { FollowUp } from "@/types/dashboard";

interface FollowUpTimelineProps {
  followUps: FollowUp[];
}

export const FollowUpTimeline = React.memo(
  ({ followUps }: FollowUpTimelineProps) => {
    if (followUps.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No hay seguimientos registrados para este caso.
        </div>
      );
    }

    const sortedFollowUps = followUps.sort(
      (a, b) => a.followUpNumber - b.followUpNumber
    );

    return (
      <div className="space-y-4">
        {sortedFollowUps.map((followUp) => (
          <div key={followUp.id} className="border-l-2 pl-4 pb-6 relative">
            {/* Círculo en la timeline */}
            <div className="w-4 h-4 rounded-full bg-primary absolute -left-[9px] top-0"></div>

            <div className="bg-card p-4 rounded-md shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <h5 className="font-semibold">
                  Seguimiento {followUp.followUpNumber}
                </h5>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {formatDate(followUp.date)}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm leading-relaxed">
                {followUp.details}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Registrado por: {followUp.author || "N/A"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

FollowUpTimeline.displayName = "FollowUpTimeline";
