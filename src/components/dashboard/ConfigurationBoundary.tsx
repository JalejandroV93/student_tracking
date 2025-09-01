// src/components/dashboard/ConfigurationBoundary.tsx
"use client";

import { ReactNode } from "react";
import { UnconfiguredSettings } from "./UnconfiguredSettings";

interface ConfigurationBoundaryProps {
  children: ReactNode;
  isConfigured: boolean | null;
  isLoading?: boolean;
}

export function ConfigurationBoundary({
  children,
  isConfigured,
  isLoading = false,
}: ConfigurationBoundaryProps) {
  // Mostrar loading mientras verificamos la configuración
  if (isLoading) {
    return null; // El loading.tsx se encarga de mostrar el skeleton
  }

  // Si la configuración no está lista, mostrar el componente de configuración
  if (isConfigured === false) {
    return <UnconfiguredSettings />;
  }

  // Si está configurado o aún no sabemos, mostrar el contenido
  return <>{children}</>;
}
