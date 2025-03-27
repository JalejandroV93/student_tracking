// src/components/settings/SettingsForm.tsx
"use client"

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AlertSettings } from "@/types/dashboard"
import { SECCIONES_ACADEMICAS } from "@/lib/constantes"
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  currentSettings: AlertSettings;
  onSave: (updatedSettings: AlertSettings) => Promise<void>; // Expects the update function from the store
  isSaving: boolean;
}

// Define Zod schema for validation
const sectionThresholdSchema = z.object({
    primary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    secondary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
}).refine(data => data.secondary > data.primary, {
    message: "El umbral secundario debe ser mayor que el primario",
    path: ["secondary"], // Point error to secondary field
});

const settingsSchema = z.object({
    primary: z.object({
        threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    secondary: z.object({
        threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    sections: z.record(z.string(), sectionThresholdSchema) // Validate each section
}).refine(data => data.secondary.threshold > data.primary.threshold, {
    message: "El umbral secundario global debe ser mayor que el primario global",
    path: ["secondary", "threshold"],
});


// Type for form data based on schema
type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm({ currentSettings, onSave, isSaving }: SettingsFormProps) {

  // Initialize form with current settings, converting numbers to strings for input fields
  const form = useForm<SettingsFormData>({
      resolver: zodResolver(settingsSchema),
      // Use defaultValues which updates only on first render or reset
      defaultValues: {
            primary: { threshold: currentSettings.primary.threshold },
            secondary: { threshold: currentSettings.secondary.threshold },
            sections: Object.entries(currentSettings.sections).reduce((acc, [key, value]) => {
                acc[key] = { primary: value.primary, secondary: value.secondary };
                return acc;
            }, {} as Record<string, { primary: number; secondary: number }>),
        },
  });

   // Effect to reset form if currentSettings prop changes (e.g., after initial fetch)
   useEffect(() => {
     form.reset({
        primary: { threshold: currentSettings.primary.threshold },
        secondary: { threshold: currentSettings.secondary.threshold },
        sections: Object.entries(currentSettings.sections).reduce((acc, [key, value]) => {
            acc[key] = { primary: value.primary, secondary: value.secondary };
            return acc;
        }, {} as Record<string, { primary: number; secondary: number }>),
     });
   }, [currentSettings, form.reset]);


  // Handle form submission - data is already validated by Zod
  const onSubmit = async (data: SettingsFormData) => {
     // Data here is typed and validated according to settingsSchema
     // The structure matches AlertSettings directly now due to coerce
    await onSave(data);
    // No need to call fetchData here, store handles it or UI updates optimistically
  };

  // Get section names for rendering
  const sectionNames = Object.values(SECCIONES_ACADEMICAS);

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Umbrales de Alerta</CardTitle> */}
        <CardDescription>
          Define cuántas faltas de Tipo I activan una alerta de advertencia (primaria) o crítica (secundaria). Puedes establecer umbrales globales y anularlos por sección.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8"> {/* Increased spacing */}
            {/* Global Thresholds */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Umbrales Globales</h3>
              <p className="text-sm text-muted-foreground">Aplicados si no se definen umbrales específicos por sección.</p>
              <div className="grid gap-6 md:grid-cols-2"> {/* Increased gap */}
                <FormField
                  control={form.control}
                  name="primary.threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alerta Primaria (Advertencia)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormDescription>Nº de faltas Tipo I.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondary.threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alerta Secundaria (Crítica)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormDescription>Nº de faltas Tipo I.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               {/* Display refinement error for global thresholds */}
               {form.formState.errors.secondary?.threshold && form.formState.errors.secondary.threshold.type === 'refinement' && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.secondary.threshold.message}</p>
               )}
                 {form.formState.errors.root?.message && ( // For general object-level refinements
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                )}
            </div>

            {/* Section Specific Thresholds */}
            <div className="space-y-6">
                 <h3 className="text-lg font-semibold leading-none tracking-tight">Umbrales por Sección (Opcional)</h3>
                 <p className="text-sm text-muted-foreground">Define umbrales específicos para anular los globales.</p>
                 <div className="grid gap-6 md:grid-cols-2">
                    {sectionNames.map((sectionName) => (
                      <div key={sectionName} className="border rounded-lg p-4 space-y-4 bg-muted/30"> {/* Subtle background */}
                        <h4 className="font-semibold">{sectionName}</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                           <FormField
                                control={form.control}
                                name={`sections.${sectionName}.primary`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Alerta Primaria</FormLabel>
                                    <FormControl>
                                    <Input type="number" min="1" max="20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`sections.${sectionName}.secondary`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Alerta Secundaria</FormLabel>
                                    <FormControl>
                                    <Input type="number" min="1" max="20" {...field} />
                                    </FormControl>
                                     {/* Display refinement error for section */}
                                    <FormMessage />
                                     {form.formState.errors.sections?.[sectionName]?.secondary?.type === 'refinement' && (
                                        <p className="text-sm font-medium text-destructive pt-1">{form.formState.errors.sections?.[sectionName]?.secondary?.message}</p>
                                     )}
                                </FormItem>
                                )}
                            />
                        </div>
                      </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                 <Button type="submit" disabled={isSaving}>
                   {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Guardar Cambios
                 </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}