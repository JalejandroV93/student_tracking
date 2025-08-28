import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function AlertsWidgetSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Alertas Activas Recientes</CardTitle>
        <CardDescription>Top 5 estudiantes que requieren atención</CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead className="text-center">Nivel</TableHead>
              <TableHead className="text-right">Faltas (Tipo I)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="py-2">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="text-center py-2">
                  <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                </TableCell>
                <TableCell className="text-right py-2">
                  <Skeleton className="h-4 w-6 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
