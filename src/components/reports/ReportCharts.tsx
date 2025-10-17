"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import type { ReportData } from "@/types/reports"
import { TrendingUp, BarChart3, PieChartIcon, Users, GraduationCap, AlertTriangle } from "lucide-react"

interface ReportChartsProps {
  data: ReportData
}

// Updated colors - replacing green with blue/violet tones
const COLORS = {
  tipoI: "#6366f1", // indigo-500
  tipoII: "#f59e0b", // amber-500
  tipoIII: "#ef4444", // red-500
}

const chartConfig = {
  tipoI: {
    label: "Tipo I",
    color: COLORS.tipoI,
  },
  tipoII: {
    label: "Tipo II",
    color: COLORS.tipoII,
  },
  tipoIII: {
    label: "Tipo III",
    color: COLORS.tipoIII,
  },
} satisfies ChartConfig

export function ReportCharts({ data }: ReportChartsProps) {
  // Prepare pie chart data for summary
  const summaryPieData = [
    { name: "Tipo I", value: data.summary.tipoI, fill: COLORS.tipoI },
    { name: "Tipo II", value: data.summary.tipoII, fill: COLORS.tipoII },
    { name: "Tipo III", value: data.summary.tipoIII, fill: COLORS.tipoIII },
  ].filter((item) => item.value > 0)

  // Prepare monthly trend data
  const monthlyTrendData = data.tendenciaMensual.reduce((acc: Array<Record<string, string | number>>, item) => {
    const month = new Date(item.mes).toLocaleDateString("es-ES", { month: "short", year: "numeric" })
    const existing = acc.find((entry) => entry.mes === month)

    if (existing) {
      existing[item.tipo_falta.replace(" ", "")] = Number.parseInt(item.cantidad.toString())
    } else {
      acc.push({
        mes: month,
        [item.tipo_falta.replace(" ", "")]: Number.parseInt(item.cantidad.toString()),
      })
    }

    return acc
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <Card className="border-1 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Faltas</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.summary.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registros totales</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200 shadow-sm transition-all hover:shadow-md dark:border-indigo-900">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Tipo I</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <AlertTriangle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {data.summary.tipoI.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Faltas leves</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 shadow-sm transition-all hover:shadow-md dark:border-amber-900">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Tipo II</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {data.summary.tipoII.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Faltas moderadas</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 shadow-sm transition-all hover:shadow-md dark:border-red-900">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Tipo III</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {data.summary.tipoIII.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Faltas graves</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {summaryPieData.length > 0 && (
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <PieChartIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Distribución de Faltas por Tipo</CardTitle>
                <CardDescription>Análisis proporcional de tipos de falta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summaryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {summaryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.faltasPorNivel.length > 0 && (
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Faltas por Nivel Académico</CardTitle>
                <CardDescription>Distribución de faltas según el nivel educativo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.faltasPorNivel}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="tipoI" stackId="a" fill="var(--color-tipoI)" name="Tipo I" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tipoII" stackId="a" fill="var(--color-tipoII)" name="Tipo II" radius={[0, 0, 0, 0]} />
                  <Bar
                    dataKey="tipoIII"
                    stackId="a"
                    fill="var(--color-tipoIII)"
                    name="Tipo III"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.faltasPorGrado.length > 0 && (
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Faltas por Grado</CardTitle>
                <CardDescription>Top 15 grados con mayor número de faltas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.faltasPorGrado.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="tipoI" stackId="a" fill="var(--color-tipoI)" name="Tipo I" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tipoII" stackId="a" fill="var(--color-tipoII)" name="Tipo II" radius={[0, 0, 0, 0]} />
                  <Bar
                    dataKey="tipoIII"
                    stackId="a"
                    fill="var(--color-tipoIII)"
                    name="Tipo III"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.docentesTopFaltas.length > 0 && (
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Top Docentes - Faltas Registradas</CardTitle>
                <CardDescription>Docentes con mayor cantidad de faltas registradas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.docentesTopFaltas.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="autor" angle={-45} textAnchor="end" height={100} className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="tipoI" stackId="a" fill="var(--color-tipoI)" name="Tipo I" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="tipoII" stackId="a" fill="var(--color-tipoII)" name="Tipo II" radius={[0, 0, 0, 0]} />
                  <Bar
                    dataKey="tipoIII"
                    stackId="a"
                    fill="var(--color-tipoIII)"
                    name="Tipo III"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {monthlyTrendData.length > 0 && (
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Tendencia Mensual</CardTitle>
                <CardDescription>Evolución de faltas a lo largo del tiempo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="TipoI"
                    stroke="var(--color-tipoI)"
                    strokeWidth={2}
                    name="Tipo I"
                    dot={{ fill: "var(--color-tipoI)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="TipoII"
                    stroke="var(--color-tipoII)"
                    strokeWidth={2}
                    name="Tipo II"
                    dot={{ fill: "var(--color-tipoII)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="TipoIII"
                    stroke="var(--color-tipoIII)"
                    strokeWidth={2}
                    name="Tipo III"
                    dot={{ fill: "var(--color-tipoIII)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.faltasMasRecurrentes.porNivel.length > 0 && (
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Faltas Más Recurrentes por Nivel</CardTitle>
                  <CardDescription>Infracciones más frecuentes según nivel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.faltasMasRecurrentes.porNivel.slice(0, 8).map((falta, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-3 p-3 bg-muted/50 rounded-lg border transition-all hover:bg-muted hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-balance">{falta.nivel}</div>
                      <div className="text-xs text-muted-foreground truncate text-pretty" title={falta.descripcion}>
                        {falta.descripcion}
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-lg font-bold text-primary">{falta.cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.faltasMasRecurrentes.porGrado.length > 0 && (
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Faltas Más Recurrentes por Grado</CardTitle>
                  <CardDescription>Infracciones más frecuentes según grado</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.faltasMasRecurrentes.porGrado.slice(0, 8).map((falta, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-3 p-3 bg-muted/50 rounded-lg border transition-all hover:bg-muted hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-balance">{falta.grado}</div>
                      <div className="text-xs text-muted-foreground truncate text-pretty" title={falta.descripcion}>
                        {falta.descripcion}
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-lg font-bold text-primary">{falta.cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  )
}
