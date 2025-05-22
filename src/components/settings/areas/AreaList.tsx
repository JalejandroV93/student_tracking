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
import { Area } from "./AreaForm"; // Re-using Area type from AreaForm

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
        // Error toast is handled by the page component, but you could add one here if needed
        // toast.error(`Failed to delete area: ${error.message || "Unknown error"}`);
      } finally {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        setAreaToDelete(null);
      }
    }
  };

  if (areas.length === 0) {
    return <p>No areas found.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => (
            <TableRow key={area.id}>
              <TableCell>{area.name}</TableCell>
              <TableCell>{area.code}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(area)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(area)}
                  disabled={isDeleting && areaToDelete?.id === area.id}
                >
                  {isDeleting && areaToDelete?.id === area.id ? "Deleting..." : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {areaToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                area &quot;{areaToDelete.name}&quot; ({areaToDelete.code}).
                Make sure this area is not currently in use (e.g., by permissions or students).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAreaToDelete(null)} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default AreaList;
