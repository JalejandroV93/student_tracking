// src/components/case-management/CaseDetailsDialog/CaseInfo.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { CaseItem } from "@/stores/case-management.store";

interface CaseInfoProps {
  caseItem: CaseItem;
}

export const CaseInfo = React.memo(({ caseItem }: CaseInfoProps) => {
  return (
    <div className="bg-muted/50 p-4 rounded-md">
      <h4 className="font-medium mb-2">Información del Caso</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Estudiante:</span>{" "}
          {caseItem.studentName}
        </div>
        <div>
          <span className="font-medium">Grado:</span> {caseItem.studentGrade}
        </div>
        <div>
          <span className="font-medium">Fecha de la falta:</span>{" "}
          {formatDate(caseItem.infractionDate)}
        </div>
        <div>
          <span className="font-medium">Estado:</span>{" "}
          <Badge
            variant={caseItem.status === "closed" ? "success" : "warning"}
            className="ml-1"
          >
            {caseItem.status === "closed" ? "Cerrado" : "Abierto"}
          </Badge>
        </div>
      </div>
    </div>
  );
});

CaseInfo.displayName = "CaseInfo";
