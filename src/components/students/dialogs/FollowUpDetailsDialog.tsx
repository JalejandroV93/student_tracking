import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Calendar,
  FileText,
  User,
  AlertCircle,
  X,
  Edit,
  Clock,
} from "lucide-react";

import type { Infraction, FollowUp } from "@/types/dashboard";
import { formatDate } from "@/lib/utils";

interface FollowUpDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction;
  followUps: FollowUp[];
  studentName: string;
  onEditFollowUp?: (followUp: FollowUp) => void; // Nueva prop para editar seguimientos
}

export function FollowUpDetailsDialog({
  isOpen,
  onOpenChange,
  infraction,
  followUps,
  studentName,
  onEditFollowUp,
}: FollowUpDetailsDialogProps) {
  // Ordenar seguimientos por número
  const sortedFollowUps = [...followUps].sort(
    (a, b) => a.followUpNumber - b.followUpNumber
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
        <div className="bg-[#be1522] text-white px-6 py-4 relative">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 text-white" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historial de Seguimientos
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm text-red-100">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Falta {infraction.type} - {infraction.number} de{" "}
                  <strong className="text-white">{studentName}</strong> del{" "}
                  {formatDate(infraction.date)}
                </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Información de la falta con mejor diseño */}
          <div className=" p-5 ">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-[#be1522] rounded-full"></div>
              <h4 className="font-semibold text-gray-900">
                Detalles de la Falta
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-700">Descripción:</span>
                <span className="text-gray-600 bg-white/50 p-2 rounded border">
                  {infraction.description || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-700">Detalles:</span>
                <span className="text-gray-600 bg-white/50 p-2 rounded border">
                  {infraction.details || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-700">
                  Acciones remediales:
                </span>
                <span className="text-gray-600 bg-white/50 p-2 rounded border">
                  {infraction.remedialActions || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-700">
                  Registrado por:
                </span>
                <span className="text-gray-600">
                  {infraction.author || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline de seguimientos mejorada */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#be1522] rounded-full"></div>
              <h4 className="font-semibold text-gray-900">
                Cronología de Seguimientos
              </h4>
            </div>
            {sortedFollowUps.length > 0 ? (
              <div className="space-y-4">
                {sortedFollowUps.map((followUp, index) => (
                  <div
                    key={followUp.id}
                    id={`follow-up-${index}`}
                    className="border-l-4 border-[#be1522] pl-6 pb-6 relative"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#be1522] absolute -left-[14px] top-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {followUp.followUpNumber}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-gray-900 text-base">
                          Seguimiento {followUp.followUpNumber}
                        </h5>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(followUp.date)}
                          </div>
                          {onEditFollowUp && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEditFollowUp(followUp)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed mb-3 bg-gray-50 p-3 rounded border">
                        {followUp.details}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Creado por: {followUp.author || "N/A"}</span>
                        </div>
                        {followUp.updatedBy && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              Última edición por: {followUp.updatedBy}
                            </span>
                            {followUp.updatedAt && (
                              <span className="ml-1">
                                el {formatDate(followUp.updatedAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  No hay seguimientos registrados para esta falta.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <DialogClose asChild>
            <Button
              className="bg-[#be1522] hover:bg-[#a01219] text-white px-6 py-2 font-medium transition-colors"
              size="lg"
            >
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
