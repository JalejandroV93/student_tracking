import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function UserTableEmptyState({
  hasFilters,
  onClearFilters,
}: EmptyStateProps) {
  if (hasFilters) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8">
          <div>
            <p className="text-muted-foreground">
              No se encontraron usuarios con los filtros aplicados
            </p>
            <Button variant="link" onClick={onClearFilters} className="mt-2">
              Limpiar filtros
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8">
        No hay usuarios registrados
      </TableCell>
    </TableRow>
  );
}
