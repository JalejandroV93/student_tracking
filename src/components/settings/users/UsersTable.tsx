import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "./types";
import { UserRow } from "./UserRow";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { UserTableEmptyState } from "./UserTableEmptyState";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  hasFilters: boolean;
  selectedUsers?: Set<string>;
  onSelectUser?: (userId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onUnlock: (user: User) => void;
  onSendCredentials?: (user: User) => void;
  onClearFilters: () => void;
}

export function UsersTable({
  users,
  isLoading,
  hasFilters,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEdit,
  onDelete,
  onUnlock,
  onSendCredentials,
  onClearFilters,
}: UsersTableProps) {
  const allSelected = users.length > 0 && selectedUsers?.size === users.length;
  const someSelected =
    selectedUsers &&
    selectedUsers.size > 0 &&
    selectedUsers.size < users.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onSelectAll && (
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (
                      el as HTMLButtonElement & { indeterminate: boolean }
                    ).indeterminate = someSelected || false;
                  }
                }}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                aria-label="Seleccionar todos"
              />
            </TableHead>
          )}
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
              isSelected={selectedUsers?.has(user.id)}
              onSelect={onSelectUser}
              onEdit={onEdit}
              onDelete={onDelete}
              onUnlock={onUnlock}
              onSendCredentials={onSendCredentials}
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
