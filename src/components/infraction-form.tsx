"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Student, Infraction } from "@/types/dashboard"
import { generateId } from "@/lib/utils"

// Define schema for form validation
const formSchema = z.object({
  studentId: z.string({
    required_error: "Por favor seleccione un estudiante",
  }),
  type: z.enum(["I", "II", "III"], {
    required_error: "Por favor seleccione un tipo de falta",
  }),
  number: z.string({
    required_error: "Por favor ingrese la numeración de la falta",
  }),
  date: z.string({
    required_error: "Por favor seleccione la fecha de la falta",
  }),
})

interface InfractionFormProps {
  students: Student[]
  onSubmit: (infraction: Infraction) => void
}

export function InfractionForm({ students, onSubmit }: InfractionFormProps) {
  const [maxNumber, setMaxNumber] = useState<number>(10)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  })

  // Handle type change to update max number
  const handleTypeChange = (value: string) => {
    form.setValue("type", value as "I" | "II" | "III")
    form.setValue("number", "")

    // Set max number based on type
    switch (value) {
      case "I":
        setMaxNumber(10)
        break
      case "II":
        setMaxNumber(8)
        break
      case "III":
        setMaxNumber(5)
        break
      default:
        setMaxNumber(10)
    }
  }

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const newInfraction: Infraction = {
      id: generateId(),
      studentId: values.studentId,
      type: values.type,
      number: values.number,
      date: values.date,
    }

    onSubmit(newInfraction)
    form.reset({
      studentId: "",
      type: "",
      number: "",
      date: new Date().toISOString().split("T")[0],
    })
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
              <Select onValueChange={field.onChange} value={field.value}>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Falta</FormLabel>
                <Select onValueChange={handleTypeChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="I">Tipo I (Leve)</SelectItem>
                    <SelectItem value="II">Tipo II (Moderada)</SelectItem>
                    <SelectItem value="III">Tipo III (Grave)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Tipo II requiere seguimientos posteriores</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numeración</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("type")}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la numeración" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: maxNumber }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Número específico de la falta</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
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

        <Button type="submit" className="w-full">
          Registrar Falta
        </Button>
      </form>
    </Form>
  )
}

