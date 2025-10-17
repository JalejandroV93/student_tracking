"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileBarChart, X, Calendar, Filter, RotateCcw, Sparkles } from "lucide-react"
import type { ReportFilters as ReportFiltersType } from "@/types/reports"
import { useSchoolYears } from "@/hooks/useSchoolYears"
import type { TrimestreOption } from "@/hooks/useTrimestres"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RawDataExport } from "./RawDataExport"

interface ReportFiltersProps {
  filters: ReportFiltersType
  onFiltersChange: (filters: ReportFiltersType) => void
  onGenerateReport: () => void
  onExportPDF?: () => void
  isLoading?: boolean
}

const NIVELES_ACADEMICOS = [
  { value: "Preschool", label: "Preschool", icon: "🎨" },
  { value: "Elementary", label: "Elementary", icon: "📚" },
  { value: "Middle School", label: "Middle School", icon: "🎓" },
  { value: "High School", label: "High School", icon: "🏫" },
]

const TIPOS_FALTA = [
  { value: "Tipo I", label: "Tipo I", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  { value: "Tipo II", label: "Tipo II", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  { value: "Tipo III", label: "Tipo III", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
]

export function ReportFilters({
  filters,
  onFiltersChange,
  onGenerateReport,
  onExportPDF,
  isLoading = false,
}: ReportFiltersProps) {
  const { schoolYears, activeSchoolYear } = useSchoolYears()
  const [trimestres, setTrimestres] = useState<TrimestreOption[]>([])
  const [loadingTrimestres, setLoadingTrimestres] = useState(false)

  const [localFilters, setLocalFilters] = useState<ReportFiltersType>(filters)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (filters.startDate && filters.endDate) {
      return {
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      }
    }
    return undefined
  })

  useEffect(() => {
    setLocalFilters(filters)
    if (filters.startDate && filters.endDate) {
      setDateRange({
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      })
    } else {
      setDateRange(undefined)
    }
  }, [filters])

  // Load trimestres when school year changes
  useEffect(() => {
    const loadTrimestres = async () => {
      const schoolYearId = localFilters.schoolYearId || activeSchoolYear?.id?.toString()
      if (!schoolYearId) {
        setTrimestres([])
        return
      }

      setLoadingTrimestres(true)
      try {
        const response = await fetch("/api/v1/trimestres")
        if (response.ok) {
          const data = await response.json()
          const allTrimestres = data.trimestres || []
          const filteredTrimestres = allTrimestres.filter(
            (trimestre: TrimestreOption) => trimestre.schoolYearId === Number.parseInt(schoolYearId),
          )
          setTrimestres(filteredTrimestres)
        } else {
          console.error("Error loading trimestres")
          setTrimestres([])
        }
      } catch (error) {
        console.error("Error loading trimestres:", error)
        setTrimestres([])
      } finally {
        setLoadingTrimestres(false)
      }
    }

    loadTrimestres()
  }, [localFilters.schoolYearId, activeSchoolYear?.id])

  const handleFilterChange = (key: keyof ReportFiltersType, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value }

    // If school year changes, reset trimestre
    if (key === "schoolYearId") {
      newFilters.trimestre = undefined
    }

    setLocalFilters(newFilters)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)

    const newFilters = { ...localFilters }
    if (range?.from) {
      newFilters.startDate = range.from.toISOString().split("T")[0]
    } else {
      newFilters.startDate = undefined
    }

    if (range?.to) {
      newFilters.endDate = range.to.toISOString().split("T")[0]
    } else {
      newFilters.endDate = undefined
    }

    // Clear trimestre when dates are set
    if (range?.from || range?.to) {
      newFilters.trimestre = undefined
    }

    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onGenerateReport()
  }

  const handleResetFilters = () => {
    const resetFilters: ReportFiltersType = {
      schoolYearId: activeSchoolYear?.id.toString(),
    }
    setLocalFilters(resetFilters)
    setDateRange(undefined)
    onFiltersChange(resetFilters)
    onGenerateReport()
  }

  const clearDateRange = () => {
    setDateRange(undefined)
    const newFilters = {
      ...localFilters,
      startDate: undefined,
      endDate: undefined,
    }
    setLocalFilters(newFilters)
  }

  const setTodayFilter = () => {
    const today = new Date()
    setDateRange({ from: today, to: today })
    const todayStr = today.toISOString().split("T")[0]
    const newFilters = {
      ...localFilters,
      startDate: todayStr,
      endDate: todayStr,
      trimestre: undefined,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    onGenerateReport()
  }

  const setCurrentMonthFilter = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setDateRange({ from: startOfMonth, to: endOfMonth })

    const newFilters = {
      ...localFilters,
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
      trimestre: undefined,
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
    onGenerateReport()
  }

  const activeFilterCount = [
    localFilters.startDate,
    localFilters.endDate,
    localFilters.trimestre,
    localFilters.nivel,
    localFilters.tipoFalta,
  ].filter(Boolean).length

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span>Filtros de Reporte</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} {activeFilterCount === 1 ? "filtro" : "filtros"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-balance">
              Configura los parámetros para generar reportes personalizados de faltas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Label className="text-sm font-medium">Filtros Rápidos</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={setTodayFilter}
              disabled={isLoading}
              className="gap-2 transition-all hover:scale-105 bg-transparent"
              aria-label="Filtrar por hoy"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Hoy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setCurrentMonthFilter}
              disabled={isLoading}
              className="gap-2 transition-all hover:scale-105 bg-transparent"
              aria-label="Filtrar por este mes"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Este Mes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={isLoading}
              className="gap-2 text-muted-foreground transition-all hover:scale-105 bg-transparent"
              aria-label="Resetear todos los filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Resetear
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label className="text-sm font-medium">Parámetros de Filtrado</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* School Year */}
            <div className="space-y-2">
              <Label htmlFor="school-year-select" className="text-sm">
                Año Escolar <span className="text-destructive">*</span>
              </Label>
              <Select
                value={localFilters.schoolYearId}
                onValueChange={(value) => handleFilterChange("schoolYearId", value)}
                disabled={isLoading}
              >
                <SelectTrigger id="school-year-select" className="w-full">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {schoolYears.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trimestre */}
            <div className="space-y-2">
              <Label htmlFor="trimestre-select" className="text-sm">
                Trimestre
              </Label>
              <Select
                value={localFilters.trimestre}
                onValueChange={(value) => handleFilterChange("trimestre", value === "all" ? undefined : value)}
                disabled={loadingTrimestres || isLoading}
              >
                <SelectTrigger id="trimestre-select" className="w-full">
                  <SelectValue placeholder={loadingTrimestres ? "Cargando..." : "Todos los trimestres"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los trimestres</SelectItem>
                  {trimestres &&
                    trimestres.map((trimestre) => (
                      <SelectItem key={trimestre.id} value={trimestre.name}>
                        {trimestre.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nivel Académico */}
            <div className="space-y-2">
              <Label htmlFor="nivel-select" className="text-sm">
                Nivel Académico
              </Label>
              <Select
                value={localFilters.nivel}
                onValueChange={(value) => handleFilterChange("nivel", value === "all" ? undefined : value)}
                disabled={isLoading}
              >
                <SelectTrigger id="nivel-select" className="w-full">
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  {NIVELES_ACADEMICOS.map((nivel) => (
                    <SelectItem key={nivel.value} value={nivel.value}>
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true">{nivel.icon}</span>
                        {nivel.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Falta */}
            <div className="space-y-2">
              <Label htmlFor="tipo-falta-select" className="text-sm">
                Tipo de Falta
              </Label>
              <Select
                value={localFilters.tipoFalta}
                onValueChange={(value) => handleFilterChange("tipoFalta", value === "all" ? undefined : value)}
                disabled={isLoading}
              >
                <SelectTrigger id="tipo-falta-select" className="w-full">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {TIPOS_FALTA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="date-range-picker" className="text-sm">
                  Rango de Fechas <span className="text-xs text-muted-foreground">(Opcional)</span>
                </Label>
                {dateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="h-auto p-1 text-xs hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Limpiar rango de fechas"
                  >
                    <X className="h-3 w-3 mr-1" aria-hidden="true" />
                    Limpiar
                  </Button>
                )}
              </div>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Seleccionar rango de fechas (opcional)"
                //disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Filtros Activos
              </Label>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Filtros activos">
                {localFilters.startDate && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5" role="listitem">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    Desde: {new Date(localFilters.startDate).toLocaleDateString("es-ES")}
                  </Badge>
                )}
                {localFilters.endDate && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5" role="listitem">
                    <Calendar className="h-3 w-3" aria-hidden="true" />
                    Hasta: {new Date(localFilters.endDate).toLocaleDateString("es-ES")}
                  </Badge>
                )}
                {localFilters.trimestre && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    role="listitem"
                  >
                    {localFilters.trimestre}
                  </Badge>
                )}
                {localFilters.nivel && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    role="listitem"
                  >
                    {NIVELES_ACADEMICOS.find((n) => n.value === localFilters.nivel)?.icon} {localFilters.nivel}
                  </Badge>
                )}
                {localFilters.tipoFalta && (
                  <Badge
                    variant="secondary"
                    className={`gap-1.5 px-3 py-1.5 ${TIPOS_FALTA.find((t) => t.value === localFilters.tipoFalta)?.color}`}
                    role="listitem"
                  >
                    {localFilters.tipoFalta}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex flex-wrap gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="gap-2 font-medium shadow-sm transition-all hover:scale-105"
            size="lg"
            aria-label="Generar reporte con los filtros seleccionados"
          >
            {isLoading ? (
              <>
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                Generando...
              </>
            ) : (
              <>
                <FileBarChart className="h-4 w-4" aria-hidden="true" />
                Generar Reporte
              </>
            )}
          </Button>

          {onExportPDF && (
            <Button
              variant="outline"
              onClick={onExportPDF}
              disabled={isLoading}
              className="gap-2 font-medium shadow-sm transition-all hover:scale-105 bg-transparent"
              size="lg"
              aria-label="Exportar reporte a PDF"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar PDF
            </Button>
          )}
</div>
          <RawDataExport 
            filters={localFilters} 
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
