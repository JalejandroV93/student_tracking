"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import type { ReportData } from "@/types/reports"
import { Eye, Calendar, TrendingUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ReportPreviewProps {
  data: ReportData
  title?: string
  subtitle?: string
}

export function ReportPreview({ data, title = "Reporte", subtitle }: ReportPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm transition-all hover:scale-105 bg-transparent">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Vista Previa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl">Vista Previa del Reporte</DialogTitle>
          <DialogDescription>Revisa el contenido antes de exportar a PDF</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-8rem)] pr-4">
          <div className="space-y-6">
            <div className="space-y-4 border-b pb-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-balance" style={{ color: "#be1522" }}>
                  Liceo Taller San Miguel
                </h1>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm">Sistema de Reportes</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-balance">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground text-balance">{subtitle}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Generado el {formatDate}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 rounded-lg p-4 text-center space-y-2 bg-card shadow-sm">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Faltas</h3>
                <div className="text-3xl font-bold">{data.summary.total}</div>
              </div>
              <div className="border-2 border-indigo-200 dark:border-indigo-900 rounded-lg p-4 text-center space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm">
                <h3 className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Tipo I
                </h3>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.summary.tipoI}</div>
              </div>
              <div className="border-2 border-amber-200 dark:border-amber-900 rounded-lg p-4 text-center space-y-2 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
                <h3 className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  Tipo II
                </h3>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.summary.tipoII}</div>
              </div>
              <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-4 text-center space-y-2 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
                <h3 className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Tipo III</h3>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{data.summary.tipoIII}</div>
              </div>
            </div>

            {data.faltasPorNivel.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                  Faltas por Nivel Académico
                </h3>
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border-b p-3 text-left text-sm font-semibold">Nivel</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo I</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo II</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo III</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.faltasPorNivel.map((item, index) => (
                        <tr key={index} className="transition-colors hover:bg-muted/30">
                          <td className="border-b p-3 font-medium">{item.name}</td>
                          <td className="border-b p-3 text-center text-indigo-600 dark:text-indigo-400 font-medium">
                            {item.tipoI}
                          </td>
                          <td className="border-b p-3 text-center text-amber-600 dark:text-amber-400 font-medium">
                            {item.tipoII}
                          </td>
                          <td className="border-b p-3 text-center text-red-600 dark:text-red-400 font-medium">
                            {item.tipoIII}
                          </td>
                          <td className="border-b p-3 text-center font-bold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.faltasPorGrado.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                  Faltas por Grado (Top 10)
                </h3>
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border-b p-3 text-left text-sm font-semibold">Grado</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo I</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo II</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo III</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.faltasPorGrado.slice(0, 10).map((item, index) => (
                        <tr key={index} className="transition-colors hover:bg-muted/30">
                          <td className="border-b p-3 font-medium">{item.name}</td>
                          <td className="border-b p-3 text-center text-indigo-600 dark:text-indigo-400 font-medium">
                            {item.tipoI}
                          </td>
                          <td className="border-b p-3 text-center text-amber-600 dark:text-amber-400 font-medium">
                            {item.tipoII}
                          </td>
                          <td className="border-b p-3 text-center text-red-600 dark:text-red-400 font-medium">
                            {item.tipoIII}
                          </td>
                          <td className="border-b p-3 text-center font-bold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.docentesTopFaltas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                  Top Docentes - Faltas Registradas
                </h3>
                <div className="overflow-x-auto rounded-lg border shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border-b p-3 text-left text-sm font-semibold">Docente</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo I</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo II</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Tipo III</th>
                        <th className="border-b p-3 text-center text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.docentesTopFaltas.slice(0, 8).map((item, index) => (
                        <tr key={index} className="transition-colors hover:bg-muted/30">
                          <td className="border-b p-3 font-medium">{item.autor}</td>
                          <td className="border-b p-3 text-center text-indigo-600 dark:text-indigo-400 font-medium">
                            {item.tipoI}
                          </td>
                          <td className="border-b p-3 text-center text-amber-600 dark:text-amber-400 font-medium">
                            {item.tipoII}
                          </td>
                          <td className="border-b p-3 text-center text-red-600 dark:text-red-400 font-medium">
                            {item.tipoIII}
                          </td>
                          <td className="border-b p-3 text-center font-bold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="text-center text-xs text-muted-foreground border-t pt-4 space-y-1">
              <p className="font-medium">Liceo Taller San Miguel - Sistema de Reportes</p>
              <p>{formatDate}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
