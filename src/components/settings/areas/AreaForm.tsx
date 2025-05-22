"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export interface Area {
  id: number;
  name: string;
  code: string;
}

export interface AreaFormData {
  name: string;
  code: string;
}

interface AreaFormProps {
  initialData?: Area;
  onSubmit: (data: AreaFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AreaForm: React.FC<AreaFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
    } else {
      setName("");
      setCode("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Nombre y Código no pueden estar vacíos.");
      return;
    }
    await onSubmit({ name, code });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="area-name">Nombre del Área</Label>
        <Input
          id="area-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej. Primaria"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="area-code">Código del Área</Label>
        <Input
          id="area-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ej. PRIMARY"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting
            ? initialData
              ? "Guardando..."
              : "Creando..."
            : initialData
            ? "Guardar Cambios"
            : "Crear Área"}
        </Button>
      </div>
    </form>
  );
};

export default AreaForm;
