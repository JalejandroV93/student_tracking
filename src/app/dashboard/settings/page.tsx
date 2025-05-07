// src/app/dashboard/settings/page.tsx
"use client";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Users } from "lucide-react";
import { SettingsFormSkeleton } from "@/components/settings/SettingsForm.skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateAlertSettings } from "@/lib/apiClient";
import { toast } from "sonner";
import type { AlertSettings } from "@/types/dashboard";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("alerts");

  const queryClient = useQueryClient();
  const {
    data: settingsData, // Contains { configured: boolean, settings: AlertSettings | null }
    isLoading: isLoadingSettings,
    error: settingsError,
    isFetching: isFetchingSettings,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  // Al montar el componente, verificar si hay un tab en la URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["alerts", "users"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Actualizar la URL cuando cambia el tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard/settings?tab=${value}`, { scroll: false });
  };

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updateAlertSettings,
    onSuccess: (savedSettings) => {
      toast.success("Configuración guardada exitosamente!");
      queryClient.setQueryData(["settings"], {
        configured: true,
        settings: savedSettings,
      });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      toast.error(`Error guardando configuración: ${error.message}`);
    },
  });

  const areSettingsConfigured = settingsData?.configured;
  const currentSettings = settingsData?.settings ?? null;

  if (isLoadingSettings) {
    return (
      <ContentLayout title="Configuración">
        <SettingsFormSkeleton />
      </ContentLayout>
    );
  }

  if (settingsError) {
    return (
      <ContentLayout title="Configuración">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-red-500">
          <Alert variant="destructive" className="max-w-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al Cargar Configuración</AlertTitle>
            <AlertDescription>
              {settingsError.message}. Intente recargar la página.
            </AlertDescription>
          </Alert>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Configuración">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6 w-full">
          {areSettingsConfigured === false && !isLoadingSettings && (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Configuración Inicial Requerida</AlertTitle>
              <AlertDescription>
                Parece que es la primera vez que utiliza esta sección o la
                configuración no se encontró. Por favor, defina los umbrales de
                alerta primarios y secundarios para continuar.
              </AlertDescription>
            </Alert>
          )}
          <SettingsForm
            currentSettings={currentSettings}
            onSave={saveSettings}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios del sistema y configura sus permisos por
                área
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Users className="h-16 w-16 mb-4 text-muted-foreground" />
              <p className="text-center text-muted-foreground mb-4">
                Gestiona usuarios, asigna roles y configura permisos por área
              </p>
              <Link href="/dashboard/settings/users" passHref>
                <Button>Gestionar Usuarios</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
