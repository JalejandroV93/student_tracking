"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { StudentManagementTabs } from "@/components/students/StudentManagementTabs";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function StudentsPage() {
  return (
    <ContentLayout title="Gestión de Estudiantes">
        <BreadcrumbNav />
        <StudentManagementTabs />
    </ContentLayout>
  );
}