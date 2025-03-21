import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HeatMapData {
  id: string
  name: string
  section: string
  typeICount: number
  typeIICount: number
  typeIIICount: number
  totalCount: number
}

interface HeatMapGridProps {
  data: HeatMapData[]
}

export function HeatMapGrid({ data }: HeatMapGridProps) {
  // Find max count for scaling
  const maxCount = Math.max(...data.map((item) => item.totalCount))

  // Function to calculate color intensity based on count
  const getHeatColor = (count: number) => {
    const intensity = Math.min(count / maxCount, 1)
    return `rgba(239, 68, 68, ${intensity * 0.8})`
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>
          <TableHead>Sección</TableHead>
          <TableHead className="text-center">Tipo I</TableHead>
          <TableHead className="text-center">Tipo II</TableHead>
          <TableHead className="text-center">Tipo III</TableHead>
          <TableHead className="text-center">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.section}</TableCell>
            <TableCell className="text-center" style={{ backgroundColor: getHeatColor(item.typeICount) }}>
              {item.typeICount}
            </TableCell>
            <TableCell className="text-center" style={{ backgroundColor: getHeatColor(item.typeIICount) }}>
              {item.typeIICount}
            </TableCell>
            <TableCell className="text-center" style={{ backgroundColor: getHeatColor(item.typeIIICount) }}>
              {item.typeIIICount}
            </TableCell>
            <TableCell className="text-center font-bold" style={{ backgroundColor: getHeatColor(item.totalCount) }}>
              {item.totalCount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

