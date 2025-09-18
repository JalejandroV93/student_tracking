"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { StudentManagementTabs } from "@/components/students/StudentManagementTabs";

export default function StudentsPage() {
  return (
    <ContentLayout title="Gestión de Estudiantes">
        <StudentManagementTabs />
    </ContentLayout>
  );
}