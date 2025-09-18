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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UserPlusIcon, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";
import { UserModal } from "@/components/settings/UserModal";
import { ConfirmationModal } from "@/components/settings/ConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";


// Definiciones de tipos
type User = {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: Role;
  groupCode?: string | null; // Código del grupo para directores de grupo
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

// Página principal de gestión de usuarios
export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Consulta para obtener todos los usuarios
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/v1/users");
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

  // Manejadores de eventos
  const handleOpenModal = (user?: User) => {
    setSelectedUser(user || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
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

  return (
    <ContentLayout title="Gestión de Usuarios del Sistema">
        <Card className="w-full border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Administra los usuarios y sus permisos por áreas
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenModal()} className="ml-auto">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </CardHeader>
          <CardContent>
          <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Grupo/Permisos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton loader para 5 filas mientras carga
                    Array(5)
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
                            <Skeleton className="h-6 w-28 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Skeleton className="h-6 w-16 rounded-full" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
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
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.role === "ADMIN"}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No hay usuarios registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            
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
    </ContentLayout>
  );
}
