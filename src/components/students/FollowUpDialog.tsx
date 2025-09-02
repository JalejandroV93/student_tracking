// src/components/students/FollowUpDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Use Input for date
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Infraction, FollowUp } from "@/types/dashboard";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

// Schema for follow-up form validation
const followUpFormSchema = z.object({
  followUpNumber: z.number().min(1, "Seleccione el número de seguimiento"),
  date: z.string().min(1, {
    message: "Seleccione la fecha del seguimiento",
  }),
  details: z
    .string()
    .min(10, "Los detalles deben tener al menos 10 caracteres.")
    .max(500, "Los detalles no pueden exceder los 500 caracteres."),
});

type FollowUpFormData = z.infer<typeof followUpFormSchema>;

interface FollowUpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction; // The infraction needing follow-up
  studentName: string; // For context
  existingFollowUps: FollowUp[]; // Pass existing follow-ups for this infraction
  onSubmit: (followUpData: Omit<FollowUp, "id">) => Promise<void>; // Submit action from store
  isSubmitting: boolean; // Loading state from store
}

export function FollowUpDialog({
  isOpen,
  onOpenChange,
  infraction,
  studentName,
  existingFollowUps,
  onSubmit,
  isSubmitting,
}: FollowUpDialogProps) {
  const { user } = useAuth(); // Obtener usuario autenticado

  // Determine available follow-up numbers
  const availableFollowUpNumbers = useMemo(() => {
    // Obtenemos los números ya utilizados
    const existingNumbers = new Set(
      existingFollowUps.map((f) => f.followUpNumber)
    );

    // Devolvemos los números que faltan entre 1, 2 y 3
    return [1, 2, 3].filter((num) => !existingNumbers.has(num));
  }, [existingFollowUps]);

  // Initialize form
  const form = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      followUpNumber: availableFollowUpNumbers[0] ?? 1, // Default to first available or 1
      date: new Date().toISOString().split("T")[0], // Default to today
      details: "",
    },
  });

  // Reset form when dialog opens or infraction changes
  // Also set default followUpNumber if available
  useMemo(() => {
    if (isOpen) {
      form.reset({
        followUpNumber: availableFollowUpNumbers[0] ?? 1,
        date: new Date().toISOString().split("T")[0],
        details: "",
      });
    }
  }, [isOpen, availableFollowUpNumbers, form]);

  const handleFormSubmit = (values: FollowUpFormData) => {
    const newFollowUpData: Omit<FollowUp, "id"> = {
      infractionId: infraction.id, // Link to the specific infraction
      followUpNumber: values.followUpNumber,
      date: values.date,
      details: values.details,
      type: infraction.type, // Copy infraction type
      author: user?.fullName || user?.username || "Sistema", // Usar usuario autenticado
    };

    onSubmit(newFollowUpData); // Call the submission function passed from props
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {" "}
        {/* Slightly wider */}
        <DialogHeader>
          <DialogTitle>Registrar Seguimiento</DialogTitle>
          <DialogDescription>
            Para la falta {infraction.type} - {infraction.number} de{" "}
            <strong>{studentName}</strong> del {formatDate(infraction.date)}.
            Quedan {availableFollowUpNumbers.length} seguimiento(s)
            pendiente(s).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 pt-2" // Add padding top
          >
            <FormField
              control={form.control}
              name="followUpNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Seguimiento</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))} // Convert to number
                    value={field.value?.toString()} // Ensure value is string for Select
                    disabled={
                      availableFollowUpNumbers.length === 0 || isSubmitting
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el número" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFollowUpNumbers.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Seguimiento {num}
                        </SelectItem>
                      ))}
                      {availableFollowUpNumbers.length === 0 && (
                        <SelectItem value="-" disabled>
                          No hay seguimientos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                     Cada falta requiere 3 seguimientos.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Seguimiento</FormLabel>
                  <FormControl>
                    {/* Using Shadcn Input for consistency */}
                    <Input
                      type="date"
                      {...field}
                      disabled={isSubmitting}
                      max={new Date().toISOString().split("T")[0]} // Prevent future dates
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
                      rows={4} // Set initial rows
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              {" "}
              {/* Add padding top */}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting || availableFollowUpNumbers.length === 0}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Seguimiento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
