// src/components/case-management/CaseDetailsDialog/ExpectedDates.tsx
import React from "react";
import { CalendarClock, CalendarCheck2 } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import type { CaseItem } from "@/stores/case-management.store";

interface ExpectedDatesProps {
  caseItem: CaseItem;
}

export const ExpectedDates = React.memo(({ caseItem }: ExpectedDatesProps) => {
  return (
    <div>
      <h4 className="font-medium mb-3">Fechas Esperadas de Seguimiento</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {caseItem.expectedDates.map((date, index) => {
          const followUpNumber = index + 1;
          const isCompleted = caseItem.followUps.some(
            (f) => f.followUpNumber === followUpNumber
          );

          return (
            <div
              key={index}
              className={cn(
                "border rounded-md p-3 text-sm transition-colors",
                isCompleted
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                  : "bg-muted/30 border-muted"
              )}
            >
              <div className="font-medium mb-2">
                Seguimiento {followUpNumber}
              </div>
              <div className="flex items-center">
                {isCompleted ? (
                  <>
                    <CalendarCheck2 className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                    <span className="text-green-600 text-xs">Completado</span>
                  </>
                ) : (
                  <>
                    <CalendarClock className="h-3 w-3 mr-2 text-amber-600 flex-shrink-0" />
                    <span className="text-xs">{formatDate(date)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ExpectedDates.displayName = "ExpectedDates";
