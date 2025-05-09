import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface StudentSearchListSkeletonProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StudentSearchListSkeleton({
  searchQuery,
  onSearchChange,
}: StudentSearchListSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o ID..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar estudiante"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(700px_-_1rem)] border rounded-md">
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="px-4 py-3 space-y-2">
                <Skeleton className="h-5 w-3/4" /> {/* Name */}
                <Skeleton className="h-4 w-1/2" /> {/* Details */}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
