import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Assume these exist or create simple versions
import { AlertsWidgetSkeleton } from "@/components/alerts/AlertsWidget.skeleton";
import { InfractionTrendsSkeleton } from "@/components/dashboard/InfractionTrends.skeleton";
import { SectionOverviewSkeleton } from "@/components/dashboard/SectionOverview.skeleton";

export function OverviewSkeleton() {
  return (
    <div className="space-y-6 w-full">
      {/* Trimestre Selector Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Main KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-2/3" /> {/* Title */}
              <Skeleton className="h-4 w-4" /> {/* Icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/3 mb-1" /> {/* Main number */}
              <Skeleton className="h-3 w-1/2" /> {/* Sub-text */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Infraction Type Summary Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-l-4 border-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-1/2" /> {/* Title */}
              <Skeleton className="h-5 w-5" /> {/* Icon */}
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/4" /> {/* Main number */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsWidgetSkeleton />
        <InfractionTrendsSkeleton />
      </div>

      {/* Section Summaries Skeleton */}
      <div>
        <Skeleton className="h-6 w-1/3 mb-4" />{" "}
        {/* Title like "Resumen por Sección" */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SectionOverviewSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}




