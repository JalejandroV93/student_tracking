// src/app/dashboard/students/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentDetailCard } from "@/components/students/StudentDetailCard"; // Adjust path
import { FollowUpDialog } from "@/components/students/FollowUpDialog"; // Adjust path
import { useStudentsStore } from "@/stores/students.store"; // Adjust path
import type { FollowUp, Infraction } from "@/types/dashboard";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const {
    selectedStudentData,
    fetchStudentDetails,
    addFollowUp,
    detailLoading,
    detailError,
  } = useStudentsStore();

  const [isFollowUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedInfractionForFollowUp, setSelectedInfractionForFollowUp] = useState<Infraction | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails(studentId);
    }
    // No cleanup needed to clear student on unmount, handled by store/list page
  }, [studentId, fetchStudentDetails]);


  const handleOpenFollowUpDialog = (infraction: Infraction) => {
      setSelectedInfractionForFollowUp(infraction);
      setFollowUpDialogOpen(true);
  };

   const handleAddFollowUp = async (followUpData: Omit<FollowUp, "id">) => {
       const result = await addFollowUp(followUpData);
       if (result) {
            setFollowUpDialogOpen(false); // Close dialog on success
            setSelectedInfractionForFollowUp(null);
            // Data updates handled by the store automatically
       }
        // Error handling is done within the store action (toast)
   };

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
         <p className="text-destructive mb-4">{detailError}</p>
         <Button variant="outline" onClick={() => router.back()}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Volver
         </Button>
      </div>
    );
  }

  if (!selectedStudentData.student) {
    // This might happen briefly or if fetch failed silently
    return (
         <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
             <p className="text-muted-foreground mb-4">No se encontró información del estudiante.</p>
             <Button variant="outline" onClick={() => router.push('/dashboard/students')}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Buscar Estudiantes
             </Button>
         </div>
    );
  }

  // Sort infractions by date, newest first
  const sortedInfractions = [...selectedStudentData.infractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
         <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la búsqueda
         </Button>

        {/* Student Detail Card */}
        <StudentDetailCard
            student={selectedStudentData.student}
            infractions={sortedInfractions} // Pass sorted infractions
            followUps={selectedStudentData.followUps}
            onAddFollowUpClick={handleOpenFollowUpDialog} // Pass handler to open dialog
        />

        {/* Follow Up Dialog */}
        {selectedInfractionForFollowUp && selectedStudentData.student && (
             <FollowUpDialog
                isOpen={isFollowUpDialogOpen}
                onOpenChange={setFollowUpDialogOpen}
                infraction={selectedInfractionForFollowUp}
                studentName={selectedStudentData.student.name} // Pass student name for context/author
                existingFollowUps={selectedStudentData.followUps.filter(
                    (f) => f.infractionId === selectedInfractionForFollowUp.id
                )}
                onSubmit={handleAddFollowUp}
                isSubmitting={detailLoading} // Use detailLoading to indicate submission process
            />
        )}
    </div>
  );
}