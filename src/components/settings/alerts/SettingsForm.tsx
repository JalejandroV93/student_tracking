"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { settingsSchema, type SettingsFormData } from "./validation/schemas";
import { getInitialFormValues } from "./utils/formHelpers";
import { GlobalThresholds } from "./GlobalThresholds";
import { SectionThresholds } from "./SectionThresholds";
import { FormActions } from "./FormActions";
import { SuccessMessage } from "./SuccessMessage";
import type { AlertSettings } from "@/types/dashboard";

interface SettingsFormProps {
  currentSettings: AlertSettings | null;
  onSave: (updatedSettings: AlertSettings) => void;
  isSaving: boolean;
}

export function SettingsForm({
  currentSettings,
  onSave,
  isSaving,
}: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState("global");
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getInitialFormValues(currentSettings),
    mode: "onChange",
  });

  // Reset form when currentSettings changes
  useEffect(() => {
    form.reset(getInitialFormValues(currentSettings));
  }, [currentSettings, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = (data: SettingsFormData) => {
    onSave(data);
    setShowChangeSummary(true);
    setTimeout(() => setShowChangeSummary(false), 5000);
  };

  const resetForm = () => {
    form.reset(getInitialFormValues(currentSettings));
    setIsDirty(false);
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Configuración de Alertas
              {isDirty && (
                <Badge
                  variant="outline"
                  className="ml-2 text-amber-500 border-amber-500"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" /> Cambios sin guardar
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              Define los umbrales que activan alertas de advertencia (primaria)
              y críticas (secundaria) basadas en faltas de Tipo I.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {showChangeSummary && <SuccessMessage />}

      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="global" className="text-sm">
                  Umbrales Globales
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-sm">
                  Umbrales por Sección{" "}
                  {hasErrors && <span className="ml-1 text-red-500">•</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="space-y-4">
                <GlobalThresholds
                  control={form.control}
                  errors={form.formState.errors}
                />
              </TabsContent>

              <TabsContent value="sections" className="space-y-6">
                <SectionThresholds
                  control={form.control}
                  errors={form.formState.errors}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="p-0">
        <FormActions
          isSaving={isSaving}
          isDirty={isDirty}
          isValid={form.formState.isValid}
          isNewConfig={currentSettings === null}
          onReset={resetForm}
          onSubmit={form.handleSubmit(handleSubmit)}
        />
      </CardFooter>
    </Card>
  );
}
