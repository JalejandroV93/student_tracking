"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditStats } from "./AuditStats";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuditLogsView() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs de Auditoría</h2>
          <p className="text-muted-foreground">
            Monitorea todas las acciones realizadas en el sistema
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Actividades</CardTitle>
              <CardDescription>
                Historial completo de acciones de usuarios y sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTable key={`logs-${refreshKey}`} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <AuditStats key={`stats-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
