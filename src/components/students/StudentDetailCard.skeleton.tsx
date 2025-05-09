import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StudentDetailCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-2xl">
            <Skeleton className="h-8 w-64" /> {/* Student name */}
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72 mt-2" /> {/* Student details */}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-3 mt-2">Historial de Faltas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Num.</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Seguimientos (Tipo II)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-20" /> {/* Date */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />{" "}
                  {/* Type badge */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-8" /> {/* Number */}
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[180px]" /> {/* Description */}
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton className="h-5 w-12 rounded-full" />{" "}
                      {/* Follow-up count */}
                      <Skeleton className="h-5 w-20 rounded-full" />{" "}
                      {/* Status badge */}
                    </div>
                    <Skeleton className="h-16 w-full rounded-md" />{" "}
                    {/* Follow-up details */}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />{" "}
                  {/* Status badge */}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />{" "}
                    {/* Action button */}
                    <Skeleton className="h-8 w-8 rounded-md" />{" "}
                    {/* Action button */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
