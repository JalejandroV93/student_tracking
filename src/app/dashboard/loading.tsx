// src/app/dashboard/loading.tsx
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardLoadingSkeleton";

export default function DashboardLoading() {
  return (
    <ContentLayout title="Resumen">
      <DashboardLoadingSkeleton />
    </ContentLayout>
  );
}
