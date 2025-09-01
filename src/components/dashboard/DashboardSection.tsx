// src/components/dashboard/DashboardSection.tsx
"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

// Skeleton por defecto para secciones
function DefaultSectionSkeleton({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSection({
  title,
  icon,
  children,
  className,
  fallback,
}: DashboardSectionProps) {
  const skeleton = fallback || (
    <DefaultSectionSkeleton title={title} icon={icon} />
  );

  return (
    <div className={className}>
      <Suspense fallback={skeleton}>{children}</Suspense>
    </div>
  );
}
