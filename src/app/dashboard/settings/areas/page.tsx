"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Not used for controlled dialog, but part of the component
  DialogFooter, // Not directly used, form has its own
  DialogClose, // For explicit close button if needed
} from "@/components/ui/dialog";
import AreaList from "@/components/settings/areas/AreaList";
import AreaForm, { Area, AreaFormData } from "@/components/settings/areas/AreaForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // For redirect

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
      toast.error(`Failed to fetch areas: ${error.message}`);
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
      toast.error("Access Denied: You must be an Admin to view this page.");
      router.push("/dashboard"); // Redirect to a safe page
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
        throw new Error(errorData.error || `Failed to ${editingArea ? 'update' : 'create'} area`);
      }

      toast.success(`Area ${editingArea ? 'updated' : 'created'} successfully!`);
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
        // For 204 No Content, response.ok is true, but response.json() will fail.
        // So we check for specific error statuses that might return JSON.
        if (response.status === 409 || response.status === 404 || response.status === 403 || response.status === 401) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete area due to server error.");
        }
        if (response.status !== 204) { // If not 204, and not handled above, throw generic.
             throw new Error(`Failed to delete area. Status: ${response.status}`);
        }
      }
      toast.success("Area deleted successfully!");
      fetchAreas(); // Refresh the list
    } catch (error: any) {
      toast.error(`Failed to delete area: ${error.message}`);
      throw error; // Re-throw to allow AreaList to handle its state if needed
    }
  };

  if (authLoading || (!user && !authLoading)) { // Show loading while auth is checked or if no user (before redirect effect runs)
    return <p>Loading user data...</p>;
  }
  
  if (user && user.role !== Role.ADMIN) {
    return <p>Access Denied. You must be an Admin to manage Areas.</p>; // Fallback message if redirect hasn't happened
  }


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Areas</h1>
        <Button onClick={handleOpenModalForCreate}>Add New Area</Button>
      </div>

      {isLoading ? (
        <p>Loading areas...</p>
      ) : (
        <AreaList areas={areas} onEdit={handleOpenModalForEdit} onDelete={handleDeleteArea} />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? "Edit Area" : "Add New Area"}</DialogTitle>
            {editingArea && <DialogDescription>Editing: {editingArea.name} ({editingArea.code})</DialogDescription>}
          </DialogHeader>
          <AreaForm
            initialData={editingArea}
            onSubmit={handleSubmitAreaForm}
            onCancel={handleCloseModal}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreasPage;
