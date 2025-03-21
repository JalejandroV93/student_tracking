// src/components/dashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
// import { useDashboardData } from "@/hooks/use-dashboard-data"  // REMOVE THIS
import useDashboardStore from "@/lib/store" // Import Zustand store
import { toast } from "@/hooks/use-toast"


export default function Dashboard() {
  // const { ... } = useDashboardData()  // REMOVE THIS
  const {
    students,
    infractions,
    followUps,
    addFollowUp,
    alertSettings,
    updateAlertSettings,
    getStudentAlertStatus,
    fetchData, // Add this
    loading, // Add
    error, // Add

  } = useDashboardStore() // Use Zustand store

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<string>("overview")


  useEffect(() => {
      fetchData();
  }, [fetchData]);

  useEffect(() => {
    const studentsWithAlerts = students.filter(student => getStudentAlertStatus(student.id) !== null);

    if (studentsWithAlerts.length > 0) {
        toast({
            title: "Alertas Activas",
            description: `Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`,
        });
    }

  }, [students, getStudentAlertStatus]); // Run when students or getStudentAlertStatus change

   // Show loading indicator
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Show error message
    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

      // Show toast notifications for students with alerts on initial load.
    


  // Calculate type counts here, using useMemo to prevent unnecessary recalculations
  const typeICounts =  infractions.filter((inf) => inf.type === "I").length;
  const typeIICounts = infractions.filter((inf) => inf.type === "II").length;
  const typeIIICounts = infractions.filter((inf) => inf.type === "III").length;


  // Función para manejar la navegación entre páginas
  const handlePageChange = (page: string) => {
    setActivePage(page)

    // Si cambiamos de página, limpiamos el estudiante seleccionado
    if (!page.startsWith("student-history")) {
      setSelectedStudent(null)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar activePage={activePage} setActivePage={handlePageChange} />
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
  )
}