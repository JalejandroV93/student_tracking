import { ContentLayout } from "@/components/admin-panel/content-layout";
import { OverviewSkeleton } from "@/components/dashboard/Overview.skeleton";

export default function DashboardLoading() {
  return (
    <ContentLayout title="Resumen">
      <OverviewSkeleton />
    </ContentLayout>
  );
}
