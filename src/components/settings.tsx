"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import type { AlertSettings } from "@/types/dashboard"

interface SettingsProps {
  alertSettings: AlertSettings
  updateAlertSettings: (settings: AlertSettings) => void
}

export function Settings({ alertSettings, updateAlertSettings }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("alerts")

  // Agrupar secciones para una mejor organización
  const sectionGroups = {
    Preescolar: ["Preescolar"],
    Primaria: ["Primaria 5A", "Primaria 5B"],
    Secundaria: ["Secundaria 1A", "Secundaria 1B", "Secundaria 2A"],
    Preparatoria: ["Preparatoria"],
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
      sections: {
        ...Object.fromEntries(
          Object.entries(alertSettings.sections).map(([key, value]) => [
            key,
            { primary: value.primary.toString(), secondary: value.secondary.toString() },
          ]),
        ),
      },
    },
  })

  // Handle form submission
  const onSubmit = (data: any) => {
    const updatedSettings: AlertSettings = {
      primary: {
        threshold: Number.parseInt(data.primary.threshold),
      },
      secondary: {
        threshold: Number.parseInt(data.secondary.threshold),
      },
      sections: Object.fromEntries(
        Object.entries(data.sections).map(([key, value]: [string, any]) => [
          key,
          { primary: Number.parseInt(value.primary), secondary: Number.parseInt(value.secondary) },
        ]),
      ),
    }

    updateAlertSettings(updatedSettings)
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
                        <div>
                          <FormField
                            control={form.control}
                            name={`sections.${section}.primary`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Umbral de Alerta</FormLabel>
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

