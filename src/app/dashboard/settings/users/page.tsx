"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { UserPlusIcon } from "lucide-react";
import { UserModal } from "@/components/settings/UserModal";
import { ConfirmationModal } from "@/components/settings/ConfirmationModal";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { User } from "@/components/settings/users/types";
import { UsersTable } from "@/components/settings/users/UsersTable";
import { UserFilters } from "@/components/settings/users/UserFilters";
import { PaginationControls } from "@/components/settings/users/PaginationControls";
import { useUsersQuery } from "@/components/settings/users/use-users-query";
import {
  useDeleteUser,
  useUnlockUser,
} from "@/components/settings/users/use-user-mutations";

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
  const [searchInput, setSearchInput] = useState("");

  // Consulta para obtener usuarios con paginación y filtros
  const { data, isLoading } = useUsersQuery({
    page,
    search,
    showBlockedOnly,
  });

  // Mutaciones
  const deleteUserMutation = useDeleteUser();
  const unlockUserMutation = useUnlockUser();

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
      deleteUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        },
      });
    }
  };

  const confirmUnlock = () => {
    if (selectedUser) {
      unlockUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsUnlockModalOpen(false);
          setSelectedUser(null);
        },
      });
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleBlockedFilterChange = (checked: boolean) => {
    setShowBlockedOnly(checked);
    setPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
    setShowBlockedOnly(false);
  };

  const users = data?.users || [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(search || showBlockedOnly);

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

          <UserFilters
            searchInput={searchInput}
            showBlockedOnly={showBlockedOnly}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            onBlockedFilterChange={handleBlockedFilterChange}
          />
        </CardHeader>

        <CardContent>
          <UsersTable
            users={users}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClick}
            onUnlock={handleUnlockClick}
            onClearFilters={handleClearFilters}
          />

          {pagination && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={users.length}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              search={search}
              showBlockedOnly={showBlockedOnly}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

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

      {isDeleteModalOpen && selectedUser && (
        <ConfirmationModal
          title="Eliminar Usuario"
          description={`¿Estás seguro de que deseas eliminar al usuario ${selectedUser.fullName}?`}
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={deleteUserMutation.isPending}
        />
      )}

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
