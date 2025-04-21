// src/app/dashboard/students/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentDetailCard } from "@/components/students/StudentDetailCard";
import { FollowUpDialog } from "@/components/students/FollowUpDialog";
import type { FollowUp, Infraction } from "@/types/dashboard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudentDetails,
  addFollowUp,
  toggleInfractionAttended,
} from "@/lib/apiClient";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const queryClient = useQueryClient();

  const {
    data: studentDetailsData,
    isLoading: detailLoading,
    error: detailError,
    isFetching: detailIsFetching,
  } = useQuery({
    queryKey: ["students", studentId],
    queryFn: () => fetchStudentDetails(studentId),
    enabled: !!studentId,
  });

  const { mutate: saveFollowUp, isPending: isAddingFollowUp } = useMutation({
    mutationFn: addFollowUp,
    onSuccess: (newFollowUp) => {
      toast.success("Seguimiento agregado exitosamente!");
      setFollowUpDialogOpen(false);
      setSelectedInfractionForFollowUp(null);
      queryClient.invalidateQueries({ queryKey: ["students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (error) => {
      toast.error(`Error agregando seguimiento: ${error.message}`);
    },
  });

  const { mutate: toggleAttended, isPending: isTogglingAttended } = useMutation(
    {
      mutationFn: toggleInfractionAttended,
      onSuccess: (data, variables) => {
        toast.success(
          `Falta marcada como ${variables.attended ? "Atendida" : "Pendiente"}.`
        );
        queryClient.invalidateQueries({ queryKey: ["students", studentId] });
        queryClient.invalidateQueries({ queryKey: ["infractions"] });
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
      },
      onError: (error) => {
        toast.error(`Error actualizando estado: ${error.message}`);
      },
    }
  );

  const [isFollowUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedInfractionForFollowUp, setSelectedInfractionForFollowUp] =
    useState<Infraction | null>(null);

  const handleOpenFollowUpDialog = (infraction: Infraction) => {
    setSelectedInfractionForFollowUp(infraction);
    setFollowUpDialogOpen(true);
  };

  const handleAddFollowUp = async (followUpData: Omit<FollowUp, "id">) => {
    saveFollowUp(followUpData);
  };

  const handleToggleAttended = (infraction: Infraction) => {
    toggleAttended({
      infractionId: infraction.id,
      attended: !infraction.attended,
    });
  };

  const isActionLoading =
    isAddingFollowUp || isTogglingAttended || detailIsFetching;

  const student = studentDetailsData?.student;
  const infractions = studentDetailsData?.infractions ?? [];
  const followUps = studentDetailsData?.followUps ?? [];

  if (detailLoading) {
    return (
      <ContentLayout title="Detalles del Estudiante">
        <div className="flex items-center justify-center h-[calc(100vh-250px)]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ContentLayout>
    );
  }

  if (detailError) {
    return (
      <ContentLayout title="Detalles del Estudiante">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center">
          <p className="text-destructive mb-4">{detailError.message}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </div>
      </ContentLayout>
    );
  }

  if (!student && !detailLoading) {
    return (
      <ContentLayout title="Detalles del Estudiante">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center">
          <p className="text-muted-foreground mb-4">
            No se encontró información del estudiante.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/students")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Buscar Estudiantes
          </Button>
        </div>
      </ContentLayout>
    );
  }

  // Sort infractions by date, newest first
  const sortedInfractions = [...infractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ContentLayout title={`Estudiante: ${student?.name || ""}`}>
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
        </Button>

        {/* Student Detail Card */}
        {student && (
          <StudentDetailCard
            student={student}
            infractions={sortedInfractions}
            followUps={followUps}
            onAddFollowUpClick={handleOpenFollowUpDialog}
            onToggleAttendedClick={handleToggleAttended}
            isActionLoading={isActionLoading}
          />
        )}

        {/* Follow Up Dialog */}
        {selectedInfractionForFollowUp && student && (
          <FollowUpDialog
            isOpen={isFollowUpDialogOpen}
            onOpenChange={setFollowUpDialogOpen}
            infraction={selectedInfractionForFollowUp}
            studentName={student.name}
            existingFollowUps={followUps.filter(
              (f) => f.infractionId === selectedInfractionForFollowUp.id
            )}
            onSubmit={handleAddFollowUp}
            isSubmitting={isAddingFollowUp}
          />
        )}
      </div>
    </ContentLayout>
  );
}
