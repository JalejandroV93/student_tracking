// src/app/dashboard/reports/page.tsx
"use client";

import { Reports } from "@/components/reports";
import useDashboardStore from "@/lib/store";
import { useEffect } from "react";


export default function ReportsPage() {
    const { students, infractions, fetchData, loading, error } =
        useDashboardStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <div className="text-sm text-muted-foreground">
                Mostrando reportes para todas las secciones
            </div>
            <Reports students={students} infractions={infractions} />
        </div>
    );
}