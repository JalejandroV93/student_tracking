"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { AuditLogsView } from "@/components/audit/AuditLogsView";

export default function AuditPage() {
  return (
    <ContentLayout title="Auditoría">
      <BreadcrumbNav />

      <div className="mt-6">
        <AuditLogsView />
      </div>
    </ContentLayout>
  );
}
