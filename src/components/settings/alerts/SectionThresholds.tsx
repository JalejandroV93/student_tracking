import { Control } from "react-hook-form";
import { SettingsFormData } from "./validation/schemas";
import { Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Accordion } from "@/components/ui/accordion";
import { SectionThresholdItem } from "./SectionThresholdItem";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";

interface SectionThresholdsProps {
  control: Control<SettingsFormData>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export function SectionThresholds({ control, errors }: SectionThresholdsProps) {
  const sectionNames = Object.values(SECCIONES_ACADEMICAS);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <span>Configuración por Sección</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Los valores específicos aquí anularán los umbrales globales para cada sección particular.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Anula los umbrales globales para secciones específicas si es necesario.
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {sectionNames.map((sectionName, index) => (
          <SectionThresholdItem
            key={sectionName}
            control={control}
            sectionName={sectionName}
            index={index}
            errors={errors}
          />
        ))}
      </Accordion>
    </div>
  );
}