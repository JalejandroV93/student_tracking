import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        {/* Title is often in the page, skeleton for description */}
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              {/* Estudiante */}
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              {/* Grado */}
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              {/* Fecha Falta */}
              <TableHead className="text-center">
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>
              {/* Seguimientos */}
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              {/* Estado */}
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              {/* Próximo Seguimiento */}
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
                  <Skeleton className="h-5 w-12 mx-auto rounded-md" />
                </TableCell>
                {/* Badge */}
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </TableCell>
                {/* Badge */}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
                    <div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
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
