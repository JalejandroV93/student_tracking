// src/app/dashboard/students/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentDetailCard } from "@/components/students/StudentDetailCard";
import { FollowUpDialog } from "@/components/students/FollowUpDialog";
import { EnhancedInfractionDetailsModal } from "@/components/students/EnhancedInfractionDetailsModal";
import { StudentSchoolYearFilter } from "@/components/students/StudentSchoolYearFilter";
import { useInfractionLoadingState } from "@/components/students/hooks";
import type { FollowUp, Infraction } from "@/types/dashboard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStudentDetails,
  addFollowUp,
  toggleInfractionAttended,
  addObservaciones,
} from "@/lib/apiClient";
import { toast } from "sonner";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const queryClient = useQueryClient();
  const { activeSchoolYear } = useDashboardFilters();

  // Hook mejorado para manejo de loading por ID
  const { loadingStates, setLoading } = useInfractionLoadingState();

  // Estado para el filtro de año académico
  const [selectedSchoolYear, setSelectedSchoolYear] =
    useState<string>("active");

  const {
    data: studentDetailsData,
    isLoading: detailLoading,
    error: detailError,
    refetch: refetchStudentDetails,
  } = useQuery({
    queryKey: ["students", studentId],
    queryFn: () => fetchStudentDetails(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher data for detail view
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
  });

  const { mutate: saveFollowUp, isPending: isAddingFollowUp } = useMutation({
    mutationFn: addFollowUp,
    onMutate: ({ infractionId }) => {
      // Set loading state for the specific infraction
      setLoading(infractionId, true);
    },
    onSuccess: (data, { infractionId }) => {
      toast.success("Seguimiento agregado exitosamente!");
      setFollowUpDialogOpen(false);
      setSelectedInfractionForFollowUp(null);
      setLoading(infractionId, false);

      // Invalidar todas las consultas relacionadas para asegurar que los datos se actualicen
      queryClient.invalidateQueries({ queryKey: ["students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      queryClient.invalidateQueries({ queryKey: ["infractions"] });

      // Refrescar los datos del estudiante inmediatamente
      refetchStudentDetails();
    },
    onError: (error, { infractionId }) => {
      toast.error(`Error agregando seguimiento: ${error.message}`);
      setLoading(infractionId, false);
    },
  });

  const { mutate: toggleAttended, isPending: isTogglingAttended } = useMutation(
    {
      mutationFn: ({
        infractionId,
        attended,
        observaciones,
        observacionesAutor,
      }: {
        infractionId: string;
        attended: boolean;
        observaciones?: string;
        observacionesAutor?: string;
      }) =>
        toggleInfractionAttended({
          infractionId,
          attended,
          observaciones,
          observacionesAutor,
        }),
      onMutate: ({ infractionId }) => {
        // Set loading state for the specific infraction
        setLoading(infractionId, true);
      },
      onSuccess: (data, variables) => {
        toast.success(
          `Falta marcada como ${variables.attended ? "Atendida" : "Pendiente"}.`
        );
        setLoading(variables.infractionId, false);

        queryClient.invalidateQueries({ queryKey: ["students", studentId] });
        queryClient.invalidateQueries({ queryKey: ["infractions"] });
        queryClient.invalidateQueries({ queryKey: ["alerts"] });

        // Refrescar los datos del estudiante inmediatamente
        refetchStudentDetails();
      },
      onError: (error, { infractionId }) => {
        toast.error(`Error actualizando estado: ${error.message}`);
        setLoading(infractionId, false);
      },
    }
  );

  const { mutate: saveObservaciones, isPending: isSavingObservaciones } =
    useMutation({
      mutationFn: addObservaciones,
      onSuccess: () => {
        toast.success("Observaciones agregadas exitosamente!");
        queryClient.invalidateQueries({ queryKey: ["students", studentId] });
        refetchStudentDetails();
      },
      onError: (error) => {
        toast.error(`Error agregando observaciones: ${error.message}`);
      },
    });

  const [isFollowUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedInfractionForFollowUp, setSelectedInfractionForFollowUp] =
    useState<Infraction | null>(null);
  const [isInfractionModalOpen, setIsInfractionModalOpen] = useState(false);
  const [selectedInfractionForModal, setSelectedInfractionForModal] =
    useState<Infraction | null>(null);

  const handleOpenFollowUpDialog = (infraction: Infraction) => {
    setSelectedInfractionForFollowUp(infraction);
    setFollowUpDialogOpen(true);
  };

  const handleOpenInfractionModal = (infraction: Infraction) => {
    setSelectedInfractionForModal(infraction);
    setIsInfractionModalOpen(true);
  };

  const handleAddFollowUp = async (followUpData: Omit<FollowUp, "id">) => {
    saveFollowUp(followUpData);
  };

  const handleToggleAttended = (
    infraction: Infraction,
    observaciones?: string
  ) => {
    toggleAttended({
      infractionId: infraction.id,
      attended: !infraction.attended,
      observaciones,
      observacionesAutor: "Usuario", // TODO: Obtener del contexto de usuario
    });
  };

  const handleAddObservaciones = async (
    infraction: Infraction,
    observaciones: string
  ) => {
    saveObservaciones({
      infractionId: infraction.id,
      observaciones,
      autor: "Usuario", // TODO: Obtener del contexto de usuario
    });
  };

  const student = studentDetailsData?.student;
  const infractions = studentDetailsData?.infractions ?? [];
  const followUps = studentDetailsData?.followUps ?? [];

  // Función para filtrar infracciones por año académico
  const getFilteredInfractions = () => {
    if (selectedSchoolYear === "all") {
      return infractions;
    }

    if (selectedSchoolYear === "active" && activeSchoolYear) {
      return infractions.filter(
        (infraction) => infraction.schoolYearId === activeSchoolYear.id
      );
    }

    if (selectedSchoolYear !== "active") {
      const schoolYearId = parseInt(selectedSchoolYear);
      return infractions.filter(
        (infraction) => infraction.schoolYearId === schoolYearId
      );
    }

    return infractions;
  };

  const filteredInfractions = getFilteredInfractions();

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

  // Sort filtered infractions by date, newest first
  const sortedInfractions = [...filteredInfractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ContentLayout title={`Estudiante: ${student?.name || ""}`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
          </Button>

          {/* Filtro de año académico */}
          <StudentSchoolYearFilter
            selectedYear={selectedSchoolYear}
            onYearChange={setSelectedSchoolYear}
          />
        </div>

        {/* Student Detail Card - Usando el nuevo sistema de loading */}
        {student && (
          <StudentDetailCard
            student={student}
            infractions={sortedInfractions}
            followUps={followUps}
            onAddFollowUpClick={handleOpenFollowUpDialog}
            onToggleAttendedClick={handleToggleAttended}
            onViewInfractionDetailsClick={handleOpenInfractionModal}
            loadingStates={loadingStates}
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

        {/* Enhanced Infraction Details Modal */}
        {selectedInfractionForModal && student && (
          <EnhancedInfractionDetailsModal
            isOpen={isInfractionModalOpen}
            onOpenChange={setIsInfractionModalOpen}
            infraction={selectedInfractionForModal}
            student={student}
            onToggleAttended={handleToggleAttended}
            onAddObservaciones={handleAddObservaciones}
            isLoading={isTogglingAttended || isSavingObservaciones}
          />
        )}
      </div>
    </ContentLayout>
  );
}
