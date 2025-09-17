"use client";

import { SeguimientosConfig } from "@/components/phidias/seguimientos-config";

export default function PhidiasSeguimientosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Seguimientos Phidias</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los seguimientos de Phidias asociados a cada nivel académico y tipo de falta
        </p>
      </div>

      <SeguimientosConfig />
    </div>
  );
}