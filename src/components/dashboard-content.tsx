"use client";

import { Overview } from "@/components/overview";
import { AlertsList } from "@/components/alerts-list";
import { StudentHistory } from "@/components/student-history";
import { CaseManagement } from "@/components/case-management";
import { Settings } from "@/components/settings";
import type {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";
import type { AlertStatus } from "@/lib/utils";
import { SectionSelector } from "@/components/section-selector";

interface DashboardContentProps {
  activePage: string;
  students: Student[];
  infractions: Infraction[];
  followUps: FollowUp[];
  addFollowUp: (followUp: FollowUp) => void;
  typeICounts: number;
  typeIICounts: number;
  typeIIICounts: number;
  selectedStudent: string | null;
  setSelectedStudent: (studentId: string | null) => void;
  alertSettings: AlertSettings;
  updateAlertSettings: (settings: AlertSettings) => void;
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
}

export function DashboardContent({
  activePage,
  students,
  infractions,
  followUps,
  addFollowUp,
  typeICounts,
  typeIICounts,
  typeIIICounts,
  selectedStudent,
  setSelectedStudent,
  alertSettings,
  updateAlertSettings,
  getStudentAlertStatus,
}: DashboardContentProps) {
  // Extraer la sección del activePage (si existe)
  const getSection = (page: string): string | null => {
    if (page === "overview" || page === "settings") return null;

    const parts = page.split("-");
    if (parts.length < 2) return null;

    const section = parts[parts.length - 1];
    if (
      ["all", "preschool", "elementary", "middle", "high"].includes(section)
    ) {
      return section === "all" ? null : section;
    }

    return null;
  };

  const currentSection = getSection(activePage);

  // Filtrar estudiantes por sección
  const filteredStudents = currentSection
    ? students.filter((student) => {
        // Mapear las secciones a los valores de la propiedad section
        const sectionMap: Record<string, string[]> = {
          preschool: ["Preescolar"],
          elementary: [
            "Primero",
            "Segundo",
            "Tercero",
            "Cuarto",
            "Quinto",
            "Sexto",
          ],
          middle: ["Séptimo", "Octavo", "Noveno"],
          high: ["Décimo", "Undécimo", "Duodécimo"],
        };

        // Verificar si el grado del estudiante comienza con alguno de los valores mapeados
        return sectionMap[currentSection]?.some((grade) =>
          student.grado?.startsWith(grade)
        );
      })
    : students;

  // Filtrar infracciones basadas en los estudiantes filtrados
  const filteredInfractions = currentSection
    ? infractions.filter((inf) =>
        filteredStudents.some((student) => student.id === inf.studentId)
      )
    : infractions;

  // Filtrar seguimientos basados en las infracciones filtradas
  const filteredFollowUps = currentSection
    ? followUps.filter((followUp) =>
        filteredInfractions.some((inf) => inf.id === followUp.infractionId)
      )
    : followUps;

  // Determinar el título de la página basado en la sección actual
  const getSectionTitle = (section: string | null): string => {
    if (!section) return "Todas las secciones";

    const sectionTitles: Record<string, string> = {
      preschool: "Preescolar",
      elementary: "Primaria",
      middle: "Secundaria",
      high: "Preparatoria",
    };

    return sectionTitles[section] || "Todas las secciones";
  };

  const sectionTitle = getSectionTitle(currentSection);

  // Determinar el título de la página basado en activePage
  const getPageTitle = (): string => {
    if (activePage === "overview") return "Panel de Control";
    if (activePage.startsWith("alerts")) return "Alertas";
    if (activePage.startsWith("student-history"))
      return "Historial de Estudiantes";
    if (activePage.startsWith("case-management")) return "Gestión de Casos";
    if (activePage.startsWith("reports")) return "Reportes";
    if (activePage === "settings") return "Configuración";
    return "";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="flex-1 overflow-auto">
      <div className="container py-6">
        {activePage === "overview" ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Panel de Control
            </h1>
            <Overview
              typeICounts={typeICounts}
              typeIICounts={typeIICounts}
              typeIIICounts={typeIIICounts}
              students={students}
              infractions={infractions}
              getStudentAlertStatus={getStudentAlertStatus}
              onSelectStudent={setSelectedStudent}
            />
          </div>
        ) : activePage.startsWith("alerts") ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              {currentSection !== null && (
                <SectionSelector
                  currentSection={currentSection}
                  baseRoute="alerts"
                />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSection
                ? `Mostrando alertas para ${sectionTitle}`
                : "Mostrando alertas para todas las secciones"}
            </div>
            <AlertsList
              students={filteredStudents}
              infractions={filteredInfractions}
              onSelectStudent={setSelectedStudent}
            />
          </div>
        ) : activePage.startsWith("student-history") ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              {currentSection !== null && (
                <SectionSelector
                  currentSection={currentSection}
                  baseRoute="student-history"
                />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSection
                ? `Mostrando historial para ${sectionTitle}`
                : "Mostrando historial para todas las secciones"}
            </div>
            <StudentHistory
              students={filteredStudents}
              infractions={filteredInfractions}
              followUps={filteredFollowUps}
              selectedStudentId={selectedStudent}
              onSelectStudent={setSelectedStudent}
              addFollowUp={addFollowUp}
            />
          </div>
        ) : activePage.startsWith("case-management") ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              {currentSection !== null && (
                <SectionSelector
                  currentSection={currentSection}
                  baseRoute="case-management"
                />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSection
                ? `Mostrando casos para ${sectionTitle}`
                : "Mostrando casos para todas las secciones"}
            </div>
            <CaseManagement
              students={filteredStudents}
              infractions={filteredInfractions}
              followUps={filteredFollowUps}
              onSelectStudent={setSelectedStudent}
            />
          </div>
        ) : activePage.startsWith("reports") ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
              {currentSection !== null && (
                <SectionSelector
                  currentSection={currentSection}
                  baseRoute="reports"
                />
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSection
                ? `Mostrando reportes para ${sectionTitle}`
                : "Mostrando reportes para todas las secciones"}
            </div>
            
          </div>
        ) : activePage === "settings" ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
            <Settings
              alertSettings={alertSettings}
              updateAlertSettings={updateAlertSettings}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
