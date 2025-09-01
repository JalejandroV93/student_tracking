import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import React from "react";

import type { Infraction, FollowUp } from "@/types/dashboard";
import { formatDate } from "@/lib/utils";

interface FollowUpDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction;
  followUps: FollowUp[];
  studentName: string;
}

export function FollowUpDetailsDialog({
  isOpen,
  onOpenChange,
  infraction,
  followUps,
  studentName,
}: FollowUpDetailsDialogProps) {
  // Ordenar seguimientos por número
  const sortedFollowUps = [...followUps].sort(
    (a, b) => a.followUpNumber - b.followUpNumber
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Historial de Seguimientos</DialogTitle>
          <DialogDescription>
            Falta {infraction.type} - {infraction.number} de{" "}
            <strong>{studentName}</strong> del {formatDate(infraction.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información de la falta */}
          <div className="bg-muted/50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Detalles de la Falta</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Descripción:</span>{" "}
                {infraction.description || "N/A"}
              </div>
              <div>
                <span className="font-medium">Detalles:</span>{" "}
                {infraction.details || "N/A"}
              </div>
              <div>
                <span className="font-medium">Acciones remediales:</span>{" "}
                {infraction.remedialActions || "N/A"}
              </div>
              <div>
                <span className="font-medium">Registrado por:</span>{" "}
                {infraction.author || "N/A"}
              </div>
            </div>
          </div>

          {/* Timeline de seguimientos */}
          <div>
            <h4 className="font-medium mb-4">Cronología de Seguimientos</h4>
            {sortedFollowUps.length > 0 ? (
              <div className="space-y-4">
                {sortedFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="border-l-2 pl-4 pb-6 relative"
                  >
                    {/* Círculo en la timeline */}
                    <div className="w-4 h-4 rounded-full bg-primary absolute -left-[9px] top-0"></div>

                    <div className="bg-card p-4 rounded-md shadow-sm">
                      <div className="flex justify-between items-start">
                        <h5 className="font-semibold">
                          Seguimiento {followUp.followUpNumber}
                        </h5>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(followUp.date)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">{followUp.details}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Registrado por: {followUp.author || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay seguimientos registrados para esta falta.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <DialogClose asChild>
            <Button>Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
