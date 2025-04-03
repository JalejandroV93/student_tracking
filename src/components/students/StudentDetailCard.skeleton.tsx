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

export function StudentDetailCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-1/2" /> {/* Name */}
        <Skeleton className="h-4 w-3/4 mt-2" /> {/* Details */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-1/4 mb-3 mt-2" /> {/* History Title */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>{" "}
              {/* Fecha */}
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>{" "}
              {/* Tipo */}
              <TableHead>
                <Skeleton className="h-4 w-10" />
              </TableHead>{" "}
              {/* Num */}
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>{" "}
              {/* Desc */}
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>{" "}
              {/* Seguimientos */}
              <TableHead className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>{" "}
              {/* Acciones */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map(
              (
                _,
                index // Repeat for infractions
              ) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </TableCell>
                  {/* Badge */}
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12 rounded-md" /> {/* Badge */}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" /> {/* Button */}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
