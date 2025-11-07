import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Pencil, Trash2, Unlock, AlertTriangle } from "lucide-react";
import { User } from "./types";
import { getRoleBadgeColor, getRoleDisplayName } from "./role-utils";

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onUnlock: (user: User) => void;
}

export function UserRow({ user, onEdit, onDelete, onUnlock }: UserRowProps) {
  const isAdminUser = user.role === "ADMIN";

  return (
    <TableRow className={user.isBlocked ? "bg-red-50" : ""}>
      <TableCell className="font-medium">
        {user.fullName}
        {user.isBlocked && (
          <Badge variant="destructive" className="ml-2 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Bloqueado
          </Badge>
        )}
      </TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.email || "—"}</TableCell>
      <TableCell>
        {user.isBlocked ? (
          <Badge variant="destructive">Bloqueado</Badge>
        ) : (
          <Badge variant="default" className="bg-green-500">
            Activo
          </Badge>
        )}
        {user.failedLoginAttempts > 0 && !user.isBlocked && (
          <div className="text-xs text-yellow-600 mt-1">
            {user.failedLoginAttempts} intento(s) fallido(s)
          </div>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getRoleBadgeColor(user.role)}>
          {getRoleDisplayName(user.role)}
        </Badge>
      </TableCell>
      <TableCell>
        {user.role === "TEACHER" && user.groupCode ? (
          <Badge variant="outline" className="bg-orange-50">
            Grupo: {user.groupCode}
          </Badge>
        ) : user.areaPermissions?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {user.areaPermissions.map(
              (permission) =>
                permission.canView && (
                  <Badge key={permission.id} variant="outline">
                    {permission.area.name}
                  </Badge>
                )
            )}
          </div>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {user.isBlocked && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUnlock(user)}
              title="Desbloquear usuario"
            >
              <Unlock className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            title="Editar usuario"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(user)}
            disabled={isAdminUser}
            title={
              isAdminUser
                ? "No se puede eliminar un administrador"
                : "Eliminar usuario"
            }
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
