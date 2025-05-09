import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { School } from "lucide-react";

export function SectionOverviewSkeleton() {
  return (
    <Card className="border-l-4 border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <Skeleton className="h-6 w-24" />
          <CardDescription>
            <Skeleton className="h-4 w-16 mt-1" />
          </CardDescription>
        </div>
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 h-12 w-12">
          <School className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total de faltas:</span>
          <Skeleton className="h-6 w-10" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Tipo I</span>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />

          <div className="flex justify-between text-xs">
            <span>Tipo II</span>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />

          <div className="flex justify-between text-xs">
            <span>Tipo III</span>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium">Alertas activas:</span>
          <Skeleton className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
