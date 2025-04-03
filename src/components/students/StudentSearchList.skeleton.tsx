import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function StudentSearchListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-10 w-full" /> {/* Search Input */}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] border rounded-md">
          <div className="divide-y">
            {Array.from({ length: 10 }).map(
              (
                _,
                index // Repeat for list items
              ) => (
                <div key={index} className="px-4 py-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" /> {/* Name */}
                  <Skeleton className="h-4 w-1/2" /> {/* Details */}
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
