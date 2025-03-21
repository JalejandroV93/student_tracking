// src/components/student-history.tsx (Modified)
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Student, Infraction, FollowUp } from "@/types/dashboard"
import { formatDate, generateId } from "@/lib/utils"
import { Search, Plus, Loader2 } from "lucide-react"
import { Textarea } from "./ui/textarea"

interface StudentHistoryProps {
  students: Student[]
  infractions: Infraction[]
  followUps: FollowUp[]
  selectedStudentId: string | null
  onSelectStudent: (studentId: string | null) => void
  addFollowUp: (followUp: FollowUp) => void
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
  details: z.string({ // Added details field
    required_error: "Por favor ingrese los detalles del seguimiento",
  }).min(10, "Los detalles deben tener al menos 10 caracteres."),
  type: z.string(),
  author: z.string()
});


export function StudentHistory({
  students,
  infractions,
  followUps,
  selectedStudentId,
  onSelectStudent,
  addFollowUp,
}: StudentHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableFollowUps, setAvailableFollowUps] = useState<number[]>([])
  const [isLoadingStudent, setIsLoadingStudent] = useState(false); // Loading indicator

  // Initialize form
  const form = useForm<z.infer<typeof followUpFormSchema>>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      details: "",
      type: "",
      author: "",
    },
  })

  // Update filtered students when search query changes (no change)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students)
       setSelectedStudent(null); // Clear selected student
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) => student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, students])

  // **CORRECTED STUDENT SELECTION LOGIC**
    useEffect(() => {
        // If a selectedStudentId is provided via props (e.g., from navigation)
        if (selectedStudentId) {
            setIsLoadingStudent(true);
            const student = students.find((s) => s.id === selectedStudentId);
            if (student) {
                setSelectedStudent(student);
                setSearchQuery(student.name); // Update search input
                setIsLoadingStudent(false);
            } else {
                // Handle case where student is not found (optional)
                console.warn(`Student with ID ${selectedStudentId} not found.`);
                setIsLoadingStudent(false);
            }
        } else {
          setSelectedStudent(null);
        }
    }, [selectedStudentId, students]);

  // Handle student selection from search results (modified)
  const handleSelectStudent = (student: Student) => {
      setSelectedStudent(student)
      onSelectStudent(student.id); // Keep this to update URL
      setSearchQuery(student.name) // Update search bar
  }


  // Get student infractions (no change)
  const studentInfractions = selectedStudent ? infractions.filter((inf) => inf.studentId === selectedStudent.id) : []
// Sort by date (newest first)
  const sortedInfractions = [...studentInfractions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const getFollowUpsForInfraction = (infractionId: string) => {
     // No change
    return followUps
      .filter((followUp) => followUp.infractionId === infractionId)
      .sort((a, b) => a.followUpNumber - b.followUpNumber)
  }

  // Handle infraction selection for follow-up (modified for details)
  const handleInfractionSelect = (infractionId: string) => {
    form.setValue("infractionId", infractionId)

    // Get existing follow-ups for this infraction
    const existingFollowUps = followUps.filter((f) => f.infractionId === infractionId)
    const existingNumbers = existingFollowUps.map((f) => f.followUpNumber)

    // Determine available follow-up numbers (1, 2, 3 minus existing ones)
    const available = [1, 2, 3].filter((num) => !existingNumbers.includes(num))
    setAvailableFollowUps(available)

    if (available.length > 0) {
      form.setValue("followUpNumber", available[0].toString())
    }

     // Find the selected infraction
    const selectedInfraction = infractions.find((inf) => inf.id === infractionId);
    if (selectedInfraction) {
      // Find the corresponding student
      const student = students.find((s) => s.id === selectedInfraction.studentId);
        form.setValue("type", selectedInfraction.type);
        form.setValue("author", student?.name || 'Unknown');
    }

    setDialogOpen(true)

  }


  // Handle follow-up form submission (modified for details)
  const handleFollowUpSubmit = (values: z.infer<typeof followUpFormSchema>) => {
    const newFollowUp: FollowUp = {
      id: generateId(),
      infractionId: values.infractionId,
      followUpNumber: Number.parseInt(values.followUpNumber),
      date: values.date,
      details: values.details, // Include details
      type: values.type,
      author: values.author
    };

    addFollowUp(newFollowUp);
    form.reset({
      infractionId: "",
      followUpNumber: "",
      date: new Date().toISOString().split("T")[0],
      details: "", // Reset details
      type: "",
      author: ""
    });

    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Estudiante</CardTitle>
          <CardDescription>Busque un estudiante por nombre o ID para ver su historial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar estudiante..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && (  // Only show if there's a search query
            <div className="mt-2 border rounded-md">
              {filteredStudents.length > 0 ? (
                <ul className="py-2 max-h-[200px] overflow-auto">
                  {filteredStudents.map((student) => (
                    <li
                      key={student.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleSelectStudent(student)}
                    >
                      {student.name} ({student.id}) - {student.section}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-muted-foreground text-center">No se encontraron estudiantes</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{selectedStudent.name}</CardTitle>
              <CardDescription>
                ID: {selectedStudent.id} | Sección: {selectedStudent.section}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudent(null)
                onSelectStudent(null)
                setSearchQuery("")
              }}
            >
              Limpiar
            </Button>
          </CardHeader>
           <CardContent>
            {isLoadingStudent ? ( // Show loading indicator
                <div className="flex items-center justify-center h-20">
                    <Loader2 className="animate-spin h-6 w-6" />
                </div>
            ) : sortedInfractions.length > 0 ? (
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
                    const infractionFollowUps = getFollowUpsForInfraction(infraction.id)

                    return (
                      <TableRow key={infraction.id}>
                        <TableCell>{formatDate(infraction.date)}</TableCell>
                        <TableCell>Tipo {infraction.type}</TableCell>
                        <TableCell>{infraction.number}</TableCell>
                        <TableCell>
                          {infraction.type === "II" ? (
                            <div className="space-y-1">
                              {infractionFollowUps.length > 0 ? (
                                infractionFollowUps.map((followUp) => (
                                  <div key={followUp.id} className="text-xs">
                                    <span className="font-medium">Seguimiento {followUp.followUpNumber}:</span>{" "}
                                    {formatDate(followUp.date)}
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin seguimientos registrados</span>
                              )}

                              {infractionFollowUps.length < 3 && (
                                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                  Pendiente: {3 - infractionFollowUps.length} seguimiento(s)
                                </div>
                              )}

                              {infractionFollowUps.length === 3 && (
                                <div className="text-xs text-green-600 dark:text-green-400">Caso cerrado</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No aplica</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {infraction.type === "II" && infractionFollowUps.length < 3 && (
                            
                            <Button variant="outline" size="sm" onClick={() => handleInfractionSelect(infraction.id)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Seguimiento
                            </Button>
                            
                          )}
                        </TableCell>
                      </TableRow>
                    )
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Seguimiento</DialogTitle>
            <DialogDescription>Complete el formulario para registrar un nuevo seguimiento.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFollowUpSubmit)} className="space-y-4">
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
                    <FormDescription>Cada falta requiere 3 seguimientos para cerrarse</FormDescription>
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
  )
}