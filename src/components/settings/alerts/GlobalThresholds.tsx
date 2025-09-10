import { Control } from "react-hook-form";
import { SettingsFormData } from "./validation/schemas";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface GlobalThresholdsProps {
  control: Control<SettingsFormData>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export function GlobalThresholds({ control, errors }: GlobalThresholdsProps) {
  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <span>Umbrales Globales</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Estos umbrales se aplicarán a todas las secciones que no tengan configuración específica.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <FormField
          control={control}
          name="primary.threshold"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Advertencia</Badge>
                  Alerta Primaria
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  className="text-lg"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                  value={field.value || ""}
                  placeholder="Ej: 3"
                />
              </FormControl>
              <FormDescription>
                Cantidad de faltas Tipo I que activan una advertencia.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="secondary.threshold"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Crítica</Badge>
                  Alerta Secundaria
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  className="text-lg"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                  value={field.value || ""}
                  placeholder="Ej: 5"
                />
              </FormControl>
              <FormDescription>
                Cantidad de faltas Tipo I que activan una alerta crítica.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {errors.secondary?.threshold?.message && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            {errors.secondary.threshold.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}