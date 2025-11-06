"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  id: number;
  action: string;
  userId: string | null;
  username: string | null;
  entityType: string | null;
  entityId: string | null;
  description: string;
  status: string;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const actionLabels: Record<string, string> = {
  login: "Inicio de sesión",
  login_failed: "Login fallido",
  logout: "Cierre de sesión",
  password_change: "Cambio de contraseña",
  create: "Creación",
  update: "Actualización",
  delete: "Eliminación",
  sync_phidias_manual: "Sync manual Phidias",
  sync_phidias_auto: "Sync automático Phidias",
  sync_phidias_failed: "Sync fallido Phidias",
  query: "Consulta",
  export: "Exportación",
  import: "Importación",
  access_denied: "Acceso denegado",
};

const entityLabels: Record<string, string> = {
  falta: "Falta",
  estudiante: "Estudiante",
  caso: "Caso",
  seguimiento: "Seguimiento",
  user: "Usuario",
  phidias_sync: "Sincronización Phidias",
};

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    username: "",
    action: "",
    status: "",
  });

  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (filters.username) params.append("username", filters.username);
      if (filters.action) params.append("action", filters.action);
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/v1/audit/logs?${params}`);

      if (!response.ok) {
        throw new Error("Error al cargar logs");
      }

      const data: AuditLogsResponse = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            placeholder="Buscar por usuario..."
            value={filters.username}
            onChange={(e) => handleFilterChange("username", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="action">Acción</Label>
          <Select
            value={filters.action}
            onValueChange={(value) => handleFilterChange("action", value)}
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="Todas las acciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {Object.entries(actionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Advertencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{log.username || "Sistema"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType ? (
                      <span className="text-xs text-muted-foreground">
                        {entityLabels[log.entityType] || log.entityType}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[log.status] || ""}>
                      {log.status === "success"
                        ? "Éxito"
                        : log.status === "error"
                        ? "Error"
                        : "Advertencia"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.ipAddress || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {page * limit + 1} - {Math.min((page + 1) * limit, total)} de {total} registros
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <div className="text-sm">
            Página {page + 1} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => prev + 1)}
            disabled={page >= totalPages - 1}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
