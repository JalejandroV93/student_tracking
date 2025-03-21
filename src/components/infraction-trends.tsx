import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Infraction } from "@/types/dashboard"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface InfractionTrendsProps {
  infractions: Infraction[]
}

export function InfractionTrends({ infractions }: InfractionTrendsProps) {
  // Process data for the chart
  const processData = () => {
    // Group infractions by month
    const groupedByMonth: Record<string, { typeI: number; typeII: number; typeIII: number }> = {}

    // Get last 6 months
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(today.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      groupedByMonth[monthKey] = { typeI: 0, typeII: 0, typeIII: 0 }
    }

    // Count infractions by type and month
    infractions.forEach((infraction) => {
      const date = new Date(infraction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (groupedByMonth[monthKey]) {
        if (infraction.type === "I") groupedByMonth[monthKey].typeI++
        else if (infraction.type === "II") groupedByMonth[monthKey].typeII++
        else if (infraction.type === "III") groupedByMonth[monthKey].typeIII++
      }
    })

    // Convert to array for chart
    return Object.entries(groupedByMonth).map(([month, counts]) => {
      const [year, monthNum] = month.split("-")
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const monthName = monthNames[Number.parseInt(monthNum) - 1]

      return {
        month: `${monthName}`,
        typeI: counts.typeI,
        typeII: counts.typeII,
        typeIII: counts.typeIII,
      }
    })
  }

  const data = processData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Faltas</CardTitle>
        <CardDescription>Evolución de faltas en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="typeI" stroke="#3b82f6" name="Tipo I" />
              <Line type="monotone" dataKey="typeII" stroke="#eab308" name="Tipo II" />
              <Line type="monotone" dataKey="typeIII" stroke="#ef4444" name="Tipo III" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

