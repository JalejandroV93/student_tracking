"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student, Infraction, FollowUp } from "@/types/dashboard"
import { generateId } from "@/lib/utils"

// Define schema for form validation
const formSchema = z.object({
  studentId: z.string({
    required_error: "Por favor seleccione un estudiante",
  }),
  infractionId: z.string({
    required_error: "Por favor seleccione una falta",
  }),
  followUpNumber: z.string({
    required_error: "Por favor seleccione el número de seguimiento",
  }),
  date: z.string({
    required_error: "Por favor seleccione la fecha del seguimiento",
  }),
})

interface FollowUpFormProps {
  students: Student[]
  infractions: Infraction[]
  followUps: FollowUp[]
  onSubmit: (followUp: FollowUp) => void
}

export function FollowUpForm({ students, infractions, followUps, onSubmit }: FollowUpFormProps) {
  const [filteredInfractions, setFilteredInfractions] = useState<Infraction[]>([])
  const [availableFollowUps, setAvailableFollowUps] = useState<number[]>([])

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  })

  // Handle student change
  const handleStudentChange = (studentId: string) => {
    form.setValue("studentId", studentId)
    form.setValue("infractionId", "")
    form.setValue("followUpNumber", "")

    // Filter infractions for selected student
    const studentInfractions = infractions.filter((inf) => inf.studentId === studentId)
    setFilteredInfractions(studentInfractions)
  }

  // Handle infraction change
  const handleInfractionChange = (infractionId: string) => {
    form.setValue("infractionId", infractionId)
    form.setValue("followUpNumber", "")

    // Get existing follow-ups for this infraction
    const existingFollowUps = followUps.filter((f) => f.infractionId === infractionId)
    const existingNumbers = existingFollowUps.map((f) => f.followUpNumber)

    // Determine available follow-up numbers (1, 2, 3 minus existing ones)
    const available = [1, 2, 3].filter((num) => !existingNumbers.includes(num))
    setAvailableFollowUps(available)
  }

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const newFollowUp: FollowUp = {
      id: generateId(),
      infractionId: values.infractionId,
      followUpNumber: Number.parseInt(values.followUpNumber),
      date: values.date,
    }

    onSubmit(newFollowUp)
    form.reset({
      studentId: "",
      infractionId: "",
      followUpNumber: "",
      date: new Date().toISOString().split("T")[0],
    })

    setFilteredInfractions([])
    setAvailableFollowUps([])
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estudiante</FormLabel>
              <Select onValueChange={handleStudentChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estudiante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="infractionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Falta</FormLabel>
              <Select
                onValueChange={handleInfractionChange}
                value={field.value}
                disabled={filteredInfractions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una falta Tipo II" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredInfractions.map((infraction) => (
                    <SelectItem key={infraction.id} value={infraction.id}>
                      Tipo II - {infraction.number} ({new Date(infraction.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Solo faltas de Tipo II requieren seguimientos</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="followUpNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Seguimiento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={availableFollowUps.length === 0}>
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

        <Button type="submit" className="w-full" disabled={availableFollowUps.length === 0}>
          Registrar Seguimiento
        </Button>
      </form>
    </Form>
  )
}

