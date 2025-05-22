"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Area } from "./AreaForm";
import { Pencil, Trash2 } from "lucide-react";

interface AreaListProps {
  areas: Area[];
  onEdit: (area: Area) => void;
  onDelete: (areaId: number) => Promise<void>;
}

const AreaList: React.FC<AreaListProps> = ({ areas, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (area: Area) => {
    setAreaToDelete(area);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (areaToDelete) {
      setIsDeleting(true);
      try {
        await onDelete(areaToDelete.id);
      } catch (error: any) {
        // El error ya se maneja en el componente principal
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-4 text-muted-foreground"
              >
                No hay áreas registradas en el sistema
              </TableCell>
            </TableRow>
          ) : (
            areas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell>{area.code}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(area)}
                    className="mr-1"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(area)}
                    disabled={isDeleting && areaToDelete?.id === area.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {areaToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                el área "{areaToDelete.name}" ({areaToDelete.code}). Asegúrate
                de que esta área no esté actualmente en uso (por ejemplo, en
                permisos o asignada a estudiantes).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setAreaToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default AreaList;
