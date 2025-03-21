// src/components/settings.tsx (CORRECTED)
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import type { AlertSettings } from "@/types/dashboard"
import { SECCIONES_ACADEMICAS } from "@/lib/constantes"
import { toast } from "@/hooks/use-toast"
import useDashboardStore from "@/lib/store"

interface SettingsProps {
  alertSettings: AlertSettings
  updateAlertSettings: (settings: AlertSettings) => void
}

export function Settings({ alertSettings, updateAlertSettings }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("alerts")
   const { fetchData } =
        useDashboardStore();


  // Agrupar secciones para una mejor organización
  const sectionGroups = {
    "Mi Taller": ["Mi Taller"],
    Preschool: ["Preschool"],
    Elementary: ["Elementary"],
    "Middle School": ["Middle School"],
    "High School": ["High School"],
  }


    // Initialize form with current alert settings
  const form = useForm({
    defaultValues: {
      primary: {
        threshold: alertSettings.primary.threshold.toString(),
      },
      secondary: {
        threshold: alertSettings.secondary.threshold.toString(),
      },
      sections:  Object.fromEntries(
          Object.entries(alertSettings.sections).map(([key, value]) => [
            key,
            { primary: value.primary.toString(), secondary: value.secondary.toString() },
          ]),
        ),
    },
  })

  // Handle form submission
// Handle form submission
  const onSubmit = (data: any) => {
      const updatedSettings: AlertSettings = {
        primary: {
          threshold: Number.parseInt(data.primary.threshold),
        },
        secondary: {
          threshold: Number.parseInt(data.secondary.threshold),
        },
        sections: {},
      };
        // Map the form data to the settings structure
      for (const sectionKey in SECCIONES_ACADEMICAS) {
        const sectionName = SECCIONES_ACADEMICAS[sectionKey as keyof typeof SECCIONES_ACADEMICAS]

        // Check if settings for the section exist in the form data
        if (data.sections[sectionName]) {
          updatedSettings.sections[sectionName] = {
            primary: Number.parseInt(data.sections[sectionName].primary),
            secondary: Number.parseInt(data.sections[sectionName].secondary),
          };
        } else {
          // Provide default values if settings are missing
          updatedSettings.sections[sectionName] = { primary: 3, secondary: 5 };
        }
      }



    updateAlertSettings(updatedSettings);
    toast({
        title: "Configuración Actualizada",
        description: "La configuración de alertas ha sido actualizada exitosamente.",
    });
     // Refetch data to update UI
    fetchData();

  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="alerts">Configuración de Alertas</TabsTrigger>
        <TabsTrigger value="general">Configuración General</TabsTrigger>
      </TabsList>

      <TabsContent value="alerts">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Alertas</CardTitle>
            <CardDescription>Personalice los umbrales para las alertas de faltas disciplinarias</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Umbrales Globales</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="primary.threshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alerta Primaria (Advertencia)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="10" {...field} />
                          </FormControl>
                          <FormDescription>Número de faltas Tipo I para activar alerta de advertencia</FormDescription>
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
                            <Input type="number" min="1" max="10" {...field} />
                          </FormControl>
                          <FormDescription>Número de faltas Tipo I para activar alerta crítica</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Configuración por grupos de secciones */}
                {Object.entries(sectionGroups).map(([groupName, sections]) => (
                  <div key={groupName} className="space-y-4 mt-8">
                    <h3 className="text-lg font-medium">{groupName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure umbrales de alerta para {groupName.toLowerCase()}
                    </p>

                    {sections.map((section) => (
                      <div key={section} className="border rounded-md p-4 space-y-4">
                        <h4 className="font-medium">{section}</h4>
                        <div className = "grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`sections.${section}.primary`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Umbral de Alerta Primaria</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" max="10" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Número de faltas Tipo I para activar una alerta en esta sección
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`sections.${section}.secondary`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Umbral de Alerta Secundaria</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" max="10" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Número de faltas Tipo I para activar una alerta en esta sección
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <Button type="submit">Guardar Configuración</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Ajustes generales del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Esta sección está en desarrollo.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}