import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, FileWarning } from "lucide-react"
import type { Student, Infraction } from "@/types/dashboard"
import type { AlertStatus } from "@/lib/utils"
import { AlertsWidget } from "@/components/alerts-widget"
import { InfractionTrends } from "@/components/infraction-trends"
import { SectionOverview } from "@/components/section-overview"

interface OverviewProps {
  typeICounts: number
  typeIICounts: number
  typeIIICounts: number
  students: Student[]
  infractions: Infraction[]
  getStudentAlertStatus: (studentId: string) => AlertStatus | null
  onSelectStudent: (studentId: string) => void
}

export function Overview({
  typeICounts,
  typeIICounts,
  typeIIICounts,
  students,
  infractions,
  getStudentAlertStatus,
  onSelectStudent,
}: OverviewProps) {
  // Get students with alerts
  const studentsWithAlerts = students
    .map((student) => {
      const alertStatus = getStudentAlertStatus(student.id)
      return {
        ...student,
        alertStatus,
      }
    })
    .filter((student) => student.alertStatus !== null)

  // Agrupar estudiantes por sección
  const sectionMap: Record<string, string[]> = {
    Preescolar: ["Preescolar"],
    Primaria: ["Primaria 5A", "Primaria 5B"],
    Secundaria: ["Secundaria 1A", "Secundaria 1B", "Secundaria 2A"],
    Preparatoria: ["Preparatoria"],
  }

  // Calcular estadísticas por sección
  const sectionStats = Object.entries(sectionMap).map(([sectionName, sectionValues]) => {
    // Filtrar estudiantes por sección
    const sectionStudents = students.filter((student) => sectionValues.includes(student.section))

    // Filtrar infracciones por estudiantes de la sección
    const sectionInfractions = infractions.filter((inf) =>
      sectionStudents.some((student) => student.id === inf.studentId),
    )

    // Contar infracciones por tipo
    const typeI = sectionInfractions.filter((inf) => inf.type === "I").length
    const typeII = sectionInfractions.filter((inf) => inf.type === "II").length
    const typeIII = sectionInfractions.filter((inf) => inf.type === "III").length

    // Contar alertas
    const alertsCount = sectionStudents.filter((student) => getStudentAlertStatus(student.id) !== null).length

    return {
      name: sectionName,
      studentCount: sectionStudents.length,
      typeI,
      typeII,
      typeIII,
      total: typeI + typeII + typeIII,
      alertsCount,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo I</CardTitle>
            <FileWarning className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">Faltas leves registradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo II</CardTitle>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeIICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">Faltas moderadas con seguimiento</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold">Faltas Tipo III</CardTitle>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{typeIIICounts}</div>
            <p className="text-sm text-muted-foreground mt-1">Faltas graves registradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AlertsWidget studentsWithAlerts={studentsWithAlerts} onSelectStudent={onSelectStudent} />

        <InfractionTrends infractions={infractions} />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Resumen por Secciones</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {sectionStats.map((section) => (
          <SectionOverview key={section.name} section={section} />
        ))}
      </div>
    </div>
  )
}

