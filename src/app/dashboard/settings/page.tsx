// src/app/dashboard/settings/page.tsx
"use client";

import { Settings } from "@/components/settings";
import useDashboardStore from "@/lib/store";
import { useEffect } from "react";

export default function SettingsPage() {
    const { alertSettings, updateAlertSettings, fetchData, loading, error } =
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
            <h1 className="text-3xl font-bold tracking-tight">
                Configuración
            </h1>
            <Settings
                alertSettings={alertSettings}
                updateAlertSettings={updateAlertSettings}
            />
        </div>
    );
}