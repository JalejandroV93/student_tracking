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

export function AlertsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-full mt-2" /> {/* Description */}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>{" "}
              {/* Nombre */}
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>{" "}
              {/* Grado */}
              <TableHead className="text-center">
                <Skeleton className="h-4 w-20 mx-auto" />
              </TableHead>{" "}
              {/* Faltas I */}
              <TableHead className="text-center">
                <Skeleton className="h-4 w-20 mx-auto" />
              </TableHead>{" "}
              {/* Faltas II */}
              <TableHead className="text-center">
                <Skeleton className="h-4 w-24 mx-auto" />
              </TableHead>{" "}
              {/* Nivel Alerta */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map(
              (
                _,
                index // Repeat for multiple rows
              ) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-4/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-8 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-8 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-md" />
                  </TableCell>
                  {/* Badge */}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
