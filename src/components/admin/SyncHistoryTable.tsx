import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type SyncHistoryItem = {
  id: number;
  status: "success" | "error" | "running";
  startedAt: string;
  completedAt?: string;
  error?: string;
};

interface SyncHistoryTableProps {
  history: SyncHistoryItem[];
}

export function SyncHistoryTable({ history }: SyncHistoryTableProps) {
  // Verificar si hay datos para mostrar
  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No hay historial de sincronización disponible
      </div>
    );
  }

  // Función para formatear la duración
  const formatDuration = (start: string, end?: string) => {
    if (!end) return "En progreso";

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;

    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds} segundos`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} seg`;
  };

  // Renderizar estado
  const renderStatus = (status: SyncHistoryItem["status"]) => {
    switch (status) {
      case "running":
        return (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
            <span className="text-blue-500">En progreso</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-green-500">Completado</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            <span className="text-red-500">Error</span>
          </div>
        );
      default:
        return <span>Desconocido</span>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Iniciado</TableHead>
          <TableHead>Duración</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">#{item.id}</TableCell>
            <TableCell>
              {new Date(item.startedAt).toLocaleString("es-CO")}
            </TableCell>
            <TableCell>
              {formatDuration(item.startedAt, item.completedAt)}
            </TableCell>
            <TableCell>{renderStatus(item.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
