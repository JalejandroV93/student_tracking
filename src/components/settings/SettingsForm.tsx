// src/components/settings/SettingsForm.tsx
"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Added CardTitle
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AlertSettings } from "@/types/dashboard";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  currentSettings: AlertSettings | null; // Accept null
  onSave: (updatedSettings: AlertSettings) => Promise<void>;
  isSaving: boolean;
}

// Zod schema remains the same
const sectionThresholdSchema = z
  .object({
    primary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    secondary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
  })
  .refine((data) => data.secondary > data.primary, {
    message: "El umbral secundario debe ser mayor que el primario",
    path: ["secondary"],
  });

const settingsSchema = z
  .object({
    primary: z.object({
      threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    secondary: z.object({
      threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    sections: z.record(z.string(), sectionThresholdSchema),
  })
  .refine((data) => data.secondary.threshold > data.primary.threshold, {
    message:
      "El umbral secundario global debe ser mayor que el primario global",
    path: ["secondary", "threshold"],
  });

type SettingsFormData = z.infer<typeof settingsSchema>;

// Helper to get initial form values (empty/defaults for first config)
const getInitialFormValues = (
  settings: AlertSettings | null
): SettingsFormData => {
  const initialSectionValues = Object.values(SECCIONES_ACADEMICAS).reduce(
    (acc, sectionName) => {
      acc[sectionName] = {
        primary: settings?.sections[sectionName]?.primary ?? 3, // Sensible default for first input
        secondary: settings?.sections[sectionName]?.secondary ?? 5, // Sensible default for first input
      };
      return acc;
    },
    {} as Record<string, { primary: number; secondary: number }>
  );

  return {
    primary: { threshold: settings?.primary.threshold ?? 3 }, // Sensible default
    secondary: { threshold: settings?.secondary.threshold ?? 5 }, // Sensible default
    sections: initialSectionValues,
  };
};

export function SettingsForm({
  currentSettings,
  onSave,
  isSaving,
}: SettingsFormProps) {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    // Initialize based on whether currentSettings exist
    defaultValues: getInitialFormValues(currentSettings),
  });

  // Effect to reset form only if currentSettings prop *changes* AND is not null
  useEffect(() => {
    if (currentSettings) {
      // Only reset if we receive actual settings
      form.reset(getInitialFormValues(currentSettings));
    }
    // If currentSettings becomes null (e.g., error during fetch), don't reset to empty, keep last valid state or initial defaults
  }, [currentSettings, form]); // Depend on currentSettings

  const onSubmit = async (data: SettingsFormData) => {
    await onSave(data); // onSave comes from the page, which calls the store's updateSettings
  };

  const sectionNames = Object.values(SECCIONES_ACADEMICAS);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir Umbrales de Alerta</CardTitle> {/* Added Title */}
        <CardDescription>
          Define cuántas faltas de Tipo I activan una alerta de advertencia
          (primaria) o crítica (secundaria). Puedes establecer umbrales globales
          y anularlos por sección si es necesario. Los cambios se aplicarán a
          futuros cálculos de alerta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Global Thresholds */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Umbrales Globales (Requerido)
              </h3>
              <p className="text-sm text-muted-foreground">
                Se aplicarán a todas las secciones a menos que se especifique lo
                contrario abajo.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="primary.threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alerta Primaria (Advertencia)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          placeholder="Ej: 3"
                        />
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
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          {...field}
                          placeholder="Ej: 5"
                        />
                      </FormControl>
                      <FormDescription>Nº de faltas Tipo I.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {form.formState.errors.secondary?.threshold?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.secondary.threshold.message}
                </p>
              )}
            </div>

            {/* Section Specific Thresholds */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                Umbrales por Sección (Opcional)
              </h3>
              <p className="text-sm text-muted-foreground">
                Define umbrales específicos aquí para anular los globales para
                secciones particulares.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                {sectionNames.map((sectionName) => (
                  <div
                    key={sectionName}
                    className="border rounded-lg p-4 space-y-4 bg-muted/30"
                  >
                    <h4 className="font-semibold">{sectionName}</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        // IMPORTANT: Register the field correctly for react-hook-form
                        name={`sections.${sectionName}.primary`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Primaria Específica
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                {...field}
                                placeholder="Ej: 2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        // IMPORTANT: Register the field correctly
                        name={`sections.${sectionName}.secondary`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Secundaria Específica
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                {...field}
                                placeholder="Ej: 4"
                              />
                            </FormControl>
                            <FormMessage />
                            {/* Display refinement error specific to this section */}
                            {form.formState.errors.sections?.[sectionName]
                              ?.secondary?.message && (
                              <p className="text-sm font-medium text-destructive pt-1">
                                {
                                  form.formState.errors.sections?.[sectionName]
                                    ?.secondary?.message
                                }
                              </p>
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
                {currentSettings === null
                  ? "Guardar Configuración Inicial"
                  : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
