import { SyncAdminSkeleton } from "./sync-skeleton";

interface ContentLayoutSkeletonProps {
  title: string;
}

export function ContentLayoutSkeleton({ title }: ContentLayoutSkeletonProps) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <SyncAdminSkeleton />
    </div>
  );
}
