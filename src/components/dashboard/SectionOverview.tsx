import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { School } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { NumberTicker } from "@/components/magicui/number-ticker"

interface SectionStats {
  name: string
  studentCount: number
  totalStudentsInSection: number // Total de estudiantes en la sección (no solo los que tienen infracciones)
  typeI: number
  typeII: number
  typeIII: number
  total: number
  alertsCount: number
}

interface SectionOverviewProps {
  section: SectionStats
}

export function SectionOverview({ section }: SectionOverviewProps) {
  // Calcular el porcentaje de cada tipo de falta
  const totalInfractions = section.total || 1 // Evitar división por cero
  const typeIPercent = Math.round((section.typeI / totalInfractions) * 100)
  const typeIIPercent = Math.round((section.typeII / totalInfractions) * 100)
  const typeIIIPercent = Math.round((section.typeIII / totalInfractions) * 100)

  // Determinar el color de la tarjeta basado en la sección
  const getSectionColor = (name: string): string => {
    switch (name) {
      case "Preschool":
        return "border-purple-500"
      case "Elementary":
        return "border-green-500"
      case "Middle School":
        return "border-blue-500"
      case "High School":
        return "border-orange-500"
      default:
        return "border-gray-500"
    }
  }

  const borderColor = getSectionColor(section.name)

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold">{section.name}</CardTitle>
          <CardDescription>{section.totalStudentsInSection} estudiantes</CardDescription>
        </div>
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 h-12 w-12">
          <School className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total de faltas:</span>
          <NumberTicker
            value={section.total}
            startValue={section.total / 2}
            className="whitespace-pre-wrap text-lg font-medium tracking-tighter text-black dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Tipo I</span>
            <span className="font-medium">
              {section.typeI} ({typeIPercent}%)
            </span>
          </div>
          <Progress value={typeIPercent} className="h-2 bg-muted" />

          <div className="flex justify-between text-xs">
            <span>Tipo II</span>
            <span className="font-medium">
              {section.typeII} ({typeIIPercent}%)
            </span>
          </div>
          <Progress value={typeIIPercent} className="h-2 bg-muted" />

          <div className="flex justify-between text-xs">
            <span>Tipo III</span>
            <span className="font-medium">
              {section.typeIII} ({typeIIIPercent}%)
            </span>
          </div>
          <Progress value={typeIIIPercent} className="h-2 bg-muted" />
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium">Alertas activas:</span>
          <span className="text-lg font-bold text-amber-600">{section.alertsCount}</span>
        </div>
      </CardContent>
    </Card>
  )
}
