import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import React from "react";

import type { Infraction } from "@/types/dashboard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InfractionDetailsModal } from "./InfractionDetailsModal";
import { FollowUpDetailsDialog } from "./dialogs/FollowUpDetailsDialog";
import { InfractionTableFactory } from "./infractions/InfractionTableFactory";
import { useStudentDialogs } from "./hooks/useStudentDialogs";
import {
  getInfractionGroupsData,
  getFollowUpsForInfraction,
  hasValidInfractions,
} from "./utils/infraction-utils";
import type { StudentDetailCardProps } from "./types";

export function StudentDetailCard({
  student,
  infractions,
  followUps,
  onAddFollowUpClick,
  onToggleAttendedClick,
  onViewInfractionDetailsClick,
  onEditFollowUp,
  loadingStates,
}: StudentDetailCardProps) {
  const { dialogState, actions } = useStudentDialogs();

  // Obtener grupos de infracciones organizados
  const infractionGroups = getInfractionGroupsData(infractions);
  const hasInfractions = hasValidInfractions(infractions);

  // Handlers para los diálogos
  const handleOpenDetailsDialog = (infraction: Infraction) => {
    actions.openFollowUpDetails(infraction);
  };

  const handleOpenInfractionDetailsModal = (infraction: Infraction) => {
    if (onViewInfractionDetailsClick) {
      onViewInfractionDetailsClick(infraction);
    } else {
      actions.openInfractionDetailsModal(infraction);
    }
  };

  return (
    <TooltipProvider>
      <Card className="">
        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl hidden">{student.name}</CardTitle>
            <CardDescription>
              ID: {student.id}
              {(student.grado !== "No especificado" ||
                student.seccion !== "No especificado") && (
                <>
                  {student.grado !== "No especificado" &&
                    ` | Grado: ${student.grado}`}
                  {student.seccion !== "No especificado" &&
                    ` | Nivel: ${student.seccion}`}
                </>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {!hasInfractions ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border rounded-md">
                <Info className="w-8 h-8 mb-2" />
                <span>Este estudiante no tiene faltas registradas.</span>
              </div>
            ) : (
              <>
                {infractionGroups.map((groupData) => (
                  <InfractionTableFactory
                    key={groupData.type}
                    groupData={groupData}
                    followUps={followUps}
                    loadingStates={loadingStates}
                    onToggleAttendedClick={onToggleAttendedClick}
                    onAddFollowUpClick={onAddFollowUpClick}
                    onViewDetailsClick={handleOpenInfractionDetailsModal}
                    onViewFollowUpsClick={handleOpenDetailsDialog}
                  />
                ))}

                {/* Mostrar mensaje si no hay infracciones de tipos válidos */}
                {infractionGroups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-8 h-8 mb-2 mx-auto" />
                    <span>No se encontraron faltas con tipos válidos.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles completos de la falta - Solo se usa si no se pasa handler externo */}
      {!onViewInfractionDetailsClick &&
        dialogState.selectedInfractionForModal && (
          <InfractionDetailsModal
            isOpen={dialogState.isInfractionDetailsModalOpen}
            onOpenChange={actions.closeInfractionDetailsModal}
            infraction={dialogState.selectedInfractionForModal}
            student={student}
          />
        )}

      {/* Diálogo de detalles de seguimiento */}
      {dialogState.selectedInfractionForDetails && (
        <FollowUpDetailsDialog
          isOpen={dialogState.isFollowUpDetailsOpen}
          onOpenChange={actions.closeFollowUpDetails}
          infraction={dialogState.selectedInfractionForDetails}
          followUps={getFollowUpsForInfraction(
            followUps,
            dialogState.selectedInfractionForDetails.id
          )}
          studentName={student.name}
          onEditFollowUp={onEditFollowUp}
        />
      )}
    </TooltipProvider>
  );
}
