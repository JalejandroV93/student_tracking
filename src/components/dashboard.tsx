// src/components/dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard-content";
import useDashboardStore from "@/lib/store";
import { toast } from "sonner";

export default function Dashboard() {
  const {
    students,
    infractions,
    followUps,
    addFollowUp,
    alertSettings,
    updateAlertSettings,
    getStudentAlertStatus,
    fetchData,
    loading,
    error,
    typeICounts,
    typeIICounts,
    typeIIICounts,
  } = useDashboardStore();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>("overview");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const studentsWithAlerts = students.filter(
      (student) => getStudentAlertStatus(student.id) !== null
    );

    if (studentsWithAlerts.length > 0) {
      toast(
        "Hay " + studentsWithAlerts.length + " estudiantes con alertas activas",
        {
          description: "Revisa la sección de alertas para más detalles",
        }
      );
    }
  }, [students, getStudentAlertStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <DashboardContent
          activePage={activePage}
          students={students}
          infractions={infractions}
          followUps={followUps}
          addFollowUp={addFollowUp}
          typeICounts={typeICounts}
          typeIICounts={typeIICounts}
          typeIIICounts={typeIIICounts}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          alertSettings={alertSettings}
          updateAlertSettings={updateAlertSettings}
          getStudentAlertStatus={getStudentAlertStatus}
        />
      </div>
    </SidebarProvider>
  );
}
