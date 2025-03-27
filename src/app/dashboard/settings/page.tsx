// src/app/dashboard/settings/page.tsx
"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SettingsForm } from "@/components/settings/SettingsForm"; // Adjust path
import { useSettingsStore } from "@/stores/settings.store"; // Adjust path

export default function SettingsPage() {
    const { settings, updateSettings, fetchSettings, loading, error } =
        useSettingsStore();

    useEffect(() => {
        // Fetch settings when the component mounts
        fetchSettings();
    }, [fetchSettings]);

    if (loading && !settings) { // Show loading only on initial load
        return (
            <div className="flex items-center justify-center h-[calc(100vh-150px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-150px)] text-red-500">
                {error}
                {/* Add retry button maybe */}
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
                Configuración de Alertas
            </h1>
            {/* Pass settings and the update function to the form */}
            {/* The form component will handle the form state itself */}
             <SettingsForm
                currentSettings={settings}
                onSave={updateSettings}
                isSaving={loading} // Pass loading state to disable button during save
             />
        </div>
    );
}