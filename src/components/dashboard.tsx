"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { useDashboardData } from "@/hooks/use-dashboard-data"

export default function Dashboard() {
  const {
    students,
    infractions,
    followUps,
    addFollowUp,
    typeICounts,
    typeIICounts,
    typeIIICounts,
    alertSettings,
    updateAlertSettings,
    getStudentAlertStatus,
  } = useDashboardData()

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<string>("overview")

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

