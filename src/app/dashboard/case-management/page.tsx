// src/app/dashboard/case-management/page.tsx
"use client";

import { CaseManagement } from "@/components/case-management";
import useDashboardStore from "@/lib/store";
import { useEffect } from "react";


export default function CaseManagementPage() {
    const { students, infractions, followUps, fetchData, loading, error } =
        useDashboardStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectStudent = (studentId: string) => {
        window.location.href = `/dashboard/students/${studentId}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="container py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
                Gestión de Casos
            </h1>
            <div className="text-sm text-muted-foreground">
                Mostrando casos para todas las secciones
            </div>
            <CaseManagement
                students={students}
                infractions={infractions}
                followUps={followUps}
                onSelectStudent={handleSelectStudent}
            />
        </div>
    );
}