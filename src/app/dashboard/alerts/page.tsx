// src/app/dashboard/alerts/page.tsx
"use client";

import { AlertsList } from "@/components/alerts-list";
import { useRouter } from "next/navigation";

export default function AlertsPage() {
  const router = useRouter();

  // Function to handle student selection
  const handleSelectStudent = (studentId: string) => {
    // Navigate to the student's details page
    router.push(`/dashboard/students/${studentId}`);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando alertas para todas las secciones
      </div>

      <AlertsList onSelectStudent={handleSelectStudent} />
    </div>
  );
}
