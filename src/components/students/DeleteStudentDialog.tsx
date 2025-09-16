"use client";

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
import { Student } from "@/hooks/useStudentManagement";

interface DeleteStudentDialogProps {
  student: Student;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteStudentDialog({ student, onConfirm, onCancel }: DeleteStudentDialogProps) {
  return (
    <AlertDialog open={true} onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar estudiante?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar al estudiante <strong>{student.name}</strong> (Código: {student.code})?
            <br />
            <br />
            Esta acción no se puede deshacer y eliminará:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Todos los datos del estudiante</li>
              <li>Todas las faltas asociadas</li>
              <li>Todos los seguimientos de casos</li>
              <li>Todo el historial académico</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Eliminar estudiante
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}