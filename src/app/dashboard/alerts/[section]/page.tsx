"use client";

    import { AlertsList } from "@/components/alerts-list";
    import useDashboardStore from "@/lib/store";
    import { SectionSelector } from "@/components/section-selector";
    import { useParams } from 'next/navigation';


     // Definir las secciones educativas
    

    export default function AlertsSectionPage() {
    const params = useParams();
    const { section } = params;
    const { students } = useDashboardStore();

    // Function to handle student selection
    const handleSelectStudent = (studentId: string) => {
        // Navigate to the student's details page
        window.location.href = `/dashboard/students/${studentId}`;
    };

     // Filtrar estudiantes por sección
    const filteredStudents = section
    ? students.filter((student) => {
        // Mapear las secciones a los valores de la propiedad section
        const sectionMap: Record<string, string[]> = {
          preschool: ["Preescolar"],
          elementary: ["Primaria 5A", "Primaria 5B"],
          middle: ["Secundaria 1A", "Secundaria 1B", "Secundaria 2A"],
          high: ["Preparatoria"],
        }

        return sectionMap[section]?.includes(student.section)
      })
    : students;


     // Determinar el título de la página basado en la sección actual
    const getSectionTitle = (section: string | null): string => {
        if (!section) return "Todas las secciones"

        const sectionTitles: Record<string, string> = {
        preschool: "Preescolar",
        elementary: "Primaria",
        middle: "Secundaria",
        high: "Preparatoria",
        }

        return sectionTitles[section] || "Todas las secciones"
    }

    const sectionTitle = getSectionTitle(section);

    return (
        <div className="container py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
              {section !== null && <SectionSelector currentSection={section} baseRoute="alerts" />}
            </div>

            <div className="text-sm text-muted-foreground">
              {section ? `Mostrando alertas para ${sectionTitle}` : "Mostrando alertas para todas las secciones"}
            </div>

            <AlertsList
                students={filteredStudents}
                onSelectStudent={handleSelectStudent}
            />
        </div>
    );
    }