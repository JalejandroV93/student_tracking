"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function SettingsFormSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Configuración de Alertas
            </CardTitle>
            <CardDescription className="mt-2">
              Define los umbrales que activan alertas de advertencia (primaria) y críticas (secundaria) 
              basadas en faltas de Tipo I.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="global" className="text-sm">
              Umbrales Globales
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-sm">
              Umbrales por Sección
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            {/* Global Thresholds Skeleton */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-medium">Umbrales Globales</h3>
              <p className="text-sm text-muted-foreground">
                Estos umbrales se aplican a todas las secciones por defecto
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Umbral de Advertencia</div>
                  <Skeleton className="h-10 w-full" />
                  <div className="text-xs text-muted-foreground">
                    Porcentaje que activa alertas de advertencia
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Umbral Crítico</div>
                  <Skeleton className="h-10 w-full" />
                  <div className="text-xs text-muted-foreground">
                    Porcentaje que activa alertas críticas
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Umbrales por Sección</h3>
              <p className="text-sm text-muted-foreground">
                Configura umbrales específicos para cada sección
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-4 bg-muted/30"
                  >
                    <Skeleton className="h-4 w-1/2" /> {/* Section Name */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Advertencia</div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Crítico</div>
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="outline" disabled>
          Restablecer
        </Button>
        <Button disabled className="relative">
          <Skeleton className="absolute inset-0" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
}
