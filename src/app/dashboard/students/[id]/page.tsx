// src/app/dashboard/students/[id]/page.tsx (Simplified)
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import useDashboardStore from "@/lib/store";
import { useParams } from "next/navigation";
import { Student, Infraction, FollowUp } from "@/types/dashboard"; // Import types
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription as FormDesc,
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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StudentDetailsPageProps {
  params: { id: string }; // Get id from URL
}

// Define schema for follow-up form validation (extended for details)
const followUpFormSchema = z.object({
  infractionId: z.string({
    required_error: "Por favor seleccione una falta",
  }),
  followUpNumber: z.string({
    required_error: "Por favor seleccione el número de seguimiento",
  }),
  date: z.string({
    required_error: "Por favor seleccione la fecha del seguimiento",
  }),
  details: z
    .string({
      // Added details field
      required_error: "Por favor ingrese los detalles del seguimiento",
    })
    .min(10, "Los detalles deben tener al menos 10 caracteres."),
  type: z.string(),
  author: z.string(),
});

export default function StudentDetailsPage({}: StudentDetailsPageProps) {
  const params = useParams();
  const { id } = params;
  const { addFollowUp, fetchData } =
    useDashboardStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentInfractions, setStudentInfractions] = useState<Infraction[]>(
    []
  );
  const [studentFollowUps, setStudentFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableFollowUps, setAvailableFollowUps] = useState<number[]>([]);

  // Initialize form
  const form = useForm<z.infer<typeof followUpFormSchema>>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      details: "",
      type: "",
      author: "",
    },
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/students?studentId=${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch student data: ${response.statusText}`
          );
        }
        const data = await response.json();

        // Set local state directly, no need for merging
        setStudent(data.student);
        setStudentInfractions(data.infractions);
        setStudentFollowUps(data.followUps);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id, fetchData]);

  // Handle infraction selection for follow-up (modified for details)
  const handleInfractionSelect = (infractionId: string) => {
    form.setValue("infractionId", infractionId);

    // Get existing follow-ups for this infraction
    const existingFollowUps = studentFollowUps.filter(
      (f) => f.infractionId === infractionId
    );
    const existingNumbers = existingFollowUps.map((f) => f.followUpNumber);

    // Determine available follow-up numbers (1, 2, 3 minus existing ones)
    const available = [1, 2, 3].filter((num) => !existingNumbers.includes(num));
    setAvailableFollowUps(available);

    if (available.length > 0) {
      form.setValue("followUpNumber", available[0].toString());
    }

    // Find the selected infraction
    const selectedInfraction = studentInfractions.find(
      (inf) => inf.id === infractionId
    );
    if (selectedInfraction) {
      // Find the corresponding student

      form.setValue("type", selectedInfraction.type);
      form.setValue("author", student?.name || "Unknown");
    }

    setDialogOpen(true);
  };

  // Handle follow-up form submission (modified for details)
  const handleFollowUpSubmit = (values: z.infer<typeof followUpFormSchema>) => {
    const newFollowUp: Omit<FollowUp, "id"> = {
      // Omit the 'id'
      infractionId: values.infractionId,
      followUpNumber: Number.parseInt(values.followUpNumber),
      date: values.date,
      details: values.details, // Include details
      type: values.type,
      author: values.author,
    };

    addFollowUp(newFollowUp)
      .then(() => {
        // Fetch the latest student data.
        fetchData();
      })
      .catch((error) => {
        // Handle error (optional)
        console.error("Failed to add follow-up", error);
      });

    form.reset({
      infractionId: "",
      followUpNumber: "",
      date: new Date().toISOString().split("T")[0],
      details: "", // Reset details
      type: "",
      author: "",
    });
    toast.success("Seguimiento agregado con exito!");
    setDialogOpen(false);
  };

  // Get student infractions and follow-ups (similar to your existing logic)

  const sortedInfractions = [...studentInfractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const getFollowUpsForInfraction = (infractionId: string) => {
    return studentFollowUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (!student) {
    return <div>Student not found.</div>; // Or a not found message
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{student.name}</CardTitle>
            <CardDescription>
              ID: {student.id} | Sección: {student.grado}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sortedInfractions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Numeración</TableHead>
                  <TableHead>Seguimientos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInfractions.map((infraction) => {
                  const infractionFollowUps = getFollowUpsForInfraction(
                    infraction.id
                  );

                  return (
                    <TableRow key={infraction.id}>
                      <TableCell>{formatDate(infraction.date)}</TableCell>
                      <TableCell>{infraction.type}</TableCell>
                      <TableCell>{infraction.number}</TableCell>
                      <TableCell>
                        {infraction.type === "Tipo II" ? (
                          <div className="space-y-1">
                            {infractionFollowUps.length > 0 ? (
                              infractionFollowUps.map((followUp) => (
                                <div key={followUp.id} className="text-xs">
                                  <span className="font-medium">
                                    Seguimiento {followUp.followUpNumber}:
                                  </span>{" "}
                                  {formatDate(followUp.date)}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Sin seguimientos registrados
                              </span>
                            )}

                            {infractionFollowUps.length < 3 && (
                              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                Pendiente: {3 - infractionFollowUps.length}{" "}
                                seguimiento(s)
                              </div>
                            )}

                            {infractionFollowUps.length === 3 && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                Caso cerrado
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No aplica
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {infraction.type === "Tipo II" &&
                          infractionFollowUps.length < 3 && (
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleInfractionSelect(infraction.id)
                                }
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Seguimiento
                              </Button>
                            </DialogTrigger>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              Este estudiante no tiene faltas registradas.
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Seguimiento</DialogTitle>
            <DialogDescription>
              Complete el formulario para registrar un nuevo seguimiento.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFollowUpSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="followUpNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Seguimiento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el número de seguimiento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableFollowUps.map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Seguimiento {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDesc>
                      Cada falta requiere 3 seguimientos para cerrarse
                    </FormDesc>
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
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Details Field */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalles del Seguimiento</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese los detalles del seguimiento aquí..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="type"
                render={({ field }) => (
                  // Hidden field for storing 'type'
                  <input type="hidden" {...field} />
                )}
              />
              <FormField
                name="author"
                render={({ field }) => (
                  // Hidden field for storing 'author'
                  <input type="hidden" {...field} />
                )}
              />

              <DialogFooter>
                <Button type="submit">Guardar Seguimiento</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
