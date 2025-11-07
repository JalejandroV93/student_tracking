"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UserPlusIcon, Pencil, Trash2, Unlock, AlertTriangle, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";
import { UserModal } from "@/components/settings/UserModal";
import { ConfirmationModal } from "@/components/settings/ConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


// Definiciones de tipos
type User = {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  groupCode?: string | null;
  isBlocked: boolean;
  failedLoginAttempts: number;
  lastLogin: Date | null;
  areaPermissions: AreaPermission[];
};

type AreaPermission = {
  id: number;
  areaId: number;
  canView: boolean;
  area: {
    id: number;
    name: string;
    code: string;
  };
};

type UsersResponse = {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

// Página principal de gestión de usuarios
export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados para filtros y paginación
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // Para el input controlado

  // Consulta para obtener usuarios con paginación y filtros
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, showBlockedOnly],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (showBlockedOnly) params.append("blocked", "true");

      const response = await fetch(`/api/v1/users?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
  });

  // Mutación para eliminar un usuario
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar usuario");
      return userId;
    },
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Mutación para desbloquear un usuario
  const unlockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/users/${userId}/unlock`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error al desbloquear usuario");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Usuario desbloqueado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsUnlockModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Manejadores de eventos
  const handleOpenModal = (user?: User) => {
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUnlockClick = (user: User) => {
    setSelectedUser(user);
    setIsUnlockModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const confirmUnlock = () => {
    if (selectedUser) {
      unlockUserMutation.mutate(selectedUser.id);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleBlockedFilterChange = (checked: boolean) => {
    setShowBlockedOnly(checked);
    setPage(1); // Reset to first page when filtering
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500";
      case "PRESCHOOL_COORDINATOR":
        return "bg-blue-500";
      case "ELEMENTARY_COORDINATOR":
        return "bg-green-500";
      case "MIDDLE_SCHOOL_COORDINATOR":
        return "bg-yellow-500";
      case "HIGH_SCHOOL_COORDINATOR":
        return "bg-purple-500";
      case "PSYCHOLOGY":
        return "bg-pink-500";
      case "TEACHER":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "PRESCHOOL_COORDINATOR":
        return "Coordinador Preescolar";
      case "ELEMENTARY_COORDINATOR":
        return "Coordinador Primaria";
      case "MIDDLE_SCHOOL_COORDINATOR":
        return "Coordinador Secundaria";
      case "HIGH_SCHOOL_COORDINATOR":
        return "Coordinador Bachillerato";
      case "PSYCHOLOGY":
        return "Psicología";
      case "TEACHER":
        return "Director de Grupo";
      case "USER":
        return "Usuario";
      case "STUDENT":
        return "Estudiante";
      default:
        return role;
    }
  };

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <ContentLayout title="Gestión de Usuarios del Sistema">
      <BreadcrumbNav />
      <Card className="w-full border-none">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Administra los usuarios y sus permisos por áreas
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, usuario o email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 pr-10"
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button onClick={handleSearch}>
                Buscar
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="blocked-filter"
                checked={showBlockedOnly}
                onCheckedChange={handleBlockedFilterChange}
              />
              <Label htmlFor="blocked-filter" className="cursor-pointer">
                Solo usuarios bloqueados
              </Label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
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
                // Skeleton loader
                Array(10)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : users && users.length > 0 ? (
                users.map((user: User) => (
                  <TableRow key={user.id} className={user.isBlocked ? "bg-red-50" : ""}>
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
                        <Badge variant="destructive">
                          Bloqueado
                        </Badge>
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
                                <Badge
                                  key={permission.id}
                                  variant="outline"
                                >
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
                            onClick={() => handleUnlockClick(user)}
                            title="Desbloquear usuario"
                          >
                            <Unlock className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(user)}
                          title="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.role === "ADMIN"}
                          title={user.role === "ADMIN" ? "No se puede eliminar un administrador" : "Eliminar usuario"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {search || showBlockedOnly ? (
                      <div>
                        <p className="text-muted-foreground">No se encontraron usuarios con los filtros aplicados</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            handleClearSearch();
                            setShowBlockedOnly(false);
                          }}
                          className="mt-2"
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    ) : (
                      "No hay usuarios registrados"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {users.length} de {pagination.total} usuarios
                {search && ` (filtrados por "${search}")`}
                {showBlockedOnly && " (solo bloqueados)"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleteModalOpen && selectedUser && (
        <ConfirmationModal
          title="Eliminar Usuario"
          description={`¿Estás seguro de que deseas eliminar al usuario ${selectedUser.fullName}?`}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={deleteUserMutation.isPending}
        />
      )}

      {/* Modal de confirmación para desbloquear */}
      {isUnlockModalOpen && selectedUser && (
        <ConfirmationModal
          title="Desbloquear Usuario"
          description={`¿Estás seguro de que deseas desbloquear al usuario ${selectedUser.fullName}? Esto reiniciará el contador de intentos fallidos y permitirá al usuario iniciar sesión nuevamente.`}
          onConfirm={confirmUnlock}
          onCancel={() => setIsUnlockModalOpen(false)}
          isDeleting={unlockUserMutation.isPending}
        />
      )}
    </ContentLayout>
  );
}
