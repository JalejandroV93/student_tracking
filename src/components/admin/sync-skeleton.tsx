import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function SyncAdminSkeleton() {
  return (
    <div className="grid gap-6">
      <Card className="mb-2">
        <CardHeader>
          <CardTitle>Estado de Sincronización</CardTitle>
          <CardDescription>Estado actual de la sincronización con Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última sincronización:</p>
                <Skeleton className="h-7 w-48 mt-1" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                <Button disabled>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Ahora
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado por Entidad</CardTitle>
          <CardDescription>Última sincronización de cada entidad</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncStatusTableSkeleton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronización</CardTitle>
          <CardDescription>Registro de las últimas sincronizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncHistoryTableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}

function SyncStatusTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center py-4 border-b">
        <div className="flex-1 font-medium">Entidad</div>
        <div className="flex-1 font-medium">Última Sincronización</div>
        <div className="flex-1 font-medium">Estado</div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center py-4 border-b">
          <div className="flex-1">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SyncHistoryTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center py-4 border-b">
        <div className="w-16 font-medium">ID</div>
        <div className="flex-1 font-medium">Iniciado</div>
        <div className="flex-1 font-medium">Duración</div>
        <div className="flex-1 font-medium">Estado</div>
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center py-4 border-b">
          <div className="w-16">
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}
