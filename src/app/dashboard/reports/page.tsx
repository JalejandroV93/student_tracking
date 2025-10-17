"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportCharts } from "@/components/reports/ReportCharts"
import { ReportPDFExport } from "@/components/reports/ReportPDFExport"
import { ReportPreview } from "@/components/reports/ReportPreview"
import type { ReportData, ReportFilters as ReportFiltersType } from "@/types/reports"
import { useSchoolYears } from "@/hooks/useSchoolYears"
import { AlertCircle, FileBarChart, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/admin-panel/content-layout"

export default function ReportsPage() {
  const { activeSchoolYear } = useSchoolYears()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [filters, setFilters] = useState<ReportFiltersType>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set initial filters when activeSchoolYear is loaded (but don't generate report automatically)
  useEffect(() => {
    if (activeSchoolYear && !filters.schoolYearId) {
      setFilters({
        schoolYearId: activeSchoolYear.id.toString(),
      })
    }
  }, [activeSchoolYear, filters.schoolYearId])

  const generateReport = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/v1/reports?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Error al generar el reporte")
      }

      const data = await response.json()
      setReportData(data)
      toast.success("Reporte generado exitosamente", {
        description: `Se encontraron ${data.summary.total} faltas registradas`,
      })
    } catch (error) {
      console.error("Error fetching report:", error)
      setError("Error al cargar el reporte. Por favor, intenta nuevamente.")
      toast.error("Error al generar el reporte", {
        description: "Verifica tu conexión e intenta de nuevo",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: ReportFiltersType) => {
    setFilters(newFilters)
  }

  const handleExportPDF = async () => {
    if (!reportData) {
      toast.error("No hay datos para exportar")
      return
    }
    // PDF export is now handled by the ReportPDFExport component
  }

  const getReportTitle = () => {
    if (filters.startDate && filters.endDate) {
      if (filters.startDate === filters.endDate) {
        return `Reporte del ${new Date(filters.startDate).toLocaleDateString("es-ES")}`
      }
      return `Reporte del ${new Date(filters.startDate).toLocaleDateString("es-ES")} al ${new Date(filters.endDate).toLocaleDateString("es-ES")}`
    }

    if (filters.trimestre) {
      return `Reporte ${filters.trimestre}`
    }

    return "Reporte General"
  }

  const getReportSubtitle = () => {
    const parts = []

    if (filters.nivel) {
      parts.push(filters.nivel)
    }

    if (filters.tipoFalta) {
      parts.push(`Faltas ${filters.tipoFalta}`)
    }

    return parts.length > 0 ? parts.join(" • ") : "Todas las secciones y tipos de falta"
  }

  return (
    <ContentLayout title="Reportes">
      <main className="flex flex-col gap-6">
        

        {/* Filters */}
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onGenerateReport={generateReport}
          onExportPDF={handleExportPDF}
          isLoading={isLoading}
        />

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error al Generar Reporte</AlertTitle>
            <AlertDescription className="text-balance">{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Card className="border-2 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <FileBarChart
                    className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold">Generando reporte...</p>
                  <p className="text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Content */}
        {reportData && !isLoading && (
          <div className="space-y-6">
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileBarChart className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <span className="text-balance">{getReportTitle()}</span>
                    </CardTitle>
                    <CardDescription className="text-base text-balance">{getReportSubtitle()}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ReportPreview data={reportData} title={getReportTitle()} subtitle={getReportSubtitle()} />
                    <ReportPDFExport data={reportData} title={getReportTitle()} subtitle={getReportSubtitle()} />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {reportData.summary.total === 0 ? (
              <Card className="border-2 shadow-sm">
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <FileBarChart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No hay datos disponibles</h3>
                      <p className="text-muted-foreground text-balance max-w-md mx-auto">
                        No se encontraron faltas con los filtros seleccionados. Intenta ajustar los parámetros de
                        búsqueda.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Charts */
              <ReportCharts data={reportData} />
            )}
          </div>
        )}

        {!reportData && !isLoading && !error && (
          <Card className="border-2 border-dashed shadow-sm">
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-10 w-10 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Comienza a Generar Reportes</h3>
                  <p className="text-muted-foreground text-balance max-w-md mx-auto">
                    Configura los filtros arriba y haz clic en &quot;Generar Reporte&quot; para visualizar estadísticas detalladas
                    de faltas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </ContentLayout>
  )
}
