// src/components/dashboard/InfractionTrends.skeleton.tsx (Simplified Example)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InfractionTrendsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Faltas</CardTitle>
        <CardDescription>
          Evolución de faltas en los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
