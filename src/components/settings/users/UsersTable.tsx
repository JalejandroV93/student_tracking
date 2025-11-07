import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "./types";
import { UserRow } from "./UserRow";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { UserTableEmptyState } from "./UserTableEmptyState";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  hasFilters: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onUnlock: (user: User) => void;
  onClearFilters: () => void;
}

export function UsersTable({
  users,
  isLoading,
  hasFilters,
  onEdit,
  onDelete,
  onUnlock,
  onClearFilters,
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Grupo/Permisos</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <UserTableSkeleton />
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onUnlock={onUnlock}
            />
          ))
        ) : (
          <UserTableEmptyState
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
          />
        )}
      </TableBody>
    </Table>
  );
}
