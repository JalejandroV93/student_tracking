// src/app/dashboard/page.tsx
import { Suspense } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { OverviewSkeleton } from "@/components/dashboard/Overview.skeleton";

export default function DashboardPage() {
  return (
    <ContentLayout title="Resumen">
      <Suspense fallback={<OverviewSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ContentLayout>
  );
}
