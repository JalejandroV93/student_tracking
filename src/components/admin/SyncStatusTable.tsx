import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SyncMetadataItem = {
  tabla: string;
  ultima_actualizacion: string; // Fecha ISO
};

interface SyncStatusTableProps {
  metadata: SyncMetadataItem[];
}

// Mapeo de nombres de tablas a nombres amigables en español
const tableNameMap: Record<string, string> = {
  estudiantes: "Estudiantes",
  faltas: "Faltas",
  casos: "Casos",
  seguimientos: "Seguimientos",
  usuarios: "Usuarios",
  areas: "Áreas",
  area_permissions: "Permisos de Áreas",
};

export function SyncStatusTable({ metadata }: SyncStatusTableProps) {
  // Verificar si hay datos para mostrar
  if (!metadata || metadata.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No hay información de sincronización disponible
      </div>
    );
  }

  // Calcular estado de cada entidad
  const getEntityStatus = (lastSync: string) => {
    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const diffHours =
      (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return <Badge className="bg-green-500">Actualizado</Badge>;
    } else if (diffHours < 48) {
      return <Badge className="bg-yellow-500">Desactualizado</Badge>;
    } else {
      return <Badge variant="destructive">Obsoleto</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Entidad</TableHead>
          <TableHead>Última Sincronización</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metadata.map((item) => (
          <TableRow key={item.tabla}>
            <TableCell className="font-medium">
              {tableNameMap[item.tabla] || item.tabla}
            </TableCell>
            <TableCell>
              {new Date(item.ultima_actualizacion).toLocaleString("es-CO")}
            </TableCell>
            <TableCell>{getEntityStatus(item.ultima_actualizacion)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
