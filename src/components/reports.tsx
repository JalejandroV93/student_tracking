import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Student, Infraction } from "@/types/dashboard"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { HeatMapGrid } from "@/components/heat-map-grid"

interface ReportsProps {
  students: Student[]
  infractions: Infraction[]
}

export function Reports({ students, infractions }: ReportsProps) {
  // Process data for quarterly report
  const getQuarterlyData = () => {
    const quarters = [
      { name: "Q1", months: [0, 1, 2] },
      { name: "Q2", months: [3, 4, 5] },
      { name: "Q3", months: [6, 7, 8] },
      { name: "Q4", months: [9, 10, 11] },
    ]

    const currentYear = new Date().getFullYear()

    return quarters.map((quarter) => {
      // Filter infractions for this quarter and year
      const quarterInfractions = infractions.filter((inf) => {
        const date = new Date(inf.date)
        return date.getFullYear() === currentYear && quarter.months.includes(date.getMonth())
      })

      // Count by type
      const typeI = quarterInfractions.filter((inf) => inf.type === "I").length
      const typeII = quarterInfractions.filter((inf) => inf.type === "II").length
      const typeIII = quarterInfractions.filter((inf) => inf.type === "III").length

      return {
        name: quarter.name,
        "Tipo I": typeI,
        "Tipo II": typeII,
        "Tipo III": typeIII,
        total: typeI + typeII + typeIII,
      }
    })
  }

  // Process data for heat map
  const getHeatMapData = () => {
    // Get top 10 students with most infractions
    const studentInfractionCounts = students.map((student) => {
      const studentInfractions = infractions.filter((inf) => inf.studentId === student.id)
      const typeICount = studentInfractions.filter((inf) => inf.type === "I").length
      const typeIICount = studentInfractions.filter((inf) => inf.type === "II").length
      const typeIIICount = studentInfractions.filter((inf) => inf.type === "III").length
      const totalCount = typeICount + typeIICount + typeIIICount

      return {
        id: student.id,
        name: student.name,
        section: student.grado,
        typeICount,
        typeIICount,
        typeIIICount,
        totalCount,
      }
    })

    // Sort by total count (descending) and take top 10
    return studentInfractionCounts.sort((a, b) => b.totalCount - a.totalCount).slice(0, 10)
  }

  const quarterlyData = getQuarterlyData()
  const heatMapData = getHeatMapData()

  return (
    <Tabs defaultValue="quarterly" className="space-y-6">
      <TabsList>
        <TabsTrigger value="quarterly">Reporte Trimestral</TabsTrigger>
        <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
      </TabsList>

      <TabsContent value="quarterly">
        <Card>
          <CardHeader>
            <CardTitle>Faltas por Trimestre</CardTitle>
            <CardDescription>Distribución de faltas por tipo en cada trimestre del año actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Tipo I" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Tipo II" stackId="a" fill="#eab308" />
                  <Bar dataKey="Tipo III" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="heatmap">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Calor - Estudiantes con Más Faltas</CardTitle>
            <CardDescription>Los 10 estudiantes con mayor cantidad de faltas disciplinarias</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatMapGrid data={heatMapData} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

