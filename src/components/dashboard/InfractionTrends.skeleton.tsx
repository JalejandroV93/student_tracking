// src/components/dashboard/InfractionTrends.skeleton.tsx (Simplified Example)
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InfractionTrendsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" /> {/* Chart Area */}
      </CardContent>
    </Card>
  );
}
