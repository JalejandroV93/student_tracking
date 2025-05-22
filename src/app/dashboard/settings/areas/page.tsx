"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import AreaList from "@/components/settings/areas/AreaList";
import AreaForm, {
  Area,
  AreaFormData,
} from "@/components/settings/areas/AreaForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

const AreasPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | undefined>(undefined);

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/areas");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch areas");
      }
      const data = await response.json();
      setAreas(data);
    } catch (error: any) {
      toast.error(`Error al cargar áreas: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === Role.ADMIN) {
      fetchAreas();
    }
  }, [user, authLoading, fetchAreas]);

  // Admin Protection
  useEffect(() => {
    if (!authLoading && (!user || user.role !== Role.ADMIN)) {
      toast.error(
        "Acceso denegado: Debes ser Administrador para ver esta página."
      );
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleOpenModalForCreate = () => {
    setEditingArea(undefined);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (area: Area) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArea(undefined);
  };

  const handleSubmitAreaForm = async (data: AreaFormData) => {
    setIsSubmitting(true);
    const url = editingArea
      ? `/api/v1/areas/${editingArea.id}`
      : "/api/v1/areas";
    const method = editingArea ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Error al ${editingArea ? "actualizar" : "crear"} área`
        );
      }

      toast.success(
        `Área ${editingArea ? "actualizada" : "creada"} exitosamente!`
      );
      fetchAreas(); // Refresh the list
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    // Confirmation is handled in AreaList, this function executes the delete
    try {
      const response = await fetch(`/api/v1/areas/${areaId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (
          response.status === 409 ||
          response.status === 404 ||
          response.status === 403 ||
          response.status === 401
        ) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al eliminar el área.");
        }
        if (response.status !== 204) {
          throw new Error(
            `Error al eliminar el área. Código: ${response.status}`
          );
        }
      }
      toast.success("Área eliminada exitosamente!");
      fetchAreas();
    } catch (error: any) {
      toast.error(`Error al eliminar área: ${error.message}`);
      throw error;
    }
  };

  if (authLoading) {
    return (
      <ContentLayout title="Gestión de Áreas">
        <div className="flex items-center justify-center w-full h-64">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </ContentLayout>
    );
  }

  if (user && user.role !== Role.ADMIN) {
    return (
      <ContentLayout title="Acceso Denegado">
        <p>Acceso Denegado. Debes ser Administrador para gestionar Áreas.</p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Gestión de Áreas">
      <div className="space-y-6 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Áreas del Sistema</CardTitle>
              <CardDescription>
                Administra las áreas disponibles para los usuarios
              </CardDescription>
            </div>
            <Button onClick={handleOpenModalForCreate} className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Área
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <AreaList
                areas={areas}
                onEdit={handleOpenModalForEdit}
                onDelete={handleDeleteArea}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArea ? "Editar Área" : "Agregar Nueva Área"}
            </DialogTitle>
            {editingArea && (
              <DialogDescription>
                Editando: {editingArea.name} ({editingArea.code})
              </DialogDescription>
            )}
          </DialogHeader>
          <AreaForm
            initialData={editingArea}
            onSubmit={handleSubmitAreaForm}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </ContentLayout>
  );
};

export default AreasPage;
