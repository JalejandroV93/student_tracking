// src/components/dashboard/SectionOverview.skeleton.tsx (Simplified Example)
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionOverviewSkeleton() {
  return (
    <Card className="border-l-4 border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16 mt-1" />
        </div>
        <Skeleton className="h-8 w-8" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-1/5" />
        </div>
      </CardContent>
    </Card>
  );
}
