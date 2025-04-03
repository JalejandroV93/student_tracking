import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" /> {/* Title */}
        <Skeleton className="h-4 w-full mt-2" /> {/* Description Line 1 */}
        <Skeleton className="h-4 w-4/5 mt-1" /> {/* Description Line 2 */}
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Global Thresholds Skeleton */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Skeleton className="h-5 w-1/3" /> {/* Heading */}
          <Skeleton className="h-4 w-full" /> {/* Description */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-3 w-2/3" /> {/* Description */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
              <Skeleton className="h-3 w-2/3" /> {/* Description */}
            </div>
          </div>
        </div>

        {/* Section Specific Thresholds Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-5 w-1/3" /> {/* Heading */}
          <Skeleton className="h-4 w-full" /> {/* Description */}
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map(
              (
                _,
                index // Repeat for sections
              ) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-muted/30"
                >
                  <Skeleton className="h-4 w-1/2" /> {/* Section Name */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-3/4" /> {/* Label */}
                      <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-3/4" /> {/* Label */}
                      <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" /> {/* Button */}
        </div>
      </CardContent>
    </Card>
  );
}
