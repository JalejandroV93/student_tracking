// src/app/dashboard/page.tsx
"use client";

import { Overview } from "@/components/dashboard/Overview";
import useDashboardStore from "@/lib/store";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const {
    students,
    infractions,
    getStudentAlertStatus,
    fetchData,
    loading,
    error,
    typeICounts,
    typeIICounts,
    typeIIICounts,
  } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const studentsWithAlerts = students.filter(
      (student) => getStudentAlertStatus(student.id) !== null
    );

    if (studentsWithAlerts.length > 0) {
      toast({
        title: "Alertas Activas",
        description: `Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`,
      });
    }
  }, [students, getStudentAlertStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
      <Overview
        typeICounts={typeICounts}
        typeIICounts={typeIICounts}
        typeIIICounts={typeIIICounts}
        students={students}
        infractions={infractions}
        getStudentAlertStatus={getStudentAlertStatus}
        onSelectStudent={(studentId) => {
          // Navigate to the student details page
          router.push(`/dashboard/students/${studentId}`);
        }}
      />
    </div>
  );
}
