"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Check, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UnassignedTeacher {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  createdAt: string;
}

interface GroupOption {
  value: string;
  label: string;
}

interface BulkGroupAssignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkGroupAssignModal({
  open,
  onClose,
  onSuccess,
}: BulkGroupAssignModalProps) {
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // Obtener usuarios sin grupo asignado
  const {
    data: unassignedData,
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["unassigned-teachers"],
    queryFn: async () => {
      const response = await fetch("/api/v1/users/bulk-assign-groups");
      if (!response.ok) {
        throw new Error("Error al cargar directores sin grupo");
      }
      return response.json();
    },
    enabled: open,
  });

  // Obtener grupos disponibles
  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await fetch("/api/v1/groups");
      if (!response.ok) {
        throw new Error("Error al cargar grupos");
      }
      return response.json() as Promise<GroupOption[]>;
    },
    enabled: open,
  });

  // Mutación para asignar grupos
  const assignGroupsMutation = useMutation({
    mutationFn: async (data: { userIds: string[]; groupCode: string }) => {
      const response = await fetch("/api/v1/users/bulk-assign-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al asignar grupos");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-teachers"] });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const unassignedTeachers = unassignedData?.unassignedTeachers || [];
  const teachersCount = unassignedData?.count || 0;

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSelectedUsers([]);
    setSelectedGroup("");
    onClose();
  };

  // Manejar selección de usuarios
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(unassignedTeachers.map((user: UnassignedTeacher) => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (selectedUsers.length === 0) {
      toast.error("Debe seleccionar al menos un director de grupo");
      return;
    }

    if (!selectedGroup) {
      toast.error("Debe seleccionar un grupo");
      return;
    }

    assignGroupsMutation.mutate({
      userIds: selectedUsers,
      groupCode: selectedGroup,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent className="max-w-5xl! max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignación Masiva de Grupos
          </DialogTitle>
          <DialogDescription>
            Selecciona directores de grupo sin asignar y asígnales un grupo específico.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">
                    <strong>{teachersCount}</strong> directores sin grupo asignado
                  </span>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>{selectedUsers.length}</strong> seleccionados
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selección de grupo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grupo a Asignar</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.value} value={group.value}>
                      {group.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Lista de directores sin grupo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Directores de Grupo Sin Asignar
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllUsers}
                    disabled={unassignedTeachers.length === 0}
                  >
                    Seleccionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedUsers.length === 0}
                  >
                    Limpiar Selección
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando directores...</span>
                </div>
              ) : usersError ? (
                <div className="flex items-center justify-center p-8 text-destructive">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Error al cargar directores de grupo
                </div>
              ) : unassignedTeachers.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Check className="h-5 w-5 mr-2" />
                  Todos los directores de grupo tienen asignado un grupo
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unassignedTeachers.map((user: UnassignedTeacher) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.fullName}</span>
                          <Badge variant="secondary">@{user.username}</Badge>
                        </div>
                        {user.email && (
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Creado: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              assignGroupsMutation.isPending ||
              selectedUsers.length === 0 ||
              !selectedGroup ||
              loadingGroups
            }
          >
            {assignGroupsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Asignar Grupo ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}