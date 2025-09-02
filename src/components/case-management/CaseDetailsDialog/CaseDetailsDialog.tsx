// src/components/case-management/CaseDetailsDialog/CaseDetailsDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import type { CaseItem } from "@/stores/case-management.store";
import { CaseInfo } from "./CaseInfo";
import { FollowUpTimeline } from "./FollowUpTimeline";
import { ExpectedDates } from "./ExpectedDates";

interface CaseDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseItem: CaseItem | null;
}

export const CaseDetailsDialog = React.memo(
  ({ isOpen, onOpenChange, caseItem }: CaseDetailsDialogProps) => {
    if (!caseItem) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] w-[95vw] sm:w-full">
          <DialogHeader className="space-y-2">
            <DialogTitle>Detalles del Caso</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Seguimientos para la falta Tipo II de {caseItem.studentName} del{" "}
              {formatDate(caseItem.infractionDate)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6 py-2">
              {/* Información del caso */}
              <CaseInfo caseItem={caseItem} />

              {/* Estado de seguimientos */}
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-4">Seguimientos Registrados</h4>
                <FollowUpTimeline followUps={caseItem.followUps} />
              </div>

              {/* Fechas esperadas */}
              <ExpectedDates caseItem={caseItem} />
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-4 border-t">
            <DialogClose asChild>
              <Button>Cerrar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

CaseDetailsDialog.displayName = "CaseDetailsDialog";
