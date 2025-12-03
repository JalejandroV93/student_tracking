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
import { UserPlusIcon, Upload, Users, Send } from "lucide-react";
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
  useSendCredentials,
  useBulkSendCredentials,
  type BulkSendResult,
} from "@/components/settings/users/use-user-mutations";
import { BulkImportModal } from "@/components/settings/users/BulkImportModal";
import { BulkGroupAssignModal } from "@/components/settings/users/BulkGroupAssignModal";
import { SendCredentialsModal } from "@/components/settings/users/SendCredentialsModal";
import { BulkSendCredentialsModal } from "@/components/settings/users/BulkSendCredentialsModal";

// Página principal de gestión de usuarios
export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isBulkGroupAssignModalOpen, setIsBulkGroupAssignModalOpen] =
    useState(false);
  const [isSendCredentialsModalOpen, setIsSendCredentialsModalOpen] =
    useState(false);
  const [isBulkSendCredentialsModalOpen, setIsBulkSendCredentialsModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkSendResults, setBulkSendResults] = useState<BulkSendResult | null>(
    null
  );

  // Estados para filtros y paginación
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Consulta para obtener usuarios con paginación y filtros
  const { data, isLoading } = useUsersQuery({
    page,
    search,
    showBlockedOnly,
    roleFilter,
  });

  // Mutaciones
  const deleteUserMutation = useDeleteUser();
  const unlockUserMutation = useUnlockUser();
  const sendCredentialsMutation = useSendCredentials();
  const bulkSendCredentialsMutation = useBulkSendCredentials();

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

  // Manejadores para envío de credenciales
  const handleSendCredentialsClick = (user: User) => {
    setSelectedUser(user);
    setIsSendCredentialsModalOpen(true);
  };

  const confirmSendCredentials = () => {
    if (selectedUser) {
      sendCredentialsMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsSendCredentialsModalOpen(false);
          setSelectedUser(null);
        },
      });
    }
  };

  // Manejadores para selección múltiple
  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  // Manejadores para envío masivo de credenciales
  const handleBulkSendCredentialsClick = () => {
    setBulkSendResults(null);
    setIsBulkSendCredentialsModalOpen(true);
  };

  const confirmBulkSendCredentials = () => {
    const userIds = Array.from(selectedUserIds);
    bulkSendCredentialsMutation.mutate(userIds, {
      onSuccess: (results) => {
        setBulkSendResults(results);
        setSelectedUserIds(new Set());
      },
    });
  };

  const closeBulkSendModal = () => {
    setIsBulkSendCredentialsModalOpen(false);
    setBulkSendResults(null);
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

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
    setShowBlockedOnly(false);
    setRoleFilter("");
  };

  const users = data?.users || [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(search || showBlockedOnly || roleFilter);

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
            <div className="flex gap-2 flex-wrap">
              {selectedUserIds.size > 0 && (
                <Button
                  variant="default"
                  onClick={handleBulkSendCredentialsClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Credenciales ({selectedUserIds.size})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsBulkImportModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkGroupAssignModalOpen(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Asignar Grupos
              </Button>
              <Button onClick={() => handleOpenModal()}>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            </div>
          </div>

          <UserFilters
            searchInput={searchInput}
            showBlockedOnly={showBlockedOnly}
            roleFilter={roleFilter}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            onBlockedFilterChange={handleBlockedFilterChange}
            onRoleFilterChange={handleRoleFilterChange}
          />
        </CardHeader>

        <CardContent>
          <UsersTable
            users={users}
            isLoading={isLoading}
            hasFilters={hasFilters}
            selectedUsers={selectedUserIds}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClick}
            onUnlock={handleUnlockClick}
            onSendCredentials={handleSendCredentialsClick}
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

      <BulkImportModal
        open={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setIsBulkImportModalOpen(false);
        }}
      />

      <BulkGroupAssignModal
        open={isBulkGroupAssignModalOpen}
        onClose={() => setIsBulkGroupAssignModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          setIsBulkGroupAssignModalOpen(false);
        }}
      />

      {isSendCredentialsModalOpen && selectedUser && (
        <SendCredentialsModal
          user={selectedUser}
          open={isSendCredentialsModalOpen}
          onClose={() => {
            setIsSendCredentialsModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={confirmSendCredentials}
          isPending={sendCredentialsMutation.isPending}
        />
      )}

      {isBulkSendCredentialsModalOpen && (
        <BulkSendCredentialsModal
          users={users.filter((u) => selectedUserIds.has(u.id))}
          open={isBulkSendCredentialsModalOpen}
          onClose={closeBulkSendModal}
          onConfirm={confirmBulkSendCredentials}
          isPending={bulkSendCredentialsMutation.isPending}
          results={bulkSendResults}
        />
      )}
    </ContentLayout>
  );
}
