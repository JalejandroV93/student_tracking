import { Control } from "react-hook-form";
import { SettingsFormData } from "./validation/schemas";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface SectionThresholdItemProps {
  control: Control<SettingsFormData>;
  sectionName: string;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export function SectionThresholdItem({ 
  control, 
  sectionName, 
  index, 
  errors 
}: SectionThresholdItemProps) {
  const hasError = 
    !!errors?.sections?.[sectionName]?.primary?.message ||
    !!errors?.sections?.[sectionName]?.secondary?.message;
  
  return (
    <AccordionItem 
      value={`section-${index}`} 
      className="border rounded-lg mb-3"
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="font-medium">{sectionName}</div>
          {hasError && (
            <Badge variant="destructive" className="mr-2">
              Error
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid gap-6 md:grid-cols-2 pt-2">
          <FormField
            control={control}
            name={`sections.${sectionName}.primary`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Advertencia</Badge>
                    Umbral Primario
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || "")}
                    value={field.value || ""}
                    placeholder="Ej: 2"
                  />
                </FormControl>
                <FormDescription>
                  Faltas para advertencia en {sectionName}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sections.${sectionName}.secondary`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Crítica</Badge>
                    Umbral Secundario
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || "")}
                    value={field.value || ""}
                    placeholder="Ej: 4"
                  />
                </FormControl>
                <FormDescription>
                  Faltas para alerta crítica en {sectionName}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {errors?.sections?.[sectionName]?.secondary?.message && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {errors.sections[sectionName].secondary.message}
            </AlertDescription>
          </Alert>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
