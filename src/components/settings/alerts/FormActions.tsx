import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Save } from "lucide-react";

interface FormActionsProps {
  isSaving: boolean;
  isDirty: boolean;
  isValid: boolean;
  isNewConfig: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function FormActions({ 
  isSaving, 
  isDirty, 
  isValid, 
  isNewConfig, 
  onReset, 
  onSubmit 
}: FormActionsProps) {
  return (
    <div className="flex justify-between border-t bg-muted/20 px-6 gap-2 py-4">
      <Button
        variant="outline"
        onClick={onReset}
        disabled={isSaving || !isDirty}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Restablecer
      </Button>
      <Button
        onClick={onSubmit}
        disabled={isSaving || !isDirty || !isValid}
        className="gap-2"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isNewConfig ? "Guardar Configuración Inicial" : "Guardar Cambios"}
      </Button>
    </div>
  );
}