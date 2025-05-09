import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CaseManagementListSkeleton() {
  return (
    <Card>
      <CardHeader>
        {/* Keep the static description visible */}
        <CardDescription>
          Listado de faltas Tipo II y el estado de sus seguimientos requeridos.
          Los casos abiertos y atrasados aparecen primero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Keep all table headers as actual text */}
              <TableHead>Estudiante</TableHead>
              <TableHead>Grado</TableHead>
              <TableHead>Fecha Falta</TableHead>
              <TableHead className="text-center">Seguimientos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Próximo Seguimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-4/5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
                    <div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
