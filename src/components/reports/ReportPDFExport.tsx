"use client"

import type { ReportData } from "@/types/reports"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface ReportPDFExportProps {
  data: ReportData
  title?: string
  subtitle?: string
}

export function ReportPDFExport({ data, title = "Reporte", subtitle }: ReportPDFExportProps) {
  const generatePDFContent = () => {
    const formatDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 15mm; 
            color: #333; 
            line-height: 1.3;
            font-size: 9pt;
          }
          .header { 
            margin-bottom: 15px; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 10px; 
          }
          .school-name {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            color: #be1522;
            margin-bottom: 5px;
          }
          .report-title {
            text-align: left;
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .report-subtitle {
            text-align: left;
            font-size: 9pt;
            color: #666;
            margin-bottom: 5px;
          }
          .report-date {
            text-align: right;
            font-size: 8pt;
            color: #888;
          }
          .summary { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 10px; 
            margin-bottom: 20px; 
          }
          .summary-card { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: center; 
            border-radius: 4px; 
          }
          .summary-card h3 { 
            margin: 0 0 6px 0; 
            font-size: 9pt; 
            color: #666; 
          }
          .summary-card .number { 
            font-size: 16pt; 
            font-weight: bold; 
          }
          .section { 
            margin-bottom: 20px; 
            page-break-inside: avoid; 
          }
          .section h2 { 
            color: #2563eb;
            font-size: 10pt;
            border-bottom: 1px solid #ddd; 
            padding-bottom: 4px;
            margin-bottom: 10px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 8px;
            font-size: 8pt;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 5px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            font-size: 8pt;
          }
          .tipo-i { color: #6366f1; }
          .tipo-ii { color: #f59e0b; }
          .tipo-iii { color: #ef4444; }
          .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
            page-break-inside: avoid;
          }
          .chart-section {
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .chart-title {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 12px;
            color: #374151;
            text-align: center;
          }
          .pie-chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 10px 0;
            position: relative;
          }
          .pie-chart {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            position: relative;
          }
          .pie-chart-svg {
            position: absolute;
            width: 160px;
            height: 160px;
            pointer-events: none;
          }
          .pie-label {
            font-size: 10pt;
            font-weight: bold;
            fill: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            text-anchor: middle;
            dominant-baseline: middle;
          }
          .pie-legend {
            margin-top: 12px;
            font-size: 8pt;
          }
          .pie-legend-item {
            display: flex;
            align-items: center;
            margin: 4px 0;
            justify-content: space-between;
          }
          .pie-legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            margin-right: 6px;
            display: inline-block;
          }
          .pie-legend-label {
            flex: 1;
            display: flex;
            align-items: center;
          }
          .pie-legend-value {
            font-weight: bold;
            margin-left: 8px;
          }
          .bar-chart-wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          .visual-bar-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 6px 0;
          }
          .visual-bar {
            height: 18px;
            border-radius: 3px;
            display: flex;
            flex: 1;
            max-width: 400px;
          }
          .visual-bar-segment {
            height: 100%;
            transition: width 0.3s ease;
          }
          .visual-bar-segment.tipo-i-bar {
            background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
          }
          .visual-bar-segment.tipo-ii-bar {
            background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
          }
          .visual-bar-segment.tipo-iii-bar {
            background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
          }
          .visual-label {
            min-width: 90px;
            font-size: 8pt;
            font-weight: 500;
          }
          .visual-value {
            min-width: 35px;
            text-align: right;
            font-weight: bold;
            font-size: 9pt;
          }
          .bar-legend {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 18px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            font-size: 8pt;
          }
          .bar-legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .bar-legend-color {
            width: 14px;
            height: 14px;
            border-radius: 2px;
          }
          .footer {
            display: none;
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 7pt;
            color: #999;
          }
          @media print {
            body { margin: 10mm; }
            .no-print { display: none; }
            .footer { position: fixed; bottom: 10mm; left: 0; right: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">Liceo Taller San Miguel</div>
          <div class="report-title">${title}</div>
          ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ""}
          <div class="report-date">Generado el ${formatDate}</div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Faltas</h3>
            <div class="number">${data.summary.total}</div>
          </div>
          <div class="summary-card">
            <h3>Tipo I</h3>
            <div class="number tipo-i">${data.summary.tipoI}</div>
          </div>
          <div class="summary-card">
            <h3>Tipo II</h3>
            <div class="number tipo-ii">${data.summary.tipoII}</div>
          </div>
          <div class="summary-card">
            <h3>Tipo III</h3>
            <div class="number tipo-iii">${data.summary.tipoIII}</div>
          </div>
        </div>

        ${
          data.summary.total > 0 || data.faltasPorNivel.length > 0
            ? `
        <div class="charts-grid">
          ${
            data.summary.total > 0
              ? `
          <div class="chart-section">
            <div class="chart-title">Distribución de Faltas por Tipo</div>
            <div class="pie-chart-container">
              ${(() => {
                const total = data.summary.total
                const tipoIPercent = ((data.summary.tipoI / total) * 100).toFixed(1)
                const tipoIIPercent = ((data.summary.tipoII / total) * 100).toFixed(1)
                const tipoIIIPercent = ((data.summary.tipoIII / total) * 100).toFixed(1)
                
                // Calculate conic gradient percentages
                const tipoIEnd = (data.summary.tipoI / total) * 100
                const tipoIIEnd = tipoIEnd + (data.summary.tipoII / total) * 100
                
                // Calculate label positions (polar to cartesian)
                const getPosition = (startPercent: number, endPercent: number) => {
                  const midPercent = (startPercent + endPercent) / 2
                  const angle = (midPercent / 100) * 2 * Math.PI - Math.PI / 2
                  const radius = 50 // 60% of 80px radius
                  const x = 80 + radius * Math.cos(angle)
                  const y = 80 + radius * Math.sin(angle)
                  return { x, y }
                }
                
                const pos1 = getPosition(0, tipoIEnd)
                const pos2 = getPosition(tipoIEnd, tipoIIEnd)
                const pos3 = getPosition(tipoIIEnd, 100)
                
                return `
              <div class="pie-chart" style="background: conic-gradient(
                #6366f1 0% ${tipoIEnd}%,
                #f59e0b ${tipoIEnd}% ${tipoIIEnd}%,
                #ef4444 ${tipoIIEnd}% 100%
              );"></div>
              <svg class="pie-chart-svg" viewBox="0 0 160 160">
                ${parseFloat(tipoIPercent) > 5 ? `<text x="${pos1.x}" y="${pos1.y}" class="pie-label">${tipoIPercent}%</text>` : ''}
                ${parseFloat(tipoIIPercent) > 5 ? `<text x="${pos2.x}" y="${pos2.y}" class="pie-label">${tipoIIPercent}%</text>` : ''}
                ${parseFloat(tipoIIIPercent) > 5 ? `<text x="${pos3.x}" y="${pos3.y}" class="pie-label">${tipoIIIPercent}%</text>` : ''}
              </svg>
            </div>
            <div class="pie-legend">
              <div class="pie-legend-item">
                <div class="pie-legend-label">
                  <span class="pie-legend-color" style="background: #6366f1;"></span>
                  Tipo I
                </div>
                <div class="pie-legend-value">${data.summary.tipoI} (${tipoIPercent}%)</div>
              </div>
              <div class="pie-legend-item">
                <div class="pie-legend-label">
                  <span class="pie-legend-color" style="background: #f59e0b;"></span>
                  Tipo II
                </div>
                <div class="pie-legend-value">${data.summary.tipoII} (${tipoIIPercent}%)</div>
              </div>
              <div class="pie-legend-item">
                <div class="pie-legend-label">
                  <span class="pie-legend-color" style="background: #ef4444;"></span>
                  Tipo III
                </div>
                <div class="pie-legend-value">${data.summary.tipoIII} (${tipoIIIPercent}%)</div>
              </div>
            </div>
                `
              })()}
          </div>
              `
              : ""
          }
          
          ${
            data.faltasPorNivel.length > 0
              ? `
          <div class="chart-section">
            <div class="chart-title">Faltas por Nivel Académico</div>
            <div class="pie-chart-container">
              ${(() => {
                const totalNivel = data.faltasPorNivel.reduce((sum, item) => sum + item.total, 0)
                const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]
                
                let gradientStops = ""
                let currentPercent = 0
                const segments: Array<{start: number; end: number; percent: string}> = []
                
                data.faltasPorNivel.forEach((item, index) => {
                  const itemPercent = (item.total / totalNivel) * 100
                  const nextPercent = currentPercent + itemPercent
                  const color = colors[index % colors.length]
                  gradientStops += `${color} ${currentPercent}% ${nextPercent}%${index < data.faltasPorNivel.length - 1 ? "," : ""}`
                  segments.push({
                    start: currentPercent,
                    end: nextPercent,
                    percent: itemPercent.toFixed(1)
                  })
                  currentPercent = nextPercent
                })
                
                // Calculate label positions
                const getPosition = (startPercent: number, endPercent: number) => {
                  const midPercent = (startPercent + endPercent) / 2
                  const angle = (midPercent / 100) * 2 * Math.PI - Math.PI / 2
                  const radius = 50
                  const x = 80 + radius * Math.cos(angle)
                  const y = 80 + radius * Math.sin(angle)
                  return { x, y }
                }
                
                return `
              <div class="pie-chart" style="background: conic-gradient(${gradientStops});"></div>
              <svg class="pie-chart-svg" viewBox="0 0 160 160">
                ${segments.map(seg => {
                  const pos = getPosition(seg.start, seg.end)
                  return parseFloat(seg.percent) > 5 ? `<text x="${pos.x}" y="${pos.y}" class="pie-label">${seg.percent}%</text>` : ''
                }).join('')}
              </svg>
            </div>
            <div class="pie-legend">
              ${data.faltasPorNivel
                .map((item, index) => {
                  const percent = ((item.total / totalNivel) * 100).toFixed(1)
                  const color = colors[index % colors.length]
                  return `
              <div class="pie-legend-item">
                <div class="pie-legend-label">
                  <span class="pie-legend-color" style="background: ${color};"></span>
                  ${item.name}
                </div>
                <div class="pie-legend-value">${item.total} (${percent}%)</div>
              </div>
                  `
                })
                .join("")}
            </div>
                `
              })()}
          </div>
              `
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          data.faltasPorNivel.length > 0
            ? `
        <div class="section">
          <h2>Faltas por Nivel Académico</h2>
          <table>
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Tipo I</th>
                <th>Tipo II</th>
                <th>Tipo III</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.faltasPorNivel
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td class="tipo-i">${item.tipoI}</td>
                  <td class="tipo-ii">${item.tipoII}</td>
                  <td class="tipo-iii">${item.tipoIII}</td>
                  <td><strong>${item.total}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          data.faltasPorGrado.length > 0
            ? `
        <div class="chart-section" style="margin: 15px 0;">
          <div class="chart-title">Top 10 Grados con Más Faltas</div>
          <div class="bar-chart-wrapper">
            ${(() => {
              const topGrados = data.faltasPorGrado.slice(0, 10)
              const maxGrado = Math.max(...topGrados.map((item) => item.total))
              return `
                ${topGrados
                  .map(
                    (item) => {
                      const tipoIWidth = maxGrado > 0 ? (item.tipoI / maxGrado) * 100 : 0
                      const tipoIIWidth = maxGrado > 0 ? (item.tipoII / maxGrado) * 100 : 0
                      const tipoIIIWidth = maxGrado > 0 ? (item.tipoIII / maxGrado) * 100 : 0
                      return `
                <div class="visual-bar-container">
                  <div class="visual-label">${item.name}</div>
                  <div class="visual-bar">
                    ${item.tipoI > 0 ? `<div class="visual-bar-segment tipo-i-bar" style="width: ${tipoIWidth}%"></div>` : ''}
                    ${item.tipoII > 0 ? `<div class="visual-bar-segment tipo-ii-bar" style="width: ${tipoIIWidth}%"></div>` : ''}
                    ${item.tipoIII > 0 ? `<div class="visual-bar-segment tipo-iii-bar" style="width: ${tipoIIIWidth}%"></div>` : ''}
                  </div>
                  <div class="visual-value">${item.total}</div>
                </div>
                      `
                    },
                  )
                  .join("")}
                <div class="bar-legend">
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-i-bar"></div>
                    <span>Tipo I</span>
                  </div>
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-ii-bar"></div>
                    <span>Tipo II</span>
                  </div>
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-iii-bar"></div>
                    <span>Tipo III</span>
                  </div>
                </div>
              `
            })()}
          </div>
        </div>
        `
            : ""
        }

        ${
          data.faltasPorGrado.length > 0
            ? `
        <div class="section">
          <h2>Faltas por Grado (Top 15)</h2>
          <table>
            <thead>
              <tr>
                <th>Grado</th>
                <th>Tipo I</th>
                <th>Tipo II</th>
                <th>Tipo III</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.faltasPorGrado
                .slice(0, 15)
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td class="tipo-i">${item.tipoI}</td>
                  <td class="tipo-ii">${item.tipoII}</td>
                  <td class="tipo-iii">${item.tipoIII}</td>
                  <td><strong>${item.total}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          data.docentesTopFaltas.length > 0
            ? `
        <div class="chart-section" style="margin: 15px 0;">
          <div class="chart-title">Top 10 Docentes - Faltas Registradas</div>
          <div class="bar-chart-wrapper">
            ${(() => {
              const topDocentes = data.docentesTopFaltas.slice(0, 10)
              const maxDocente = Math.max(...topDocentes.map((item) => item.total))
              return `
                ${topDocentes
                  .map(
                    (item) => {
                      const tipoIWidth = maxDocente > 0 ? (item.tipoI / maxDocente) * 100 : 0
                      const tipoIIWidth = maxDocente > 0 ? (item.tipoII / maxDocente) * 100 : 0
                      const tipoIIIWidth = maxDocente > 0 ? (item.tipoIII / maxDocente) * 100 : 0
                      return `
                <div class="visual-bar-container">
                  <div class="visual-label" title="${item.autor}">${item.autor.length > 12 ? item.autor.substring(0, 12) + '...' : item.autor}</div>
                  <div class="visual-bar">
                    ${item.tipoI > 0 ? `<div class="visual-bar-segment tipo-i-bar" style="width: ${tipoIWidth}%"></div>` : ''}
                    ${item.tipoII > 0 ? `<div class="visual-bar-segment tipo-ii-bar" style="width: ${tipoIIWidth}%"></div>` : ''}
                    ${item.tipoIII > 0 ? `<div class="visual-bar-segment tipo-iii-bar" style="width: ${tipoIIIWidth}%"></div>` : ''}
                  </div>
                  <div class="visual-value">${item.total}</div>
                </div>
                      `
                    },
                  )
                  .join("")}
                <div class="bar-legend">
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-i-bar"></div>
                    <span>Tipo I</span>
                  </div>
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-ii-bar"></div>
                    <span>Tipo II</span>
                  </div>
                  <div class="bar-legend-item">
                    <div class="bar-legend-color tipo-iii-bar"></div>
                    <span>Tipo III</span>
                  </div>
                </div>
              `
            })()}
          </div>
        </div>

        <div class="section">
          <h2>Top Docentes - Faltas Registradas</h2>
          <table>
            <thead>
              <tr>
                <th>Docente</th>
                <th>Tipo I</th>
                <th>Tipo II</th>
                <th>Tipo III</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.docentesTopFaltas
                .slice(0, 10)
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.autor}</strong></td>
                  <td class="tipo-i">${item.tipoI}</td>
                  <td class="tipo-ii">${item.tipoII}</td>
                  <td class="tipo-iii">${item.tipoIII}</td>
                  <td><strong>${item.total}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          data.faltasMasRecurrentes.porNivel.length > 0
            ? `
        <div class="section">
          <h2>Faltas Más Recurrentes por Nivel</h2>
          <table>
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Descripción</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${data.faltasMasRecurrentes.porNivel
                .slice(0, 10)
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.nivel}</strong></td>
                  <td>${item.descripcion}</td>
                  <td><strong>${item.cantidad}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          data.faltasMasRecurrentes.porGrado.length > 0
            ? `
        <div class="section">
          <h2>Faltas Más Recurrentes por Grado</h2>
          <table>
            <thead>
              <tr>
                <th>Grado</th>
                <th>Descripción</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${data.faltasMasRecurrentes.porGrado
                .slice(0, 10)
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.grado}</strong></td>
                  <td>${item.descripcion}</td>
                  <td><strong>${item.cantidad}</strong></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>Reporte - ${formatDate}</p>
        </div>
      </body>
      </html>
    `
  }

  const handleExportPDF = () => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast.error("No se pudo abrir la ventana de impresión. Verifique que los pop-ups estén habilitados.")
        return
      }

      printWindow.document.write(generatePDFContent())
      printWindow.document.close()

      printWindow.focus()

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

      toast.success("Preparando reporte para descarga/impresión")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Error al exportar el reporte")
    }
  }

  return (
    <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2 bg-transparent">
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  )
}
