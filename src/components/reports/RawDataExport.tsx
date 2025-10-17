"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ReportFilters } from "@/types/reports"

interface RawDataExportProps {
  filters: ReportFilters
  disabled?: boolean
}

interface RawDataRecord {
  nivel_academico: string
  tipo_falta: string
  codigo_estudiante: string
  nombre_estudiante: string
  grado: string
  numero_falta: number
  descripcion: string
  autor: string
  fecha: string
  trimestre: string
}

export function RawDataExport({ filters, disabled = false }: RawDataExportProps) {
  const [isLoading, setIsLoading] = useState(false)

  const downloadCSV = (data: RawDataRecord[], filename: string) => {
    // Define CSV headers
    const headers = [
      'Nivel Académico',
      'Tipo de Falta',
      'Código Estudiante',
      'Nombre Estudiante',
      'Grado',
      'Número de Falta',
      'Descripción',
      'Autor',
      'Fecha',
      'Trimestre'
    ]

    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.nivel_academico || ''}"`,
        `"${row.tipo_falta || ''}"`,
        `"${row.codigo_estudiante || ''}"`,
        `"${row.nombre_estudiante || ''}"`,
        `"${row.grado || ''}"`,
        `"${row.numero_falta || ''}"`,
        `"${row.descripcion || ''}"`,
        `"${row.autor || ''}"`,
        `"${row.fecha || ''}"`,
        `"${row.trimestre || ''}"`
      ].join(','))
    ].join('\n')

    // Add UTF-8 BOM to ensure proper encoding
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent

    // Create and download file with proper UTF-8 encoding
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsLoading(true)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/v1/reports/raw-data?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Error al obtener los datos")
      }

      const data: RawDataRecord[] = await response.json()

      if (data.length === 0) {
        toast.warning("No hay datos para exportar", {
          description: "Verifica los filtros aplicados",
        })
        return
      }

      // Generate filename based on filters
      const now = new Date()
      const timestamp = now.toISOString().split('T')[0]
      
      let filename = `faltas_datos_crudo_${timestamp}`
      
      if (filters.startDate && filters.endDate) {
        filename += `_${filters.startDate}_${filters.endDate}`
      } else if (filters.trimestre) {
        filename += `_${filters.trimestre.replace(/\s+/g, '_')}`
      }
      
      if (filters.nivel) {
        filename += `_${filters.nivel.replace(/\s+/g, '_')}`
      }
      
      if (filters.tipoFalta) {
        filename += `_${filters.tipoFalta.replace(/\s+/g, '_')}`
      }
      
      filename += '.csv'

      downloadCSV(data, filename)

      toast.success("Datos exportados exitosamente", {
        description: `Se descargaron ${data.length} registros`,
      })
    } catch (error) {
      console.error("Error exporting raw data:", error)
      toast.error("Error al exportar datos", {
        description: "Intenta nuevamente o verifica tu conexión",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleExport} 
      disabled={disabled || isLoading}
      variant="outline"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isLoading ? "Exportando..." : "Exportar Datos"}
      <Download className="h-4 w-4" />
    </Button>
  )
}