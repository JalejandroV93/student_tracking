// src/components/students/EditFollowUpDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FollowUp } from "@/types/dashboard";
import { useEffect } from "react";
import { Loader2, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

// Schema for follow-up edit form validation
const editFollowUpFormSchema = z.object({
  date: z.string().min(1, {
    message: "Seleccione la fecha del seguimiento",
  }),
  details: z
    .string()
    .min(10, "Los detalles deben tener al menos 10 caracteres.")
    .max(500, "Los detalles no pueden exceder los 500 caracteres."),
});

type EditFollowUpFormData = z.infer<typeof editFollowUpFormSchema>;

interface EditFollowUpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUp;
  studentName: string;
  onSubmit: (followUpId: string, updates: Partial<FollowUp>) => Promise<void>;
  isSubmitting: boolean;
}

export function EditFollowUpDialog({
  isOpen,
  onOpenChange,
  followUp,
  studentName,
  onSubmit,
  isSubmitting,
}: EditFollowUpDialogProps) {
  const { user } = useAuth(); // Obtener usuario autenticado

  // Initialize form
  const form = useForm<EditFollowUpFormData>({
    resolver: zodResolver(editFollowUpFormSchema),
    defaultValues: {
      date: followUp.date,
      details: followUp.details,
    },
  });

  // Reset form when followUp changes
  useEffect(() => {
    if (isOpen && followUp) {
      form.reset({
        date: followUp.date,
        details: followUp.details,
      });
    }
  }, [isOpen, followUp, form]);

  const handleFormSubmit = (values: EditFollowUpFormData) => {
    const updates: Partial<FollowUp> = {
      date: values.date,
      details: values.details,
      updatedBy: user?.fullName || user?.username || "Sistema",
      updatedAt: new Date().toISOString(),
    };

    onSubmit(followUp.id, updates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Seguimiento
          </DialogTitle>
          <DialogDescription>
            Editando el seguimiento {followUp.followUpNumber} para la falta{" "}
            {followUp.type} de <strong>{studentName}</strong> del{" "}
            {formatDate(followUp.date)}.
          </DialogDescription>
        </DialogHeader>

        {/* Mostrar información del seguimiento original */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Creado por:</span>
              <span className="ml-2 text-gray-600">{followUp.author}</span>
            </div>
            {followUp.createdAt && (
              <div>
                <span className="font-medium text-gray-700">Creado:</span>
                <span className="ml-2 text-gray-600">
                  {formatDate(followUp.createdAt)}
                </span>
              </div>
            )}
            {followUp.updatedBy && (
              <div>
                <span className="font-medium text-gray-700">
                  Última edición por:
                </span>
                <span className="ml-2 text-gray-600">{followUp.updatedBy}</span>
              </div>
            )}
            {followUp.updatedAt && (
              <div>
                <span className="font-medium text-gray-700">
                  Última edición:
                </span>
                <span className="ml-2 text-gray-600">
                  {formatDate(followUp.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Seguimiento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isSubmitting}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles del Seguimiento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa las acciones realizadas, conversaciones, acuerdos, etc."
                      {...field}
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
